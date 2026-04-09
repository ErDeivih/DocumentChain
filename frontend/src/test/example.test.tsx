import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OperationalVersionSelector } from '../components/documents/OperationalVersionSelector';

const { putMock, listByVersionMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
  listByVersionMock: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  api: {
    put: putMock,
  },
  getErrorMessage: (error: unknown) => (error instanceof Error ? error.message : 'Error'),
}));

vi.mock('../api/signatures', () => ({
  signaturesApi: {
    listByVersion: listByVersionMock,
  },
}));

describe('OperationalVersionSelector', () => {
  beforeEach(() => {
    putMock.mockReset();
    listByVersionMock.mockReset();
  });

  it('renders provided versions including fallback text for pending CIDs', () => {
    render(
      <OperationalVersionSelector
        documentId="document-1"
        isOwner
        versions={[
          {
            id: 'version-2',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 2,
            ipfsCid: null,
            createdAt: '2026-04-05T10:00:00.000Z',
            isOperational: false,
            comment: 'Pendiente de CID visible',
            blockchainStatus: 'SYNCED',
          },
          {
            id: 'version-1',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 1,
            ipfsCid: 'QmVersionOneCid',
            createdAt: '2026-04-04T10:00:00.000Z',
            isOperational: true,
            comment: 'Versión inicial',
            blockchainStatus: 'SYNCED',
          },
        ]}
      />
    );

    expect(screen.getByText('Versión 2')).toBeInTheDocument();
    expect(screen.getByText('Pendiente de CID visible')).toBeInTheDocument();
    expect(screen.getByText('CID pendiente')).toBeInTheDocument();
    expect(screen.getByText('Versión 1')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('allows the owner to activate another version and updates local state', async () => {
    putMock.mockResolvedValue({ data: {} });
    const onVersionChange = vi.fn();

    render(
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
            ipfsCid: 'QmVersionTwoCid',
            createdAt: '2026-04-05T10:00:00.000Z',
            isOperational: false,
            comment: null,
            blockchainStatus: 'SYNCED',
          },
          {
            id: 'version-1',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 1,
            ipfsCid: 'QmVersionOneCid',
            createdAt: '2026-04-04T10:00:00.000Z',
            isOperational: true,
            comment: null,
            blockchainStatus: 'SYNCED',
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /activar/i }));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledWith('/documents/document-1/operational-version', {
        versionNumber: 2,
      });
    });

    expect(onVersionChange).toHaveBeenCalledWith(2);
    expect(screen.getByText('Versión 2 establecida como operacional')).toBeInTheDocument();
    expect(screen.getAllByText('Activa')).toHaveLength(1);
  });

  it('renders the empty state when there are no versions', () => {
    render(
      <OperationalVersionSelector
        documentId="document-1"
        isOwner={false}
        versions={[]}
      />
    );

    expect(screen.getByText('No hay versiones disponibles')).toBeInTheDocument();
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

    render(
      <OperationalVersionSelector
        documentId="document-1"
        isOwner={false}
        versions={[
          {
            id: 'version-1',
            documentId: 'document-1',
            userId: 'user-1',
            versionNumber: 1,
            ipfsCid: 'QmVersionOneCid',
            createdAt: '2026-04-04T10:00:00.000Z',
            isOperational: true,
            comment: 'Versión inicial',
            blockchainStatus: 'SYNCED',
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /ver firmantes/i }));

    await waitFor(() => {
      expect(listByVersionMock).toHaveBeenCalledWith('document-1', 1);
    });

    const signerProfilePanel = screen.getByTestId('signer-profile-panel');

    expect(screen.getByText('Firmantes de la versión 1')).toBeInTheDocument();
    expect(screen.getByText('Perfil del firmante')).toBeInTheDocument();
    expect(signerProfilePanel).toHaveTextContent('Marina Prieto');
    expect(signerProfilePanel).toHaveTextContent('@mprieto');
    expect(signerProfilePanel).toHaveTextContent('Cuenta actual');
  });
});
