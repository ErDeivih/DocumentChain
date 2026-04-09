import { getDocumentRegistryContract } from '../config/blockchain';
import logger from '../utils/logger';
import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * DocumentRole enum (debe coincidir con el contrato)
 */
export enum DocumentRole {
  NONE = 0,      // Sin acceso
  VIEWER = 1,    // Solo lectura
  EDITOR = 2,    // Lectura + escritura
  OWNER = 3      // Control total
}

export interface DocumentPermission {
  docId: string;
  userAddress: string;
  role: DocumentRole;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
}

export interface DocumentUserList {
  docId: string;
  users: string[];  // Direcciones de usuarios con acceso
}

/**
 * DocumentPermissionService
 * 
 * Servicio para consultar permisos de documentos directamente desde blockchain.
 * Blockchain es la ÚNICA fuente de verdad para permisos de documentos.
 * 
 * NO hay tabla DocumentShare en la DB.
 * Todos los permisos se gestionan y consultan desde el smart contract.
 */
export class DocumentPermissionService {
  /**
   * Obtener el rol de un usuario en un documento
   * 
   * @param docId - ID del documento (bytes32)
   * @param userAddress - Dirección Ethereum del usuario
   * @returns DocumentRole del usuario
   */
  static async getUserRole(docId: string, userAddress: string): Promise<DocumentRole> {
    try {
      if (!ethers.isAddress(userAddress)) {
        logger.warn(`[PERMISSIONS] Dirección inválida: ${userAddress}`);
        return DocumentRole.NONE;
      }

      const contract = getDocumentRegistryContract();
      const role = await contract.getUserPermission(docId, userAddress);

      return Number(role) as DocumentRole;

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener rol de ${userAddress} en doc ${docId}:`, error);
      return DocumentRole.NONE;
    }
  }

  /**
   * Obtener permisos completos de un usuario en un documento
   * 
   * @param docId - ID del documento (bytes32)
   * @param userAddress - Dirección Ethereum del usuario
   * @returns Información completa de permisos
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

      // Obtener rol y permisos en paralelo
      const [role, canView, canEdit, isOwner] = await Promise.all([
        contract.getUserPermission(docId, userAddress),
        contract.canView(docId, userAddress),
        contract.canEdit(docId, userAddress),
        contract.isOwner(docId, userAddress)
      ]);

      return {
        docId,
        userAddress,
        role: Number(role) as DocumentRole,
        canView,
        canEdit,
        isOwner
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
   * Verificar si un usuario puede ver un documento
   * 
   * @param docId - ID del documento (bytes32)
   * @param userAddress - Dirección Ethereum del usuario
   * @returns true si puede ver, false caso contrario
   */
  static async canView(docId: string, userAddress: string): Promise<boolean> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return false;
      }

      const contract = getDocumentRegistryContract();
      return await contract.canView(docId, userAddress);

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al verificar canView de ${userAddress} en doc ${docId}:`, error);
      return false;
    }
  }

  /**
   * Verificar si un usuario puede editar un documento
   * 
   * @param docId - ID del documento (bytes32)
   * @param userAddress - Dirección Ethereum del usuario
   * @returns true si puede editar, false caso contrario
   */
  static async canEdit(docId: string, userAddress: string): Promise<boolean> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return false;
      }

      const contract = getDocumentRegistryContract();
      return await contract.canEdit(docId, userAddress);

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al verificar canEdit de ${userAddress} en doc ${docId}:`, error);
      return false;
    }
  }

  /**
   * Verificar si un usuario es dueño de un documento
   * 
   * @param docId - ID del documento (bytes32)
   * @param userAddress - Dirección Ethereum del usuario
   * @returns true si es dueño, false caso contrario
   */
  static async isOwner(docId: string, userAddress: string): Promise<boolean> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return false;
      }

      const contract = getDocumentRegistryContract();
      return await contract.isOwner(docId, userAddress);

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al verificar isOwner de ${userAddress} en doc ${docId}:`, error);
      return false;
    }
  }

  /**
   * Obtener la lista de todos los usuarios con acceso a un documento
   * 
   * @param docId - ID del documento (bytes32)
   * @returns Array de direcciones con acceso
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
   * Obtener la lista de todos los usuarios con acceso y sus roles
   * 
   * @param docId - ID del documento (bytes32)
   * @returns Array de objetos con dirección y rol
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
   * Obtener todos los documentos a los que un usuario tiene acceso
   * 
   * @param userAddress - Dirección Ethereum del usuario
   * @returns Array de IDs de documentos (bytes32)
   */
  static async getUserDocuments(userAddress: string): Promise<string[]> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return [];
      }

      const contract = getDocumentRegistryContract();
      const documents = await contract.getUserDocuments(userAddress);

      return documents;

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener documentos del usuario ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Obtener el número de documentos a los que un usuario tiene acceso
   * 
   * @param userAddress - Dirección Ethereum del usuario
   * @returns Número de documentos
   */
  static async getUserDocumentCount(userAddress: string): Promise<number> {
    try {
      if (!ethers.isAddress(userAddress)) {
        return 0;
      }

      const contract = getDocumentRegistryContract();
      const count = await contract.getUserDocumentCount(userAddress);

      return Number(count);

    } catch (error) {
      logger.error(`[PERMISSIONS] Error al obtener count de documentos del usuario ${userAddress}:`, error);
      return 0;
    }
  }

  /**
   * Compartir un documento con otro usuario (otorgar permisos)
   * 
   * @param docId - ID del documento (bytes32)
   * @param userAddress - Dirección del usuario a quien compartir
   * @param role - Rol a otorgar (VIEWER o EDITOR)
   * @returns Hash de la transacción
   */
  static async shareDocument(docId: string, userAddress: string, role: DocumentRole.VIEWER | DocumentRole.EDITOR): Promise<string> {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Dirección de usuario inválida');
      }

      if (role !== DocumentRole.VIEWER && role !== DocumentRole.EDITOR) {
        throw new Error('Rol inválido. Solo se permiten VIEWER o EDITOR');
      }

      // Soft-delete check: verify document is not deleted
      const document = await prisma.document.findFirst({
        where: { blockchainId: docId },
      });
      if (document?.isDeleted) {
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
   * Revocar permisos de un usuario en un documento
   * 
   * @param docId - ID del documento (bytes32)
   * @param userAddress - Dirección del usuario a quien revocar permisos
   * @returns Hash de la transacción
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
}
