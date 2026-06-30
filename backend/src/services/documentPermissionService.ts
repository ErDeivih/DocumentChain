import { getDocumentRegistryContract } from '../config/blockchain';
import logger from '../utils/logger';
import { ethers } from 'ethers';
import prisma from '../config/database';
import { BlockchainCacheService } from './blockchainCacheService';
import { BlockchainQueries } from '../lib/blockchain/queries';
import { NotFoundError, ServiceUnavailableError, UnauthorizedError, ValidationError } from '../utils/errors';

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
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error(`[PermissionService] Blockchain RPC error in getUserRole: ${error instanceof Error ? error.message : String(error)}`);
      return DocumentRole.NONE;
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
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error(`[PermissionService] Blockchain RPC error in canView: ${error instanceof Error ? error.message : String(error)}`);
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
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error(`[PermissionService] Blockchain RPC error in canEdit: ${error instanceof Error ? error.message : String(error)}`);
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
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error(`[PermissionService] Blockchain RPC error in isOwner: ${error instanceof Error ? error.message : String(error)}`);
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
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error(`[PermissionService] Blockchain RPC error in getDocumentUsers: ${error instanceof Error ? error.message : String(error)}`);
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
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error(`[PermissionService] Blockchain RPC error in getDocumentUsersWithRoles: ${error instanceof Error ? error.message : String(error)}`);
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
      if (error instanceof ServiceUnavailableError) throw error;
      logger.error(`[PermissionService] Blockchain RPC error in getUserDocuments: ${error instanceof Error ? error.message : String(error)}`);
      return [];
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
      throw new NotFoundError('Wallet no encontrada');
    }

    if (document.blockchainId) {
      const isOwnerOnChain = await DocumentPermissionService.isOwner(
        document.blockchainId,
        wallet.walletAddress
      );
      if (!isOwnerOnChain) {
        throw new UnauthorizedError(notOwnerMsg);
      }
      return { wallet, isOwner: true };
    }

    if (document.ownerId !== userId) {
      throw new UnauthorizedError(notOwnerMsg);
    }

    return { wallet, isOwner: true };
  }
}
