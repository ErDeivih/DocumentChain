import { getContracts, provider } from '../config/blockchain';
import { FlowLogger, FlowContext, logger } from '../utils/logger';
import notificationService, { NotificationType } from './notificationService';
import WebSocketService from './webSocketService';
import { normalizeEthereumAddress } from '../utils/ethereum';
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Usar cliente base de Prisma directamente para evitar problemas de tipado con extensiones
const prisma = new PrismaClient();

/**
 * EventListenerService - Sincronización Blockchain → BD
 * 
 * Arquitectura de separación BD/Blockchain:
 * ==========================================
 * 
 * BASE DE DATOS (privado, mutable):
 * - Metadatos privados: filename, size, mimeType, encryptedPath
 * - Datos de usuario: email, profilePicture, passwordHash, 2FA secrets
 * - Relaciones: userId, folderId
 * - Estados internos: blockchainStatus, blockchainRetries
 * - Notificaciones, preferencias, sesiones
 * 
 * BLOCKCHAIN (público, inmutable):
 * - Metadatos públicos: fileHash, owner address, timestamp
 * - Integridad: contentCid (IPFS), documentHash
 * - Autenticidad: firmante, signature, blockNumber, transactionHash
 * - Acceso: permissions (address → canView/canEdit)
 * - Auditoría: event logs inmutables
 * 
 * FLUJO DE SINCRONIZACIÓN:
 * 1. Backend guarda en BD con blockchainStatus: 'PENDING'
 * 2. Backend envía transacción al blockchain
 * 3. Blockchain emite evento al confirmar
 * 4. EventListener captura evento
 * 5. EventListener actualiza BD: blockchainStatus: 'CONFIRMED', blockNumber, txHash
 * 6. EventListener envía notificación al usuario
 * 
 * ⚠️ IMPORTANTE: 
 * - NO duplicar datos: filename, size, email NUNCA en blockchain
 * - Blockchain solo para INTEGRIDAD + AUTENTICIDAD + ACCESO
 * - BD como fuente de verdad para metadatos privados
 */
/**
 * Servicio de escucha y sincronización de eventos desde blockchain hacia la base de datos.
 * Mantiene la coherencia entre el estado on-chain y el estado off-chain mediante el procesamiento
 * de logs de eventos del contrato DocumentRegistry.
 */
class EventListenerService {
  private isListening = false;
  private flowLogger: FlowLogger;
  
  constructor() {
    this.flowLogger = new FlowLogger(FlowContext.BLOCKCHAIN);
  }
  
