/**
 * Blockchain Query Helpers
 * Abstrae las consultas a smart contracts para evitar duplicación de código
 */

import { getContracts } from '../../config/blockchain';
import { ethers } from 'ethers';
import { NotFoundError, BlockchainError } from '../../utils/errors';
import logger from '../../utils/logger';

export interface BlockchainDocument {
  owner: string;
  docId: string;
  latestVersion: bigint;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockchainVersion {
  docId: string;
  versionNumber: number;
  ipfsCid: string;
  createdBy: string;
  createdAt: Date;
  isOperational: boolean;
  restoredFrom: number;
}

export interface BlockchainSignature {
  docId: string;
  versionNumber: number;
  signer: string;
  signature: Uint8Array;
  message: string;
  comment: string;
  timestamp: Date;
}

export class BlockchainQueries {
  /**
   * Get document data from blockchain
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
   * Get all versions for a document from blockchain
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
   * Get specific version data from blockchain
   */
  static async getVersion(blockchainId: string, versionNumber: number): Promise<BlockchainVersion> {
    try {
      const contracts = getContracts();
      
      // DocumentRegistry stores versions in a mapping; fetch by docId + versionNumber directly
      const version = await contracts.documentRegistry.getVersion(blockchainId, versionNumber);
      
      // A zero-address createdBy indicates the version does not exist
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
   * Get operational version for a document
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
   * Get all signatures for a version from blockchain
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
   * Get specific signature from blockchain
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
   * Check if a user has signed a specific version
   * Uses getVersionSignatures (the contract has no direct hasSignedVersion getter)
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
   * Get user's role for a document
   * Uses getUserPermission() from DocumentRegistry (single-contract architecture).
   * The old implementation wrongly used AccessControl.hasRole() with invented role names;
   * document permissions are managed through the _permissions mapping, not AccessControl.
   */
  static async getUserRole(blockchainId: string, userAddress: string): Promise<string | null> {
    try {
      const contracts = getContracts();
      // Returns DocumentRole enum: 0=NONE, 1=VIEWER, 2=EDITOR, 3=OWNER
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
   * Verificar si un usuario puede leer un documento
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
   * Verificar si un usuario puede escribir en un documento
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
   * Verificar si un usuario puede firmar un documento
   */
  static async canSign(blockchainId: string, userAddress: string): Promise<boolean> {
    try {
      const contracts = getContracts();
      // Cualquier usuario con acceso de lectura puede firmar
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
   * Verificar si un usuario es dueño de un documento
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
   * Verificar si un usuario puede compartir un documento
   */
  static async canShare(blockchainId: string, userAddress: string): Promise<boolean> {
    try {
      const contracts = getContracts();
      // Solo el owner puede compartir documentos
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
   * Obtener documentos de un usuario (propios y compartidos)
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
