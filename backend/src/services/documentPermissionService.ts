import { getDocumentRegistryContract } from '../config/blockchain';
import logger from '../utils/logger';
import { ethers } from 'ethers';
import prisma from '../config/database';
import { BlockchainCacheService } from './blockchainCacheService';
import { BlockchainQueries } from '../lib/blockchain/queries';

/**
 * Enumeración de roles de documento.
 * Debe coincidir con el enum definido en el smart contract DocumentRegistry.
 */
export enum DocumentRole {
  NONE = 0,      // Sin acceso
  VIEWER = 1,    // Solo lectura
  EDITOR = 2,    // Lectura + escritura
  OWNER = 3      // Control total
}

/**
 * Información completa de permisos de un usuario sobre un documento.
 */
export interface DocumentPermission {
  docId: string;
  userAddress: string;
  role: DocumentRole;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
}

/**
 * Listado de usuarios con acceso a un documento.
 */
export interface DocumentUserList {
  docId: string;
  users: string[];  // Direcciones de usuarios con acceso
}

/**
 * Servicio de permisos de documentos.
 *
 * Consulta y gestiona los permisos directamente desde la blockchain.
 * La blockchain es la ÚNICA fuente de verdad para los permisos de documentos.
 *
 * No existe tabla `DocumentShare` en la base de datos;
 * todos los permisos se consultan y gestionan a través del smart contract.
 */
