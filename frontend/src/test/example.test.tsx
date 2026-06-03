import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { act } from 'react';
import { OperationalVersionSelector } from '../components/documents/OperationalVersionSelector';

const {
  prepareSetOperationalMock,
  confirmSetOperationalMock,
  listByVersionMock,
  getSignerMock,
  setOperationalVersionMock,
} = vi.hoisted(() => ({
  prepareSetOperationalMock: vi.fn(),
  confirmSetOperationalMock: vi.fn(),
  listByVersionMock: vi.fn(),
  getSignerMock: vi.fn(),
  setOperationalVersionMock: vi.fn(),
}));

vi.mock('../api/versions', () => ({
  versionsApi: {
    prepareSetOperational: prepareSetOperationalMock,
    confirmSetOperational: confirmSetOperationalMock,
  },
}));

vi.mock('../api/signatures', () => ({
  signaturesApi: {
    listByVersion: listByVersionMock,
  },
}));

vi.mock('../lib/api', () => ({
  getErrorMessage: (error: unknown) => (error instanceof Error ? error.message : 'Error'),
}));

vi.mock('../components/wallets/WalletSelectorModal', () => ({
  WalletSelectorModal: ({ isOpen, onSelect }: { isOpen: boolean; onSelect: (wallet: any, connectedAddress: string) => void }) => (
    isOpen ? (
      <button
        type="button"
        onClick={() => onSelect({ id: 'wallet-1', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' }, '0x1234567890abcdef1234567890abcdef12345678')}
      >
        Seleccionar wallet de prueba
      </button>
    ) : null
  ),
}));

vi.mock('../lib/blockchain/provider', () => ({
  blockchainProvider: {
    getSigner: getSignerMock,
  },
}));

vi.mock('../lib/blockchain/contracts', () => ({
  DocumentRegistryContract: class {
    setOperationalVersion = setOperationalVersionMock;
  },
}));

describe('OperationalVersionSelector', () => {
  beforeEach(() => {
    prepareSetOperationalMock.mockReset();
    confirmSetOperationalMock.mockReset();
    listByVersionMock.mockReset();
    getSignerMock.mockReset();
    setOperationalVersionMock.mockReset();
  });

  it('renders provided versions including fallback text for pending CIDs', () => {
    const view = render(
      <OperationalVersionSelector
        documentId="document-1"
        isOwner
        versions={[
          {
            id: 'version-2',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 2,
            createdAt: '2026-04-05T10:00:00.000Z',
            comment: null,
            ipfsCid: '',
            blockchainStatus: 'PREPARING' as const,
          },
          {
            id: 'version-1',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 1,
            createdAt: '2026-04-04T10:00:00.000Z',
            isOperational: true,
            comment: 'Versión inicial',
            ipfsCid: 'QmTestCid6',
            blockchainStatus: 'SYNCED' as const,
          },
        ]}
      />
    );

    expect(view.getByText('Versión 2')).toBeInTheDocument();
    expect(view.getByText('Versión 1')).toBeInTheDocument();
    expect(view.getByText('Activa')).toBeInTheDocument();
  });

  it('allows the owner to activate another version and updates local state', async () => {
    prepareSetOperationalMock.mockResolvedValue({ blockchainId: 'blockchain-1' });
    confirmSetOperationalMock.mockResolvedValue({});
    getSignerMock.mockReturnValue({
      getAddress: vi.fn().mockResolvedValue('0x1234567890abcdef1234567890abcdef12345678'),
    });
    setOperationalVersionMock.mockResolvedValue({ hash: '0xversiontx' });
    const onVersionChange = vi.fn();

    const view = render(
      <OperationalVersionSelector
        documentId="document-1"
        isOwner
        onVersionChange={onVersionChange}
        versions={[
          {
            id: 'version-2',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 2,
            createdAt: '2026-04-05T10:00:00.000Z',
            comment: null,
            ipfsCid: 'QmTestCid3',
            blockchainStatus: 'SYNCED' as const,
          },
          {
            id: 'version-1',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 1,
            createdAt: '2026-04-04T10:00:00.000Z',
            isOperational: true,
            comment: null,
            ipfsCid: 'QmTestCid4',
            blockchainStatus: 'SYNCED' as const,
          },
        ]}
      />
    );

    await act(async () => {
      view.getByRole('button', { name: /activar/i }).click();
    });

    await act(async () => {
      (await view.findByRole('button', { name: 'Seleccionar wallet de prueba' })).click();
    });

    await view.findByText('Transacción enviada. La versión 2 se sincronizará con la blockchain en breve.');

    expect(prepareSetOperationalMock).toHaveBeenCalledWith('document-1', 2);
    expect(confirmSetOperationalMock).toHaveBeenCalledWith('document-1', 2, '0xversiontx');
    expect(onVersionChange).toHaveBeenCalledWith(2);
    expect(view.getByText('Transacción enviada. La versión 2 se sincronizará con la blockchain en breve.')).toBeInTheDocument();
    expect(view.getAllByText('Activa')).toHaveLength(1);
  });

  it('renders the empty state when there are no versions', () => {
    const view = render(
      <OperationalVersionSelector
        documentId="document-1"
        isOwner={false}
        versions={[]}
      />
    );

    expect(view.getByText('No hay versiones disponibles')).toBeInTheDocument();
  });

  it('shows signer profiles for a version inside the modal', async () => {
    listByVersionMock.mockResolvedValue({
      signatures: [
        {
          id: 'signature-1',
          documentId: 'document-1',
          versionId: 'version-1',
          versionNumber: 1,
          userId: 'user-2',
          signerWalletId: 'wallet-2',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          signedAt: '2026-04-05T10:15:00.000Z',
          blockchainStatus: 'SYNCED',
          blockchainTxHash: '0xtxhash',
          signer: {
            userId: 'user-2',
            username: 'mprieto',
            fullName: 'Marina Prieto',
            walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
            source: 'live',
          },
        },
      ],
    });

    const view = render(
      <OperationalVersionSelector
        documentId="document-1"
        isOwner={false}
        versions={[
          {
            id: 'version-1',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 1,
            createdAt: '2026-04-04T10:00:00.000Z',
            isOperational: true,
            comment: 'Versión inicial',
            ipfsCid: 'QmTestCid6',
            blockchainStatus: 'SYNCED' as const,
          },
        ]}
      />
    );

    await act(async () => {
      view.getByRole('button', { name: /ver firmantes/i }).click();
    });

    await view.findByText('Firmantes de la versión 1');

    expect(listByVersionMock).toHaveBeenCalledWith('document-1', 1);

    const signerProfilePanel = view.getByTestId('signer-profile-panel');

    expect(view.getByText('Firmantes de la versión 1')).toBeInTheDocument();
    expect(view.getByText('Perfil del firmante')).toBeInTheDocument();
    expect(signerProfilePanel).toHaveTextContent('Marina Prieto');
    expect(signerProfilePanel).toHaveTextContent('@mprieto');
    expect(signerProfilePanel).toHaveTextContent('Wallet empleada en la firma');
  });
});
