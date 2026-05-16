/**
 * Utilidades de consulta a la blockchain.
 * Abstrae las llamadas a los smart contracts para evitar duplicación de código.
 */

import { getContracts } from '../../config/blockchain';
import { ethers } from 'ethers';
import { NotFoundError, BlockchainError } from '../../utils/errors';
import logger from '../../utils/logger';

/**
 * Representación de un documento en la blockchain.
 */
export interface BlockchainDocument {
  owner: string;
  docId: string;
  latestVersion: bigint;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Representación de una versión de documento en la blockchain.
 */
export interface BlockchainVersion {
  docId: string;
  versionNumber: number;
  ipfsCid: string;
  createdBy: string;
  createdAt: Date;
  isOperational: boolean;
  restoredFrom: number;
}

/**
 * Representación de una firma de versión en la blockchain.
 */
export interface BlockchainSignature {
  docId: string;
  versionNumber: number;
  signer: string;
  signature: Uint8Array;
  message: string;
  comment: string;
  timestamp: Date;
}

/**
 * Clase de utilidades para realizar consultas a los smart contracts de DocumentChain.
 * Provee métodos estáticos para obtener documentos, versiones, firmas y permisos directamente desde la blockchain.
 */
export class BlockchainQueries {
  /**
   * Obtiene los datos de un documento desde la blockchain.
   * @param blockchainId - Identificador del documento en la blockchain (bytes32).
   * @returns Objeto con la información del documento.
   * @throws NotFoundError si el documento no existe (owner es la dirección cero).
   * @throws BlockchainError si ocurre un error durante la consulta.
   */
  static async getDocument(blockchainId: string): Promise<BlockchainDocument> {
    try {
      const contracts = getContracts();
      const doc = await contracts.documentRegistry.getDocument(blockchainId);
      
      // Verificar si el documento existe
      if (doc.owner === ethers.ZeroAddress) {
        throw new NotFoundError('Documento en blockchain', blockchainId);
      }
      
      return {
        owner: doc.owner,
        docId: doc.docId,
        latestVersion: doc.latestVersion,
        isArchived: doc.isArchived,
        isDeleted: doc.isDeleted,
        createdAt: new Date(Number(doc.createdAt) * 1000),
        updatedAt: new Date(Number(doc.updatedAt) * 1000)
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error al obtener documento de la blockchain', {
        blockchainId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new BlockchainError(
        `Error al obtener documento de la blockchain: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        'FETCH_ERROR'
      );
    }
  }

  /**
   * Obtiene todas las versiones de un documento desde la blockchain.
   * Itera desde la versión 1 hasta la última registrada.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @returns Lista de versiones del documento.
   * @throws NotFoundError si el documento no existe.
   * @throws BlockchainError si ocurre un error durante la consulta.
   */
  static async getAllVersions(blockchainId: string): Promise<BlockchainVersion[]> {
    try {
      const contracts = getContracts();
      
      // Primero obtener el número de versiones
      const doc = await contracts.documentRegistry.getDocument(blockchainId);
      
      if (doc.owner === ethers.ZeroAddress) {
        throw new NotFoundError('Documento en blockchain', blockchainId);
      }
      
      const versionCount = Number(doc.latestVersion);
      const versions: BlockchainVersion[] = [];
      
      // Obtener cada versión
      for (let i = 1; i <= versionCount; i++) {
        try {
          const version = await this.getVersion(blockchainId, i);
          versions.push(version);
        } catch (error) {
          logger.warn('No se pudo obtener la versión de la blockchain', {
            blockchainId,
            versionNumber: i,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
        }
      }
      
      return versions;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error al obtener versiones de la blockchain', {
        blockchainId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new BlockchainError(
        `Error al obtener versiones de la blockchain: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        'FETCH_VERSIONS_ERROR'
      );
    }
  }

  /**
   * Obtiene los datos de una versión específica desde la blockchain.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param versionNumber - Número de versión a consultar.
   * @returns Información de la versión solicitada.
   * @throws NotFoundError si la versión no existe (createdBy es la dirección cero).
   * @throws BlockchainError si ocurre un error durante la consulta.
   */
  static async getVersion(blockchainId: string, versionNumber: number): Promise<BlockchainVersion> {
    try {
      const contracts = getContracts();
      
      // DocumentRegistry almacena las versiones en un mapping; se consulta directamente por docId + versionNumber
      const version = await contracts.documentRegistry.getVersion(blockchainId, versionNumber);
      
      // Una dirección cero en createdBy indica que la versión no existe
      if (!version || version.createdBy === ethers.ZeroAddress) {
        throw new NotFoundError('Versión en blockchain', `${blockchainId}:${versionNumber}`);
      }
      
      return {
        docId: blockchainId,
        versionNumber: Number(version.versionNumber),
        ipfsCid: version.ipfsCid,
        createdBy: version.createdBy,
        createdAt: new Date(Number(version.createdAt) * 1000),
        isOperational: version.isOperational,
        restoredFrom: Number(version.restoredFrom)
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error al obtener versión de la blockchain', {
        blockchainId,
        versionNumber,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new BlockchainError(
        `Error al obtener versión de la blockchain: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        'FETCH_VERSION_ERROR'
      );
    }
  }

  /**
   * Obtiene la versión operativa de un documento.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @returns La versión marcada como operativa, o `null` si no existe.
   * @throws BlockchainError si ocurre un error durante la consulta.
   */
  static async getOperationalVersion(blockchainId: string): Promise<BlockchainVersion | null> {
    try {
      const versions = await this.getAllVersions(blockchainId);
      const operational = versions.find(v => v.isOperational);
      return operational || null;
    } catch (error) {
      logger.error('Error al obtener versión operativa de la blockchain', {
        blockchainId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new BlockchainError(
        `Error al obtener versión operativa: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        'FETCH_OPERATIONAL_VERSION_ERROR'
      );
    }
  }

  /**
   * Obtiene todas las firmas asociadas a una versión desde la blockchain.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param versionNumber - Número de versión a consultar.
   * @returns Lista de firmas registradas para la versión.
   * @throws BlockchainError si ocurre un error durante la consulta.
   */
  static async getVersionSignatures(
    blockchainId: string, 
    versionNumber: number
  ): Promise<BlockchainSignature[]> {
    try {
      const contracts = getContracts();
      
      // Obtener firmas de la versión
      const signatures = await contracts.documentRegistry.getVersionSignatures(
        blockchainId,
        versionNumber
      );
      
      return signatures.map((sig: any) => ({
        docId: blockchainId,
        versionNumber: versionNumber,
        signer: sig.signer,
        signature: sig.signature,
        message: sig.message,
        comment: sig.comment,
        timestamp: new Date(Number(sig.timestamp) * 1000)
      }));
    } catch (error) {
      logger.error('Error al obtener firmas de la blockchain', {
        blockchainId,
        versionNumber,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new BlockchainError(
        `Error al obtener firmas de la blockchain: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        'FETCH_SIGNATURES_ERROR'
      );
    }
  }

  /**
   * Obtiene una firma específica desde la blockchain.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param versionNumber - Número de versión a consultar.
   * @param signerAddress - Dirección Ethereum del firmante.
   * @returns Información de la firma solicitada.
   * @throws NotFoundError si la firma no existe.
   * @throws BlockchainError si ocurre un error durante la consulta.
   */
  static async getSignature(
    blockchainId: string, 
    versionNumber: number, 
    signerAddress: string
  ): Promise<BlockchainSignature> {
    try {
      const signatures = await this.getVersionSignatures(blockchainId, versionNumber);
      const signature = signatures.find(
        sig => sig.signer.toLowerCase() === signerAddress.toLowerCase()
      );
      
      if (!signature) {
        throw new NotFoundError(
          'Firma en blockchain', 
          `${blockchainId}:${versionNumber}:${signerAddress}`
        );
      }
      
      return signature;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error al obtener firma de la blockchain', {
        blockchainId,
        versionNumber,
        signerAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw new BlockchainError(
        `Error al obtener firma de la blockchain: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        'FETCH_SIGNATURE_ERROR'
      );
    }
  }

  /**
   * Verifica si un usuario ha firmado una versión específica.
   * Dado que el contrato no expone un getter directo, se obtienen todas las firmas de la versión y se busca la dirección.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param versionNumber - Número de versión a consultar.
   * @param signerAddress - Dirección Ethereum del posible firmante.
   * @returns `true` si el usuario ha firmado la versión, `false` en caso contrario.
   */
  static async hasUserSigned(
    blockchainId: string,
    versionNumber: number,
    signerAddress: string
  ): Promise<boolean> {
    try {
      const contracts = getContracts();
      const signatures = await contracts.documentRegistry.getVersionSignatures(
        blockchainId,
        versionNumber
      );
      return signatures.some(
        (sig: any) => sig.signer.toLowerCase() === signerAddress.toLowerCase()
      );
    } catch (error) {
      logger.error('Error al verificar estado de firma', {
        blockchainId,
        versionNumber,
        signerAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Obtiene el rol de un usuario para un documento específico.
   * Utiliza `getUserPermission()` del contrato DocumentRegistry (arquitectura de contrato único).
   * La implementación anterior utilizaba incorrectamente `AccessControl.hasRole()` con nombres de rol inventados;
   * los permisos de documentos se gestionan a través del mapping `_permissions`, no mediante AccessControl.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns Rol del usuario (`DOCUMENT_OWNER`, `DOCUMENT_SHARED_WRITE`, `DOCUMENT_SHARED_READ`) o `null`.
   */
  static async getUserRole(blockchainId: string, userAddress: string): Promise<string | null> {
    try {
      const contracts = getContracts();
      // Devuelve el enum DocumentRole: 0=NONE, 1=VIEWER, 2=EDITOR, 3=OWNER
      const roleValue = await contracts.documentRegistry.getUserPermission(blockchainId, userAddress);
      const roleNum = Number(roleValue);
      switch (roleNum) {
        case 3: return 'DOCUMENT_OWNER';
        case 2: return 'DOCUMENT_SHARED_WRITE';
        case 1: return 'DOCUMENT_SHARED_READ';
        default: return null;
      }
    } catch (error) {
      logger.error('Error al obtener rol de usuario de la blockchain', {
        blockchainId,
        userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return null;
    }
  }

  /**
   * Verifica si un usuario puede leer un documento.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si el usuario tiene permiso de lectura, `false` en caso contrario.
   */
  static async canRead(blockchainId: string, userAddress: string): Promise<boolean> {
    try {
      const contracts = getContracts();
      return await contracts.documentRegistry.canView(blockchainId, userAddress);
    } catch (error) {
      logger.error('Error al verificar permiso de lectura', {
        blockchainId,
        userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Verifica si un usuario puede escribir en un documento.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si el usuario tiene permiso de escritura, `false` en caso contrario.
   */
  static async canWrite(blockchainId: string, userAddress: string): Promise<boolean> {
    try {
      const contracts = getContracts();
      return await contracts.documentRegistry.canEdit(blockchainId, userAddress);
    } catch (error) {
      logger.error('Error al verificar permiso de escritura', {
        blockchainId,
        userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Verifica si un usuario puede firmar un documento.
   * Cualquier usuario con permiso de lectura puede firmar.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si el usuario puede firmar, `false` en caso contrario.
   */
  static async canSign(blockchainId: string, userAddress: string): Promise<boolean> {
    try {
      const contracts = getContracts();
      return await contracts.documentRegistry.canView(blockchainId, userAddress);
    } catch (error) {
      logger.error('Error al verificar permiso de firma', {
        blockchainId,
        userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Verifica si un usuario es propietario de un documento.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si el usuario es propietario, `false` en caso contrario.
   */
  static async isOwner(blockchainId: string, userAddress: string): Promise<boolean> {
    try {
      const contracts = getContracts();
      return await contracts.documentRegistry.isOwner(blockchainId, userAddress);
    } catch (error) {
      logger.error('Error al verificar propiedad del documento', {
        blockchainId,
        userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Verifica si un usuario puede compartir un documento.
   * Solo el propietario puede compartir documentos.
   * @param blockchainId - Identificador del documento en la blockchain.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns `true` si el usuario puede compartir, `false` en caso contrario.
   */
  static async canShare(blockchainId: string, userAddress: string): Promise<boolean> {
    try {
      const contracts = getContracts();
      return await contracts.documentRegistry.isOwner(blockchainId, userAddress);
    } catch (error) {
      logger.error('Error al verificar permiso de compartir', {
        blockchainId,
        userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Obtiene los documentos asociados a un usuario (propios y compartidos).
   * Filtra únicamente aquellos documentos para los que el usuario tiene permiso de lectura activo.
   * @param userAddress - Dirección Ethereum del usuario.
   * @returns Lista de identificadores de documento en la blockchain.
   */
  static async getUserDocuments(userAddress: string): Promise<string[]> {
    try {
      const contracts = getContracts();
      const documentIds = await contracts.documentRegistry.getUserDocuments(userAddress);

      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return [];
      }

      const activeDocumentIds = await Promise.all(
        documentIds.map(async (id: string) => {
          try {
            const canView = await contracts.documentRegistry.canView(id, userAddress);
            return canView ? id : null;
          } catch (permissionError) {
            logger.warn('No se pudo validar acceso activo del usuario al documento', {
              userAddress,
              blockchainId: id,
              error: permissionError instanceof Error ? permissionError.message : 'Error desconocido',
            });
            return null;
          }
        })
      );

      return activeDocumentIds.filter((id): id is string => Boolean(id));
    } catch (error) {
      logger.error('Error al obtener documentos del usuario', {
        userAddress,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return [];
    }
  }
}
