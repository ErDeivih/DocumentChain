import prisma from '../config/database';
import {
  DOCUMENT_REGISTRY_ADDRESS,
  documentRegistryInterface,
  getDocumentRegistryReadContract,
  provider,
} from '../config/blockchain';
import logger from '../utils/logger';

export type UserSuspensionAction = 'suspend' | 'unsuspend';

type SuspensionMethodName = 'suspendMyself' | 'unsuspendMyself';

interface PrimaryWalletInfo {
  id: string;
  walletAddress: string;
  nickname: string | null;
}

interface SuspensionContext {
  user: {
    id: string;
    username: string;
    isSuspended: boolean;
    suspendedAt: Date | null;
    suspendReason: string | null;
  };
  wallet: PrimaryWalletInfo;
}

export interface PreparedUserSuspension {
  action: UserSuspensionAction;
  method: SuspensionMethodName;
  contractAddress: string;
  wallet: {
    id: string;
    address: string;
    label: string | null;
  };
  currentDbSuspended: boolean;
  currentOnChainSuspended: boolean;
  reason: string | null;
}

export interface ConfirmUserSuspensionInput {
  txHash: string;
  reason?: string;
  currentAccessToken?: string;
}

export interface ConfirmedUserSuspension {
  action: UserSuspensionAction;
  txHash: string;
  user: {
    id: string;
    username: string;
    isSuspended: boolean;
    suspendedAt: Date | null;
    suspendReason: string | null;
  };
}

export class SuspensionFlowError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const METHOD_BY_ACTION: Record<UserSuspensionAction, SuspensionMethodName> = {
  suspend: 'suspendMyself',
  unsuspend: 'unsuspendMyself',
};

export class UserSuspensionService {
  private static readonly ON_CHAIN_READ_TIMEOUT_MS = 2500;

  private static isUnsupportedSuspensionRead(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return error.message.includes('could not decode result data')
      || error.message.includes('BAD_DATA')
      || error.message.includes('isUserSuspended');
  }