export class DocumentPermissionService {
  /**
   * Obtiene el rol de un usuario en un documento.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns Rol del usuario como valor del enum {@link DocumentRole}.
   */
  static async getUserRole(docId: string, userAddress: string): Promise<DocumentRole> {
    try {
      if (!ethers.isAddress(userAddress)) {
        logger.warn(`[PERMISSIONS] Dirección inválida: ${userAddress}`);
        return DocumentRole.NONE;
      }

      const roleStr = await BlockchainQueries.getUserRole(docId, userAddress);
      if (roleStr === 'DOCUMENT_OWNER') return DocumentRole.OWNER;
      if (roleStr === 'DOCUMENT_SHARED_WRITE') return DocumentRole.EDITOR;
      if (roleStr === 'DOCUMENT_SHARED_READ') return DocumentRole.VIEWER;
      return DocumentRole.NONE;
    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener rol de ${userAddress} en doc ${docId}:`, error);
      return DocumentRole.NONE;
    }
  }

  /**
   * Obtiene los permisos completos de un usuario en un documento.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns Objeto con el rol y los permisos detallados.
   */
  static async getUserPermission(docId: string, userAddress: string): Promise<DocumentPermission> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return {
          docId,
          userAddress,
          role: DocumentRole.NONE,
          canView: false,
          canEdit: false,
          isOwner: false
        };
      }

      const contract = getDocumentRegistryContract();

      const roleValue = await contract.getUserPermission(docId, userAddress);
      const roleNum = Number(roleValue);
      return {
        docId,
        userAddress,
        role: roleNum as DocumentRole,
        canView: roleNum >= 1,
        canEdit: roleNum >= 2,
        isOwner: roleNum === 3,
      };

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener permisos de ${userAddress} en doc ${docId}:`, error);
      return {
        docId,
        userAddress,
        role: DocumentRole.NONE,
        canView: false,
        canEdit: false,
        isOwner: false
      };
    }
  }

  /**
   * Verifica si un usuario puede ver un documento.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si puede ver, `false` en caso contrario.
   */
  static async canView(docId: string, userAddress: string): Promise<boolean> {
    try {
      if (!ethers.isAddress(userAddress)) return false;
      return await BlockchainQueries.canRead(docId, userAddress);
    } catch (error) {
      logger.error(`[PERMISSIONS] Error al verificar canView de ${userAddress} en doc ${docId}:`, error);
      return false;
    }
  }

  /**
   * Verifica si un usuario puede editar un documento.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si puede editar, `false` en caso contrario.
   */
  static async canEdit(docId: string, userAddress: string): Promise<boolean> {
    try {
      if (!ethers.isAddress(userAddress)) return false;
      return await BlockchainQueries.canWrite(docId, userAddress);
    } catch (error) {
      logger.error(`[PERMISSIONS] Error al verificar canEdit de ${userAddress} en doc ${docId}:`, error);
      return false;
    }
  }

  /**
   * Verifica si un usuario es propietario de un documento.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si es propietario, `false` en caso contrario.
   */
  static async isOwner(docId: string, userAddress: string): Promise<boolean> {
    try {
      if (!ethers.isAddress(userAddress)) return false;
      return await BlockchainQueries.isOwner(docId, userAddress);
    } catch (error) {
      logger.error(`[PERMISSIONS] Error al verificar isOwner de ${userAddress} en doc ${docId}:`, error);
      return false;
    }
  }

  /**
   * Obtiene la lista de usuarios con acceso a un documento.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @returns Array de direcciones Ethereum con acceso al documento.
   */
  static async getDocumentUsers(docId: string): Promise<string[]> {
    try {
      const contract = getDocumentRegistryContract();
      const users = await contract.getDocumentUsers(docId);

      return users;

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener usuarios del doc ${docId}:`, error);
      return [];
    }
  }

  /**
   * Obtiene la lista de usuarios con acceso y sus roles.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @returns Array de objetos con dirección y rol asignado.
   */
  static async getDocumentUsersWithRoles(docId: string): Promise<Array<{ address: string; role: DocumentRole }>> {
    try {
      const users = await this.getDocumentUsers(docId);

      if (users.length === 0) {
        return [];
      }

      // Obtener roles de todos los usuarios en paralelo
      const rolesPromises = users.map(async (userAddress) => {
        const role = await this.getUserRole(docId, userAddress);
        return { address: userAddress, role };
      });

      return await Promise.all(rolesPromises);

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener usuarios con roles del doc ${docId}:`, error);
      return [];
    }
  }

  /**
   * Obtiene todos los documentos a los que un usuario tiene acceso.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns Array de identificadores de documento (bytes32).
   */
  static async getUserDocuments(userAddress: string): Promise<string[]> {
    try {
      if (!ethers.isAddress(userAddress)) return [];
      return await BlockchainQueries.getUserDocuments(userAddress);
    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener documentos del usuario ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Obtiene el número de documentos a los que un usuario tiene acceso.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns Número de documentos accesibles.
   */
  static async getUserDocumentCount(userAddress: string): Promise<number> {
    try {
      const documents = await this.getUserDocuments(userAddress);
      return documents.length;

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener count de documentos del usuario ${userAddress}:`, error);
      return 0;
    }
  }

  /**
   * Comparte un documento con otro usuario otorgándole permisos.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @param userAddress - Dirección del usuario destinatario.
   * @param role - Rol a otorgar (`VIEWER` o `EDITOR`).
   * @returns Hash de la transacción.
   * @throws Error si la dirección es inválida, el rol no es permitido o el documento está eliminado.
   */
  static async shareDocument(docId: string, userAddress: string, role: DocumentRole.VIEWER | DocumentRole.EDITOR): Promise<string> {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Dirección de usuario inválida');
      }

      if (role !== DocumentRole.VIEWER && role !== DocumentRole.EDITOR) {
        throw new Error('Rol inválido. Solo se permiten VIEWER o EDITOR');
      }

      // Verificación de soft-delete: comprobar que el documento no esté eliminado
      const document = await prisma.document.findFirst({
        where: { blockchainId: docId },
      });
      if (document?.blockchainId && await BlockchainCacheService.isDocumentDeleted(document.blockchainId)) {
        throw new Error('No se pueden compartir documentos eliminados');
      }

      const contract = getDocumentRegistryContract();

      logger.info(`[PERMISSIONS] Compartiendo doc ${docId} con ${userAddress}, rol: ${role}`);

      const tx = await contract.shareDocument(docId, userAddress, role);
      const receipt = await tx.wait();

      logger.info(`[PERMISSIONS] ✅ Documento compartido, tx: ${receipt.hash}`);

      return receipt.hash;

    } catch (error) {
      logger.error(`[PERMISSIONS] ❌ Error al compartir documento:`, error);
      throw error;
    }
  }

  /**
   * Revoca los permisos de un usuario en un documento.
   * @param docId - Identificador del documento en la blockchain (bytes32).
   * @param userAddress - Dirección del usuario cuyos permisos se revocarán.
   * @returns Hash de la transacción.
   * @throws Error si la dirección es inválida.
   */
  static async revokePermission(docId: string, userAddress: string): Promise<string> {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Dirección de usuario inválida');
      }

      const contract = getDocumentRegistryContract();

      logger.info(`[PERMISSIONS] Revocando permisos de ${userAddress} en doc ${docId}`);

      const tx = await contract.revokePermission(docId, userAddress);
      const receipt = await tx.wait();

      logger.info(`[PERMISSIONS] ✅ Permisos revocados, tx: ${receipt.hash}`);

      return receipt.hash;

    } catch (error) {
      logger.error(`[PERMISSIONS] ❌ Error al revocar permisos:`, error);
      throw error;
    }
  }

  /**
   * Valida que un usuario es propietario de un documento.
   * Busca la wallet del usuario, verifica en blockchain si existe blockchainId,
   * o cae en la comprobación por BD si no hay registro on-chain.
   *
   * @param document - Objeto con al menos { blockchainId, ownerId }.
   * @param userId - ID del usuario en base de datos.
   * @param options - Opciones: existingWallet (salta lookup), errorMessage (mensaje custom).
   * @returns La wallet y confirmación de propiedad.
   * @throws Si no hay wallet, o el usuario no es propietario.
   */
  static async validateOwnership(
    document: { blockchainId: string | null; ownerId: string },
    userId: string,
    options?: {
      existingWallet?: { walletAddress: string; [key: string]: any };
      errorMessage?: string;
    }
  ): Promise<{ wallet: { walletAddress: string; [key: string]: any }; isOwner: true }> {
    const notOwnerMsg = options?.errorMessage ?? 'No tienes permisos para realizar esta acción';

    const wallet =
      options?.existingWallet ??
      (await prisma.wallet.findFirst({ where: { userId } }));

    if (!wallet) {
      throw new Error('Wallet no encontrada');
    }

    if (document.blockchainId) {
      const isOwnerOnChain = await DocumentPermissionService.isOwner(
        document.blockchainId,
        wallet.walletAddress
      );
      if (!isOwnerOnChain) {
        throw new Error(notOwnerMsg);
      }
      return { wallet, isOwner: true };
    }

    if (document.ownerId !== userId) {
      throw new Error(notOwnerMsg);
    }

    return { wallet, isOwner: true };
  }
}
