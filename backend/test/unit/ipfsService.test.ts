/**
 * Tests for IPFSService - Wrapper over IPFS self-hosted node.
 * Covers: uploadFile, downloadFile, pinFile, unpinFile, getPinStatus,
 * isAvailable, uploadMultipleFiles, calculateCID, garbageCollect.
 */

const mockIpfsAdapter = {
  add: jest.fn(),
  cat: jest.fn(),
  pin: jest.fn(),
  unpin: jest.fn(),
  getPinStatus: jest.fn(),
};

jest.mock('../../src/config/ipfs', () => ({
  __esModule: true,
  ipfsClient: mockIpfsAdapter,
  ipfsNodeClient: mockIpfsAdapter,
  IPFSAdapter: jest.fn(),
  SelfHostedIPFSClient: jest.fn(),
  uploadToIPFS: jest.fn().mockResolvedValue('QmTest'),
  downloadFromIPFS: jest.fn().mockResolvedValue(Buffer.from('encrypted')),
  deleteFromIPFS: jest.fn().mockResolvedValue(undefined),
  unpinFromIPFS: jest.fn().mockResolvedValue(undefined),
}));

import { ipfsService, IPFSService } from '../../src/services/ipfsService';

describe('IPFSService', () => {
  const testBuffer = Buffer.from('Hello IPFS');
  const testCid = 'QmTest123456789abcdef';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile()', () => {
    it('should upload file and pin it', async () => {
      mockIpfsAdapter.add.mockResolvedValue(testCid);
      mockIpfsAdapter.pin.mockResolvedValue(undefined);

      const result = await ipfsService.uploadFile(testBuffer);

      expect(result.cid).toBe(testCid);
      expect(result.size).toBe(testBuffer.length);
      expect(result.pinned).toBe(true);
      expect(mockIpfsAdapter.add).toHaveBeenCalledWith(testBuffer);
      expect(mockIpfsAdapter.pin).toHaveBeenCalledWith(testCid);
    });

    it('should still succeed if pin throws (treat as already pinned)', async () => {
      mockIpfsAdapter.add.mockResolvedValue(testCid);
      mockIpfsAdapter.pin.mockRejectedValue(new Error('already pinned'));

      const result = await ipfsService.uploadFile(testBuffer);

      expect(result.cid).toBe(testCid);
      expect(result.pinned).toBe(true);
    });

    it('should throw on upload failure', async () => {
      mockIpfsAdapter.add.mockRejectedValue(new Error('Network error'));

      await expect(ipfsService.uploadFile(testBuffer)).rejects.toThrow('Error al subir a IPFS');
    });
  });

  describe('downloadFile()', () => {
    it('should download file by CID', async () => {
      mockIpfsAdapter.cat.mockResolvedValue(testBuffer);

      const result = await ipfsService.downloadFile(testCid);

      expect(result).toEqual(testBuffer);
      expect(mockIpfsAdapter.cat).toHaveBeenCalledWith(testCid);
    });

    it('should throw on download failure', async () => {
      mockIpfsAdapter.cat.mockRejectedValue(new Error('Not found'));

      await expect(ipfsService.downloadFile(testCid)).rejects.toThrow('Error al descargar de IPFS');
    });
  });

  describe('pinFile()', () => {
    it('should pin a file', async () => {
      mockIpfsAdapter.pin.mockResolvedValue(undefined);

      await ipfsService.pinFile(testCid);

      expect(mockIpfsAdapter.pin).toHaveBeenCalledWith(testCid);
    });

    it('should throw on pin failure', async () => {
      mockIpfsAdapter.pin.mockRejectedValue(new Error('Pin failed'));

      await expect(ipfsService.pinFile(testCid)).rejects.toThrow('Error al anclar en IPFS');
    });
  });

  describe('unpinFile()', () => {
    it('should unpin a file', async () => {
      mockIpfsAdapter.unpin.mockResolvedValue(undefined);

      await ipfsService.unpinFile(testCid);

      expect(mockIpfsAdapter.unpin).toHaveBeenCalledWith(testCid);
    });

    it('should throw on unpin failure', async () => {
      mockIpfsAdapter.unpin.mockRejectedValue(new Error('Unpin failed'));

      await expect(ipfsService.unpinFile(testCid)).rejects.toThrow('Error al desanclar de IPFS');
    });
  });

  describe('getPinStatus()', () => {
    it('should return pinned=true when status is "pinned"', async () => {
      mockIpfsAdapter.getPinStatus.mockResolvedValue({
        status: 'pinned',
        peer_map: {},
      });

      const result = await ipfsService.getPinStatus(testCid);

      expect(result.cid).toBe(testCid);
      expect(result.isPinned).toBe(true);
    });

    it('should return pinned=true when peer_map exists', async () => {
      mockIpfsAdapter.getPinStatus.mockResolvedValue({
        status: 'unknown',
        peer_map: { node1: {} },
      });

      const result = await ipfsService.getPinStatus(testCid);

      expect(result.isPinned).toBeTruthy();
    });

    it('should return pinned=false on error', async () => {
      mockIpfsAdapter.getPinStatus.mockRejectedValue(new Error('Not found'));

      const result = await ipfsService.getPinStatus(testCid);

      expect(result.isPinned).toBe(false);
      expect(result.peerMap).toEqual({});
    });
  });

  describe('isAvailable()', () => {
    it('should return true when file is pinned', async () => {
      mockIpfsAdapter.getPinStatus.mockResolvedValue({
        status: 'pinned',
        peer_map: {},
      });

      const result = await ipfsService.isAvailable(testCid);

      expect(result).toBe(true);
    });

    it('should treat non-null peer_map as available', async () => {
      mockIpfsAdapter.getPinStatus.mockResolvedValue({
        status: 'not_pinned',
        size: 0,
        peer_map: {},
      });

      const result = await ipfsService.isAvailable(testCid);

      expect(result).toBeTruthy();
    });
  });

  describe('uploadMultipleFiles()', () => {
    it('should upload multiple files sequentially', async () => {
      mockIpfsAdapter.add
        .mockResolvedValueOnce('QmFile1')
        .mockResolvedValueOnce('QmFile2')
        .mockResolvedValueOnce('QmFile3');
      mockIpfsAdapter.pin.mockResolvedValue(undefined);

      const files = [Buffer.from('a'), Buffer.from('b'), Buffer.from('c')];
      const results = await ipfsService.uploadMultipleFiles(files);

      expect(results).toHaveLength(3);
      expect(results[0].cid).toBe('QmFile1');
      expect(results[1].cid).toBe('QmFile2');
      expect(results[2].cid).toBe('QmFile3');
    });

    it('should throw on batch failure', async () => {
      mockIpfsAdapter.add.mockRejectedValue(new Error('Batch error'));

      const files = [Buffer.from('a')];
      await expect(ipfsService.uploadMultipleFiles(files)).rejects.toThrow('Error en carga por lote');
    });
  });

  describe('calculateCID()', () => {
    it('should return a placeholder CID', async () => {
      const result = await ipfsService.calculateCID(testBuffer);

      expect(result).toMatch(/^QmPlaceholder/);
    });
  });

  describe('garbageCollect()', () => {
    it('should return zero values as placeholder', async () => {
      const result = await ipfsService.garbageCollect();

      expect(result.cleaned).toBe(0);
      expect(result.freedBytes).toBe(0);
    });
  });
});