  /**
   * Iniciar listeners de eventos
   * 
   * Escucha:
   * - DocumentCreated: documento registrado en blockchain
   * - DocumentVersioned: nueva versión de documento
   * - DocumentDeleted: documento eliminado
   * - PermissionGranted: acceso compartido concedido
   * - PermissionRevoked: acceso compartido revocado
   * - DocumentSigned: firma digital añadida
   */
  async start(): Promise<void> {
    if (this.isListening) {
      return;
    }
    
    const flowId = this.flowLogger.start('START_EVENT_LISTENERS', {
      action: 'Inicializando listeners de eventos blockchain',
    });
    
    try {
      const contracts = getContracts();
      
      // Sincronizar eventos históricos primero
      await this.syncHistoricalEvents();
      
      // Registrar listeners en tiempo real
      
      // 1. DocumentCreated - Documento registrado
      contracts.documentRegistry.on('DocumentCreated', async (
        docId: string,
        owner: string,
        ipfsCid: string, // Nuevo contrato solo tiene ipfsCid como 3er parámetro
        timestamp: bigint,
        event: any
      ) => {
        await this.handleDocumentCreated({
          docId,
          owner,
          fileHash: ipfsCid, // Mantener compatibilidad con handler
          contentCid: ipfsCid,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 2. VersionCreated - Nueva versión
      contracts.documentRegistry.on('VersionCreated', async (
        docId: string,
        versionNumber: bigint,
        ipfsCid: string,
        createdBy: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleDocumentVersioned({
          docId,
          versionNumber: Number(versionNumber),
          ipfsCid,
          createdBy,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 3. DocumentShared - Compartir acceso (reemplaza PermissionGranted)
      contracts.documentRegistry.on('DocumentShared', async (
        docId: string,
        from: string,
        to: string,
        role: number,
        timestamp: bigint,
        event: any
      ) => {
        // Mapear role número a permisos booleanos para compatibilidad
        const canView = role >= 1; // VIEWER, EDITOR, OWNER
        const canEdit = role >= 2; // EDITOR, OWNER
        
        await this.handlePermissionGranted({
          docId,
          grantedTo: to,
          canView,
          canEdit,
          grantedBy: from,
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 4. PermissionRevoked - Revocar acceso
      contracts.documentRegistry.on('PermissionRevoked', async (
        docId: string,
        user: string,
        by: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handlePermissionRevoked({
          docId,
          revokedFrom: user,
          revokedBy: by,
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 5. DocumentSigned - Firma digital
      contracts.documentRegistry.on('DocumentSigned', async (
        docId: string,
        versionNumber: bigint,
        signer: string,
        message: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleDocumentSigned({
          docId,
          versionNumber: Number(versionNumber),
          signer,
          message,
          comment: '', // El nuevo contrato no incluye comment en el evento
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 6. DocumentDeleted - Eliminación de documento
      contracts.documentRegistry.on('DocumentDeleted', async (
        docId: string,
        by: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleDocumentDeleted({
          docId,
          deletedBy: by,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 7. VersionRestored - Restaurar versión anterior
      contracts.documentRegistry.on('VersionRestored', async (
        docId: string,
        newVersionNumber: bigint,
        restoredFromVersion: bigint,
        by: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleVersionRestored({
          docId,
          newVersionNumber: Number(newVersionNumber),
          restoredFromVersion: Number(restoredFromVersion),
          by,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 8. DocumentArchived - Archivar/Desarchivar documento
      contracts.documentRegistry.on('DocumentArchived', async (
        docId: string,
        by: string,
        archived: boolean,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleDocumentArchived({
          docId,
          by,
          archived,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 9. OwnershipTransferred - Transferir propiedad de documento
      contracts.documentRegistry.on('OwnershipTransferred(bytes32,address,address,uint256)', async (
        docId: string,
        from: string,
        to: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleOwnershipTransferred({
          docId,
          from,
          to,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 10. OperationalVersionChanged - Cambiar versión operacional
      contracts.documentRegistry.on('OperationalVersionChanged', async (
        docId: string,
        oldVersion: bigint,
        newVersion: bigint,
        by: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleOperationalVersionChanged({
          docId,
          oldVersion: Number(oldVersion),
          newVersion: Number(newVersion),
          by,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 11. AdminRoleGranted - Rol de administrador otorgado
      contracts.documentRegistry.on('AdminRoleGranted', async (
        admin: string,
        by: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleAdminRoleGranted({
          admin,
          by,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });
      
      // 12. AdminRoleRevoked - Rol de administrador revocado
      contracts.documentRegistry.on('AdminRoleRevoked', async (
        admin: string,
        by: string,
        timestamp: bigint,
        event: any
      ) => {
        await this.handleAdminRoleRevoked({
          admin,
          by,
          timestamp: Number(timestamp),
          blockNumber: event.log.blockNumber,
          transactionHash: event.log.transactionHash,
        });
      });

      this.isListening = true;
      
      this.flowLogger.success({
        listeners: [
          'DocumentCreated',
          'VersionCreated',
          'DocumentShared',
          'PermissionRevoked',
          'DocumentSigned',
          'DocumentDeleted',
          'VersionRestored',
          'DocumentArchived',
          'OwnershipTransferred',
          'OperationalVersionChanged',
          'AdminRoleGranted',
          'AdminRoleRevoked',
        ],
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  
  /**
   * Detener listeners
   */
  async stop(): Promise<void> {
    if (!this.isListening) {
      return;
    }
    
    const contracts = getContracts();
    
    // All operations now use the consolidated DocumentRegistry contract
    contracts.documentRegistry.removeAllListeners();
    
    this.isListening = false;
  }

  /**
   * Liberar recursos del servicio durante el apagado del proceso
   */
  async shutdown(): Promise<void> {
    if (this.isListening) {
      await this.stop();
    }

    await prisma.$disconnect();
  }
  
  /**
   * Sincronizar eventos históricos desde última sincronización
   */
  private async syncHistoricalEvents(): Promise<void> {
    const flowId = this.flowLogger.start('SYNC_HISTORICAL_EVENTS', {
      action: 'Sincronizando eventos históricos de blockchain',
    });
    
    try {
      // Obtener último bloque sincronizado
      const lastSyncRecord = await prisma.systemStats.findFirst({
        where: { statType: 'BLOCKCHAIN_SYNC' },
        orderBy: { createdAt: 'desc' },
      });
      
      const lastSyncedBlock = lastSyncRecord?.lastSyncedBlock || 0;
      const currentBlock = await provider.getBlockNumber();
      
      if (lastSyncedBlock >= currentBlock) {
        this.flowLogger.step('Ya sincronizado', {
          lastSyncedBlock,
          currentBlock,
        });
        return;
      }
      
      this.flowLogger.step('Sincronizando bloques', {
        fromBlock: lastSyncedBlock + 1,
        toBlock: currentBlock,
        totalBlocks: currentBlock - lastSyncedBlock,
      });
      
      const contracts = getContracts();
      
      // Consultar eventos históricos
      const filter = {
        fromBlock: lastSyncedBlock + 1,
        toBlock: currentBlock,
      };
      
      // DocumentCreated
      const createdEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.DocumentCreated(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of createdEvents) {
        const args = (event as any).args;
        await this.handleDocumentCreated({
          docId: args.docId,
          owner: args.owner,
          fileHash: args.ipfsCid, // Nuevo contrato solo tiene ipfsCid
          contentCid: args.ipfsCid,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // DocumentShared (reemplaza PermissionGranted)
      const sharedEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.DocumentShared(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of sharedEvents) {
        const args = (event as any).args;
        // Mapear role número a permisos booleanos
        const canView = args.role >= 1; // VIEWER, EDITOR, OWNER
        const canEdit = args.role >= 2; // EDITOR, OWNER
        
        await this.handlePermissionGranted({
          docId: args.docId,
          grantedTo: args.to,
          canView,
          canEdit,
          grantedBy: args.from,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // DocumentDeleted
      const deletedEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.DocumentDeleted(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of deletedEvents) {
        const args = (event as any).args;
        await this.handleDocumentDeleted({
          docId: args.docId,
          deletedBy: args.by,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // VersionCreated
      const versionEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.VersionCreated(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of versionEvents) {
        const args = (event as any).args;
        await this.handleDocumentVersioned({
          docId: args.docId,
          versionNumber: Number(args.versionNumber),
          ipfsCid: args.ipfsCid,
          createdBy: args.createdBy,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // VersionRestored
      const restoredEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.VersionRestored(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of restoredEvents) {
        const args = (event as any).args;
        await this.handleVersionRestored({
          docId: args.docId,
          newVersionNumber: Number(args.newVersionNumber),
          restoredFromVersion: Number(args.restoredFromVersion),
          by: args.by,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // DocumentSigned
      const signedEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.DocumentSigned(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of signedEvents) {
        const args = (event as any).args;
        await this.handleDocumentSigned({
          docId: args.docId,
          versionNumber: Number(args.versionNumber),
          signer: args.signer,
          message: args.message,
          comment: '',
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // DocumentArchived
      const archivedEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.DocumentArchived(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of archivedEvents) {
        const args = (event as any).args;
        await this.handleDocumentArchived({
          docId: args.docId,
          by: args.by,
          archived: args.archived,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // OwnershipTransferred
      const transferredEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters['OwnershipTransferred(bytes32,address,address,uint256)'](),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of transferredEvents) {
        const args = (event as any).args;
        await this.handleOwnershipTransferred({
          docId: args.docId,
          from: args.from,
          to: args.to,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // PermissionRevoked
      const revokedEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.PermissionRevoked(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of revokedEvents) {
        const args = (event as any).args;
        await this.handlePermissionRevoked({
          docId: args.docId,
          revokedFrom: args.user,
          revokedBy: args.by,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // OperationalVersionChanged
      const operationalEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.OperationalVersionChanged(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of operationalEvents) {
        const args = (event as any).args;
        await this.handleOperationalVersionChanged({
          docId: args.docId,
          oldVersion: Number(args.oldVersion),
          newVersion: Number(args.newVersion),
          by: args.by,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // AdminRoleGranted
      const adminGrantedEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.AdminRoleGranted(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of adminGrantedEvents) {
        const args = (event as any).args;
        await this.handleAdminRoleGranted({
          admin: args.admin,
          by: args.by,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // AdminRoleRevoked
      const adminRevokedEvents = await contracts.documentRegistry.queryFilter(
        contracts.documentRegistry.filters.AdminRoleRevoked(),
        filter.fromBlock,
        filter.toBlock
      );
      
      for (const event of adminRevokedEvents) {
        const args = (event as any).args;
        await this.handleAdminRoleRevoked({
          admin: args.admin,
          by: args.by,
          timestamp: Number(args.timestamp),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        });
      }
      
      // Actualizar último bloque sincronizado
      const now = new Date();
      await prisma.systemStats.upsert({
        where: { id: lastSyncRecord?.id || 'default' },
        create: {
          id: 'default',
          statType: 'BLOCKCHAIN_SYNC',
          periodStart: now,
          periodEnd: now,
          lastSyncedBlock: currentBlock,
        },
        update: {
          lastSyncedBlock: currentBlock,
          periodEnd: now,
        },
      });
      
      this.flowLogger.success({
        fromBlock: lastSyncedBlock + 1,
        toBlock: currentBlock,
        totalEvents: createdEvents.length + sharedEvents.length + deletedEvents.length + 
                     versionEvents.length + restoredEvents.length + signedEvents.length + 
                     archivedEvents.length + transferredEvents.length + revokedEvents.length + 
                     operationalEvents.length + adminGrantedEvents.length + adminRevokedEvents.length,
        breakdown: {
          documentsCreated: createdEvents.length,
          versionsCreated: versionEvents.length,
          versionsRestored: restoredEvents.length,
          documentsShared: sharedEvents.length,
          permissionsRevoked: revokedEvents.length,
          documentsSigned: signedEvents.length,
          documentsDeleted: deletedEvents.length,
          documentsArchived: archivedEvents.length,
          ownershipsTransferred: transferredEvents.length,
          operationalVersionsChanged: operationalEvents.length,
          adminRolesGranted: adminGrantedEvents.length,
          adminRolesRevoked: adminRevokedEvents.length,
        },
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  
  /**
   * Handler: DocumentCreated
   */
  private async handleDocumentCreated(data: {
    docId: string;
    owner: string;
    fileHash: string;
    contentCid: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_DOCUMENT_CREATED', {
      docId: data.docId,
      blockNumber: data.blockNumber,
    });
    
    try {
      // Actualizar documento en BD: marcar como SYNCED
      const document = await prisma.document.update({
        where: { blockchainId: data.docId },
        data: {
          blockchainStatus: 'SYNCED',
        },
        include: { owner: true },
      });
      
      // Notificar en tiempo real al propietario
      WebSocketService.sendToUser(document.ownerId, 'document:updated', {
        type: 'CREATED',
        documentId: document.id,
      });

      // Enviar notificación al usuario
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.BLOCKCHAIN_CONFIRMED,
        title: 'Documento confirmado en blockchain',
        message: `Tu archivo "${document.name}" ha sido registrado en blockchain`,
        link: `/files/${document.id}`,
        data: {
          documentId: document.id,
          blockNumber: data.blockNumber,
          transactionHash: data.transactionHash,
        },
      });
      
      this.flowLogger.success({
        documentId: document.id,
        name: document.name,
        ownerId: document.ownerId,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Handler: DocumentVersioned
   */
  private async handleDocumentVersioned(data: {
    docId: string;
    versionNumber: number;
    ipfsCid: string;
    createdBy: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_DOCUMENT_VERSIONED', {
      docId: data.docId,
      versionNumber: data.versionNumber,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });
      
      if (!document) {
        this.flowLogger.warn('Documento no encontrado en BD', {
          blockchainId: data.docId,
        });
        return;
      }
      
      // Get wallet for creator
      const creatorWallet = await prisma.wallet.findFirst({
        where: {
          walletAddress: {
            equals: data.createdBy,
            mode: 'insensitive'
          }
        },
        include: {
          user: {
            select: {
              username: true,
              fullName: true,
            },
          },
        },
      });
      
      // Check if version already exists
      const existingVersion = await prisma.version.findFirst({
        where: {
          documentId: document.id,
          versionNumber: data.versionNumber,
        },
      });
      
      // The contract's createVersion ALWAYS sets currentVersion = newVersionNum,
      // so the new version is operational. We must reflect this in the DB
      // and demote previous versions, regardless of whether the version
      // record was pre-created by prepareVersion.
      await prisma.$transaction(async (tx) => {
        // Demote all previous versions of this document
        await tx.version.updateMany({
          where: { documentId: document.id },
          data: { isOperational: false },
        });

        if (existingVersion) {
          // Update existing version to SYNCED and operational
          await tx.version.update({
            where: { id: existingVersion.id },
            data: {
              blockchainStatus: 'SYNCED',
              ipfsCid: data.ipfsCid,
              isOperational: true,
            },
          });
        } else {
          // Create new version as operational
          await tx.version.create({
            data: {
              id: uuidv4(),
              documentId: document.id,
              userId: creatorWallet?.userId || document.ownerId,
              versionNumber: data.versionNumber,
              ipfsCid: data.ipfsCid,
              encryptedSymmetricKey: document.encryptedSymmetricKey,
              isOperational: true,
              blockchainStatus: 'SYNCED',
              blockchainTxHash: data.transactionHash,
            },
          });
        }
      });
      
      const actorName = creatorWallet?.user?.fullName?.trim() || creatorWallet?.user?.username || 'otro usuario con permisos de edición';
      const editedBySharedUser = creatorWallet?.userId && creatorWallet.userId !== document.ownerId;

      // Notificar en tiempo real al propietario y creador
      WebSocketService.sendToUser(document.ownerId, 'document:updated', {
        type: 'VERSION_CREATED',
        documentId: document.id,
        versionNumber: data.versionNumber,
      });
      if (creatorWallet?.userId && creatorWallet.userId !== document.ownerId) {
        WebSocketService.sendToUser(creatorWallet.userId, 'document:updated', {
          type: 'VERSION_CREATED',
          documentId: document.id,
          versionNumber: data.versionNumber,
        });
      }

      // Enviar notificación
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.NEW_VERSION,
        title: editedBySharedUser ? 'Nueva versión creada por un editor' : 'Nueva versión confirmada',
        message: editedBySharedUser
          ? `${actorName} ha creado la versión ${data.versionNumber} de "${document.name}".`
          : `La versión ${data.versionNumber} de "${document.name}" ha sido registrada correctamente.`,
        link: `/files/${document.id}/versions`,
        data: {
          documentId: document.id,
          versionNumber: data.versionNumber,
          blockNumber: data.blockNumber,
          actorName,
          createdBySharedUser: editedBySharedUser,
        },
      });
      
      this.flowLogger.success({
        documentId: document.id,
        versionNumber: data.versionNumber,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Handler: DocumentDeleted
   */
  private async handleDocumentDeleted(data: {
    docId: string;
    deletedBy: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_DOCUMENT_DELETED', {
      docId: data.docId,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });
      
      if (!document) {
        return;
      }
      
      await prisma.document.update({
        where: { blockchainId: data.docId },
        data: {
          isDeleted: true,
          deletedAt: new Date(data.timestamp * 1000),
          isArchived: false,
          archivedAt: null,
        },
      });
      
      // Notificar al propietario
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.FILE_DELETED,
        title: 'Documento eliminado',
        message: `"${document.name}" ha sido eliminado permanentemente del blockchain`,
        data: {
          documentId: document.id,
          blockNumber: data.blockNumber,
        },
      });
      
      this.flowLogger.success({
        documentId: document.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Handler: PermissionGranted
   */
  private async handlePermissionGranted(data: {
    docId: string;
    grantedTo: string;
    canView: boolean;
    canEdit: boolean;
    grantedBy: string;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_PERMISSION_GRANTED', {
      docId: data.docId,
      grantedTo: data.grantedTo,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });
      
      if (!document) {
        return;
      }
      
      // Buscar usuario por wallet address
      const grantedToAddress = normalizeEthereumAddress(data.grantedTo);
      const recipientUser = grantedToAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: grantedToAddress
            }
          }
        },
      }) : null;
      
      // Los shares ahora están solo en blockchain - no se actualiza DB

      // Notificar en tiempo real a las partes afectadas
      if (recipientUser?.id) {
        WebSocketService.sendToUser(recipientUser.id, 'document:updated', {
          type: 'SHARED',
          documentId: document.id,
        });
      }
      if (document.ownerId) {
        WebSocketService.sendToUser(document.ownerId, 'document:updated', {
          type: 'SHARE_CREATED',
          documentId: document.id,
        });
      }
      
      this.flowLogger.success({
        documentId: document.id,
        recipientUserId: recipientUser?.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Handler: PermissionRevoked
   */
  private async handlePermissionRevoked(data: {
    docId: string;
    revokedFrom: string;
    revokedBy: string;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_PERMISSION_REVOKED', {
      docId: data.docId,
      revokedFrom: data.revokedFrom,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
      });
      
      if (!document) {
        return;
      }

      const existingEvent = await prisma.event.findFirst({
        where: {
          documentId: document.id,
          eventType: 'SHARE_REVOKED',
          transactionHash: data.transactionHash,
        },
      });
      
      // Buscar usuario por wallet
      const revokedFromAddress = normalizeEthereumAddress(data.revokedFrom);
      const affectedUser = revokedFromAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: revokedFromAddress
            }
          }
        },
      }) : null;

      // Notificar en tiempo real al usuario afectado
      if (affectedUser?.id) {
        WebSocketService.sendToUser(affectedUser.id, 'document:updated', {
          type: 'PERMISSION_REVOKED',
          documentId: document.id,
        });
      }
      if (document.ownerId) {
        WebSocketService.sendToUser(document.ownerId, 'document:updated', {
          type: 'SHARE_REVOKED',
          documentId: document.id,
        });
      }

      if (!existingEvent) {
        await prisma.event.create({
          data: {
            eventType: 'SHARE_REVOKED',
            userId: document.ownerId,
            documentId: document.id,
            transactionHash: data.transactionHash,
            blockNumber: data.blockNumber,
            metadata: {
              recipientId: affectedUser?.id || null,
              revokedFrom: data.revokedFrom,
              revokedBy: data.revokedBy,
            },
            blockTimestamp: new Date(),
          },
        });
      }
      
      if (affectedUser && !existingEvent) {
        // Notificar revocación
        await notificationService.createNotification({
          userId: affectedUser.id,
          type: NotificationType.SHARE_REVOKED,
          title: 'Acceso revocado',
          message: `Ya no tienes acceso a "${document.name}"`,
          data: {
            documentId: document.id,
            blockNumber: data.blockNumber,
          },
        });
      }
      
      this.flowLogger.success({
        documentId: document.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Handler: DocumentSigned
   */
  private async handleDocumentSigned(data: {
    docId: string;
    versionNumber: number;
    signer: string;
    message: string;
    comment: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_DOCUMENT_SIGNED', {
      docId: data.docId,
      signer: data.signer,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });
      
      if (!document) {
        return;
      }
      
      // Find signer's wallet
      const signerAddress = normalizeEthereumAddress(data.signer);
      const signerWallet = signerAddress ? await prisma.wallet.findFirst({
        where: { 
          walletAddress: signerAddress
        },
      }) : null;
      
      // Update signature status to SYNCED
      if (signerWallet) {
        await prisma.documentSignature.updateMany({
          where: {
            documentId: document.id,
            signerWalletId: signerWallet.id,
            blockchainStatus: 'TX_SUBMITTED',
          },
          data: {
            blockchainStatus: 'SYNCED',
          },
        });
      }
      
      // Buscar firmante
      const signerUser = signerAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: signerAddress
            }
          }
        },
      }) : null;
      
      const notificationMessage = `${signerUser?.username || 'Un usuario'} firmó la versión ${data.versionNumber} de "${document.name}"`;
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: document.ownerId,
          type: NotificationType.FILE_SIGNED,
          message: notificationMessage,
          createdAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000),
          },
        },
      });

      // Notificar en tiempo real al propietario y firmante
      if (document.ownerId) {
        WebSocketService.sendToUser(document.ownerId, 'document:updated', {
          type: 'SIGNED',
          documentId: document.id,
          versionNumber: data.versionNumber,
        });
      }
      if (signerUser?.id && signerUser.id !== document.ownerId) {
        WebSocketService.sendToUser(signerUser.id, 'document:updated', {
          type: 'SIGNED',
          documentId: document.id,
          versionNumber: data.versionNumber,
        });
      }

      if (!existingNotification) {
        await notificationService.createNotification({
          userId: document.ownerId,
          type: NotificationType.FILE_SIGNED,
          title: 'Documento firmado',
          message: notificationMessage,
          link: `/app/documents/${document.id}`,
          data: {
            documentId: document.id,
            versionNumber: data.versionNumber,
            signer: data.signer,
            message: data.message,
            comment: data.comment,
            blockNumber: data.blockNumber,
            txHash: data.transactionHash,
          },
        });
      }
      
      this.flowLogger.success({
        documentId: document.id,
        signerUserId: signerUser?.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handler: VersionRestored
   */
  private async handleVersionRestored(data: {
    docId: string;
    newVersionNumber: number;
    restoredFromVersion: number;
    by: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_VERSION_RESTORED', {
      docId: data.docId,
      newVersion: data.newVersionNumber,
      restoredFrom: data.restoredFromVersion,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });
      
      if (!document) {
        return;
      }
      
      // Registrar evento
      await prisma.event.create({
        data: {
          eventType: 'VersionRestored',
          userId: document.ownerId,
          documentId: document.id,
          metadata: {
            newVersionNumber: data.newVersionNumber,
            restoredFromVersion: data.restoredFromVersion,
            restoredBy: data.by,
          },
          transactionHash: data.transactionHash,
          blockNumber: data.blockNumber,
          blockTimestamp: new Date(data.timestamp * 1000),
        },
      });
      
      // Notificar al propietario
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.FILE_UPDATED,
        title: 'Versión restaurada',
        message: `Se restauró la versión ${data.restoredFromVersion} de "${document.name}" como versión ${data.newVersionNumber}`,
        link: `/files/${document.id}`,
        data: {
          documentId: document.id,
          newVersionNumber: data.newVersionNumber,
          restoredFromVersion: data.restoredFromVersion,
          blockNumber: data.blockNumber,
        },
      });
      
      this.flowLogger.success({
        documentId: document.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handler: DocumentArchived
   */
  private async handleDocumentArchived(data: {
    docId: string;
    by: string;
    archived: boolean;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_DOCUMENT_ARCHIVED', {
      docId: data.docId,
      archived: data.archived,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });
      
      if (!document) {
        return;
      }
      
      // Actualizar estado de archivo en BD
      await prisma.document.update({
        where: { blockchainId: data.docId },
        data: {
          isArchived: data.archived,
          archivedAt: data.archived ? new Date(data.timestamp * 1000) : null,
        },
      });
      
      // Registrar evento
      await prisma.event.create({
        data: {
          eventType: data.archived ? 'DocumentArchived' : 'DocumentUnarchived',
          userId: document.ownerId,
          documentId: document.id,
          metadata: {
            archived: data.archived,
            by: data.by,
          },
          transactionHash: data.transactionHash,
          blockNumber: data.blockNumber,
          blockTimestamp: new Date(data.timestamp * 1000),
        },
      });
      
      // Notificar al propietario
      await notificationService.createNotification({
        userId: document.ownerId,
        type: data.archived ? NotificationType.FILE_ARCHIVED : NotificationType.FILE_UPDATED,
        title: data.archived ? 'Documento archivado' : 'Documento desarchivado',
        message: `"${document.name}" ha sido ${data.archived ? 'archivado' : 'desarchivado'}`,
        link: `/files/${document.id}`,
        data: {
          documentId: document.id,
          archived: data.archived,
          blockNumber: data.blockNumber,
        },
      });
      
      this.flowLogger.success({
        documentId: document.id,
        archived: data.archived,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handler: OwnershipTransferred
   */
  private async handleOwnershipTransferred(data: {
    docId: string;
    from: string;
    to: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_OWNERSHIP_TRANSFERRED', {
      docId: data.docId,
      from: data.from,
      to: data.to,
    });
    
    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });
      
      if (!document) {
        return;
      }
      
      // Buscar nuevo propietario
      const newOwnerAddress = normalizeEthereumAddress(data.to);
      const newOwner = newOwnerAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: newOwnerAddress
            }
          }
        },
      }) : null;
      
      if (!newOwner) {
        logger.warn(`Nuevo propietario no encontrado para wallet ${data.to}`);
        return;
      }
      
      // Actualizar propietario en BD
      await prisma.document.update({
        where: { blockchainId: data.docId },
        data: {
          ownerId: newOwner.id,
        },
      });
      
      // Registrar evento
      await prisma.event.create({
        data: {
          eventType: 'DocumentTransferred',
          userId: newOwner.id,
          documentId: document.id,
          metadata: {
            from: data.from,
            to: data.to,
            previousOwnerId: document.ownerId,
          },
          transactionHash: data.transactionHash,
          blockNumber: data.blockNumber,
          blockTimestamp: new Date(data.timestamp * 1000),
        },
      });
      
      // Notificar al nuevo propietario
      await notificationService.createNotification({
        userId: newOwner.id,
        type: NotificationType.FILE_SHARED,
        title: 'Propiedad transferida',
        message: `Ahora eres propietario de "${document.name}"`,
        link: `/files/${document.id}`,
        data: {
          documentId: document.id,
          previousOwner: data.from,
          blockNumber: data.blockNumber,
        },
      });
      
      // Notificar al propietario anterior
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.FILE_UPDATED,
        title: 'Propiedad transferida',
        message: `Transferiste la propiedad de "${document.name}" a ${newOwner.username}`,
        link: `/files/${document.id}`,
        data: {
          documentId: document.id,
          newOwner: data.to,
          blockNumber: data.blockNumber,
        },
      });
      
      this.flowLogger.success({
        documentId: document.id,
        newOwnerId: newOwner.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handler: OperationalVersionChanged
   */
  private async handleOperationalVersionChanged(data: {
    docId: string;
    oldVersion: number;
    newVersion: number;
    by: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_OPERATIONAL_VERSION_CHANGED', {
      docId: data.docId,
      oldVersion: data.oldVersion,
      newVersion: data.newVersion,
    });

    try {
      const document = await prisma.document.findUnique({
        where: { blockchainId: data.docId },
        include: { owner: true },
      });

      if (!document) {
        this.flowLogger.warn('Documento no encontrado en BD para sincronizar versión operacional', {
          blockchainId: data.docId,
        });
        return;
      }

      // Actualizar isOperational atómicamente según la fuente de verdad blockchain
      await prisma.$transaction(async (tx) => {
        // Desactivar versión anterior (si existe y es > 0)
        if (data.oldVersion > 0) {
          await tx.version.updateMany({
            where: { documentId: document.id, versionNumber: data.oldVersion },
            data: { isOperational: false },
          });
        }

        // Activar nueva versión
        await tx.version.updateMany({
          where: { documentId: document.id, versionNumber: data.newVersion },
          data: { isOperational: true },
        });

        // Registrar evento de auditoría
        await tx.event.create({
          data: {
            eventType: 'OperationalVersionChanged',
            userId: document.ownerId,
            documentId: document.id,
            metadata: {
              oldVersion: data.oldVersion,
              newVersion: data.newVersion,
              changedBy: data.by,
            },
            transactionHash: data.transactionHash,
            blockNumber: data.blockNumber,
            blockTimestamp: new Date(data.timestamp * 1000),
          },
        });
      });

      // Notificar al propietario
      await notificationService.createNotification({
        userId: document.ownerId,
        type: NotificationType.FILE_UPDATED,
        title: 'Versión operacional cambiada',
        message: `La versión operacional de "${document.name}" cambió de v${data.oldVersion} a v${data.newVersion}`,
        link: `/files/${document.id}`,
        data: {
          documentId: document.id,
          oldVersion: data.oldVersion,
          newVersion: data.newVersion,
          blockNumber: data.blockNumber,
        },
      });

      this.flowLogger.success({
        documentId: document.id,
      });

    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handler: AdminRoleGranted
   */
  private async handleAdminRoleGranted(data: {
    admin: string;
    by: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_ADMIN_ROLE_GRANTED', {
      admin: data.admin,
      by: data.by,
    });
    
    try {
      // Buscar usuario admin
      const adminAddress = normalizeEthereumAddress(data.admin);
      const grantedByAddress = normalizeEthereumAddress(data.by);
      const adminUser = adminAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: adminAddress
            }
          }
        },
      }) : null;
      
      // Buscar quien otorgó el rol
      const grantedByUser = grantedByAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: grantedByAddress
            }
          }
        },
      }) : null;
      
      if (adminUser) {
        // Actualizar rol a ADMIN si existe el usuario
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'ADMIN' },
        });
        
        // Notificar al nuevo admin
        await notificationService.createNotification({
          userId: adminUser.id,
          type: NotificationType.SYSTEM,
          title: 'Rol de administrador otorgado',
          message: 'Has sido designado como administrador del sistema',
          data: {
            grantedBy: data.by,
            blockNumber: data.blockNumber,
          },
        });
      }
      
      // Registrar evento global
      await prisma.event.create({
        data: {
          eventType: 'AdminRoleGranted',
          userId: grantedByUser?.id || null,
          metadata: {
            admin: data.admin,
            adminUserId: adminUser?.id,
            grantedBy: data.by,
            grantedByUserId: grantedByUser?.id,
          },
          transactionHash: data.transactionHash,
          blockNumber: data.blockNumber,
          blockTimestamp: new Date(data.timestamp * 1000),
        },
      });
      
      logger.info(`Rol de admin otorgado a ${data.admin} por ${data.by}`);
      
      this.flowLogger.success({
        admin: data.admin,
        userId: adminUser?.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handler: AdminRoleRevoked
   */
  private async handleAdminRoleRevoked(data: {
    admin: string;
    by: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }): Promise<void> {
    const flowId = this.flowLogger.start('HANDLE_ADMIN_ROLE_REVOKED', {
      admin: data.admin,
      by: data.by,
    });
    
    try {
      // Buscar usuario admin
      const revokedAdminAddress = normalizeEthereumAddress(data.admin);
      const revokedByAddress = normalizeEthereumAddress(data.by);
      const adminUser = revokedAdminAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: revokedAdminAddress
            }
          }
        },
      }) : null;
      
      // Buscar quien revocó el rol
      const revokedByUser = revokedByAddress ? await prisma.user.findFirst({
        where: { 
          wallets: {
            some: {
              walletAddress: revokedByAddress
            }
          }
        },
      }) : null;
      
      if (adminUser && adminUser.role === 'ADMIN') {
        // Revocar rol ADMIN
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'USER' },
        });
        
        // Notificar
        await notificationService.createNotification({
          userId: adminUser.id,
          type: NotificationType.SYSTEM,
          title: 'Rol de administrador revocado',
          message: 'Tu rol de administrador ha sido revocado',
          data: {
            revokedBy: data.by,
            blockNumber: data.blockNumber,
          },
        });
      }
      
      // Registrar evento global
      await prisma.event.create({
        data: {
          eventType: 'AdminRoleRevoked',
          userId: revokedByUser?.id || null,
          metadata: {
            admin: data.admin,
            adminUserId: adminUser?.id,
            revokedBy: data.by,
            revokedByUserId: revokedByUser?.id,
          },
          transactionHash: data.transactionHash,
          blockNumber: data.blockNumber,
          blockTimestamp: new Date(data.timestamp * 1000),
        },
      });
      
      logger.info(`Rol de admin revocado de ${data.admin} por ${data.by}`);
      
      this.flowLogger.success({
        admin: data.admin,
        userId: adminUser?.id,
      });
      
    } catch (error) {
      this.flowLogger.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

}

export default new EventListenerService();