  private static async getOnChainSuspensionStateOrNull(walletAddress: string): Promise<boolean | null> {
    const contract = getDocumentRegistryReadContract();
    const timeoutMarker = Symbol('on-chain-suspension-timeout');
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      const result = await Promise.race<boolean | typeof timeoutMarker>([
        contract.isUserSuspended(walletAddress),
        new Promise<typeof timeoutMarker>((resolve) => {
          timeoutHandle = setTimeout(
            () => resolve(timeoutMarker),
            this.ON_CHAIN_READ_TIMEOUT_MS,
          );
        }),
      ]);

      if (result === timeoutMarker) {
        logger.warn('La lectura on-chain de suspensión excedió el tiempo máximo; se usa fallback local', {
          walletAddress,
          timeoutMs: this.ON_CHAIN_READ_TIMEOUT_MS,
        });
        return null;
      }

      return result;
    } catch (error) {
      if (this.isUnsupportedSuspensionRead(error)) {
        logger.warn('El contrato desplegado no expone un getter legible para isUserSuspended; se usa fallback local', {
          walletAddress,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
        return null;
      }

      throw error;
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }

  static async prepareSuspend(userId: string, reason?: string): Promise<PreparedUserSuspension> {
    return this.prepareAction('suspend', userId, reason);
  }

  static async prepareUnsuspend(userId: string): Promise<PreparedUserSuspension> {
    return this.prepareAction('unsuspend', userId);
  }

  static async confirmSuspend(
    userId: string,
    input: ConfirmUserSuspensionInput,
  ): Promise<ConfirmedUserSuspension> {
    return this.confirmAction('suspend', userId, input);
  }

  static async confirmUnsuspend(
    userId: string,
    input: ConfirmUserSuspensionInput,
  ): Promise<ConfirmedUserSuspension> {
    return this.confirmAction('unsuspend', userId, input);
  }

  static async getOnChainSuspensionState(walletAddress: string): Promise<boolean> {
    const state = await this.getOnChainSuspensionStateOrNull(walletAddress);
    return state ?? false;
  }

  private static async prepareAction(
    action: UserSuspensionAction,
    userId: string,
    reason?: string,
  ): Promise<PreparedUserSuspension> {
    const { user, wallet } = await this.getSuspensionContext(userId);
    const currentOnChainSuspended = await this.getOnChainSuspensionStateOrNull(wallet.walletAddress);

    if (action === 'suspend' && (user.isSuspended || currentOnChainSuspended === true)) {
      throw new SuspensionFlowError(409, 'Tu cuenta ya está suspendida');
    }

    if (action === 'unsuspend' && !user.isSuspended && currentOnChainSuspended !== true) {
      throw new SuspensionFlowError(409, 'Tu cuenta no está suspendida');
    }

    return {
      action,
      method: METHOD_BY_ACTION[action],
      contractAddress: DOCUMENT_REGISTRY_ADDRESS || '',
      wallet: {
        id: wallet.id,
        address: wallet.walletAddress,
        label: wallet.nickname,
      },
      currentDbSuspended: user.isSuspended,
      currentOnChainSuspended: currentOnChainSuspended ?? user.isSuspended,
      reason: reason ?? null,
    };
  }

  private static async confirmAction(
    action: UserSuspensionAction,
    userId: string,
    input: ConfirmUserSuspensionInput,
  ): Promise<ConfirmedUserSuspension> {
    const txHash = input.txHash?.trim();
    if (!txHash) {
      throw new SuspensionFlowError(400, 'Se requiere txHash');
    }

    const { user, wallet } = await this.getSuspensionContext(userId);
    await this.validateSuspensionTransaction(action, txHash, wallet.walletAddress);

    const currentOnChainSuspended = await this.getOnChainSuspensionStateOrNull(wallet.walletAddress);
    if (currentOnChainSuspended !== null) {
      if (action === 'suspend' && !currentOnChainSuspended) {
        throw new SuspensionFlowError(409, 'La wallet todavía no figura como suspendida en blockchain');
      }

      if (action === 'unsuspend' && currentOnChainSuspended) {
        throw new SuspensionFlowError(409, 'La wallet todavía figura como suspendida en blockchain');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: action === 'suspend'
        ? {
            isSuspended: true,
            suspendedAt: new Date(),
            suspendReason: input.reason ?? null,
          }
        : {
            isSuspended: false,
            suspendedAt: null,
            suspendReason: null,
          },
      select: {
        id: true,
        username: true,
        isSuspended: true,
        suspendedAt: true,
        suspendReason: true,
      },
    });

    if (action === 'suspend') {
      const deleteWhere = input.currentAccessToken
        ? { userId, NOT: { accessToken: input.currentAccessToken } }
        : { userId };

      await prisma.session.deleteMany({ where: deleteWhere });
    }

    logger.info(
      `[USER_SUSPENSION] user=${user.username} action=${action} wallet=${wallet.walletAddress} tx=${txHash}`,
    );

    return {
      action,
      txHash,
      user: updatedUser,
    };
  }

  private static async validateSuspensionTransaction(
    action: UserSuspensionAction,
    txHash: string,
    expectedWalletAddress: string,
  ): Promise<void> {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      throw new SuspensionFlowError(400, 'La transacción todavía no está confirmada');
    }

    if (Number(receipt.status) !== 1) {
      throw new SuspensionFlowError(400, 'La transacción ha fallado en blockchain');
    }

    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      throw new SuspensionFlowError(400, 'No se ha podido recuperar la transacción');
    }

    if (!tx.to || tx.to.toLowerCase() !== (DOCUMENT_REGISTRY_ADDRESS || '').toLowerCase()) {
      throw new SuspensionFlowError(400, 'La transacción no apunta al contrato DocumentRegistry');
    }

    if (tx.from.toLowerCase() !== expectedWalletAddress.toLowerCase()) {
      throw new SuspensionFlowError(403, 'La transacción debe estar firmada por la wallet principal del usuario');
    }

    let parsed;
    try {
      parsed = documentRegistryInterface.parseTransaction({
        data: tx.data,
        value: tx.value,
      });
    } catch {
      throw new SuspensionFlowError(400, 'No se ha podido decodificar la transacción enviada');
    }

    if (!parsed || parsed.name !== METHOD_BY_ACTION[action]) {
      throw new SuspensionFlowError(400, `La transacción no ejecuta ${METHOD_BY_ACTION[action]}`);
    }
  }

  private static async getSuspensionContext(userId: string): Promise<SuspensionContext> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isSuspended: true,
        suspendedAt: true,
        suspendReason: true,
      },
    });

    if (!user) {
      throw new SuspensionFlowError(404, 'Usuario no encontrado');
    }

    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        isPrimary: true,
      },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
      },
    });

    if (!wallet) {
      throw new SuspensionFlowError(
        409,
        'Debes configurar una wallet principal antes de suspender o reactivar la cuenta',
      );
    }

    return { user, wallet };
  }
}