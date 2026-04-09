/**
 * Unit tests for DocumentRegistryContract
 *
 * Tests cover every public method of the consolidated wrapper, verifying
 * that calls are correctly forwarded to the underlying ethers.Contract
 * with proper bytes32 conversion and parameter validation.
 *
 * The ethers Contract is replaced by a vi.fn() mock so no live blockchain
 * node is required.
 /**
  * Unit tests for DocumentRegistryContract
  *
  * Uses vi.hoisted() so the mock contract instance is created before vi.mock
  * factories run, avoiding the "Cannot access before initialization" TDZ error
  * that occurs when factory callbacks reference module-level const/let vars.
  */
 
 import { describe, it, expect, vi, beforeEach } from 'vitest';
 import { ethers } from 'ethers';
 import {
   DocumentRegistryContract,
   AccessRole,
   DocumentStatus,
   createContracts,
 } from '../contracts';
 
 // ── Constants (safe at module level — only used in tests, not in the factory) ─
 
 const DOC_ID_PLAIN = 'my-document-1';
 const ADDR_A = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
 const ADDR_B = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
 const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
 const FAKE_TX_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
 const FAKE_RECEIPT = { hash: FAKE_TX_HASH, blockNumber: 42, gasUsed: 100000n };
 
 // ── vi.hoisted: create mock methods before ANY vi.mock factory executes ────────
 //
 // Variables returned from vi.hoisted() are the ONLY safe way to reference
 // shared state inside vi.mock() factories without TDZ errors.
 
 const contractMock = vi.hoisted(() => ({
   createDocument: vi.fn(),
   createVersion: vi.fn(),
   signDocument: vi.fn(),
   shareDocument: vi.fn(),
   revokePermission: vi.fn(),
   transferOwnership: vi.fn(),
   setArchiveStatus: vi.fn(),
   deleteDocument: vi.fn(),
   restoreVersion: vi.fn(),
   setOperationalVersion: vi.fn(),
   getDocument: vi.fn(),
   getVersion: vi.fn(),
   getVersionSignatures: vi.fn(),
   getUserPermission: vi.fn(),
   getUserDocuments: vi.fn(),
   getUserDocumentCount: vi.fn(),
   getDocumentUsers: vi.fn(),
   canView: vi.fn(),
   canEdit: vi.fn(),
   isOwner: vi.fn(),
   totalDocuments: vi.fn(),
   isPaused: vi.fn(),
   isUserSuspended: vi.fn(),
 }));
 
 // ── Mock ethers.Contract ──────────────────────────────────────────────────────
 //
 // The factory only references `contractMock` (hoisted) and `actual` (importOriginal).
 // No module-level const/let from this file is referenced here.
 
 vi.mock('ethers', async (importOriginal) => {
   const actual = await importOriginal<typeof import('ethers')>();
  // Must be a regular function (not arrow) so `new Contract(...)` works.
  // When a constructor returns a plain object, that object becomes the result.
  const MockContract = vi.fn(function () { return contractMock; });
   return { ...actual, Contract: MockContract };
 });
 
 // ── Helpers ───────────────────────────────────────────────────────────────────
 
 function makeSigner() {
   return {} as unknown as ethers.JsonRpcSigner;
 }
 
 function makeTx() {
   return { hash: FAKE_TX_HASH, wait: vi.fn().mockResolvedValue(FAKE_RECEIPT) };
 }
 
 // ── Fixture ───────────────────────────────────────────────────────────────────
 
 let registry: DocumentRegistryContract;
 // Computed after mock is set up (ethers.id still works — it's in ...actual spread)
 let DOC_BYTES32: string;
 
 beforeEach(() => {
   vi.clearAllMocks();
   DOC_BYTES32 = ethers.id(DOC_ID_PLAIN);
 
   const tx = makeTx();
 
   // Write methods
   contractMock.createDocument.mockResolvedValue(tx);
   contractMock.createVersion.mockResolvedValue(tx);
   contractMock.signDocument.mockResolvedValue(tx);
   contractMock.shareDocument.mockResolvedValue(tx);
   contractMock.revokePermission.mockResolvedValue(tx);
   contractMock.transferOwnership.mockResolvedValue(tx);
   contractMock.setArchiveStatus.mockResolvedValue(tx);
   contractMock.deleteDocument.mockResolvedValue(tx);
   contractMock.restoreVersion.mockResolvedValue(tx);
   contractMock.setOperationalVersion.mockResolvedValue(tx);
 
   // Read methods
   contractMock.getDocument.mockResolvedValue({
     docId: DOC_BYTES32,
     owner: ADDR_A,
     createdAt: 1700000000n,
     updatedAt: 1700000001n,
     currentVersion: 1n,
     latestVersion: 1n,
     isArchived: false,
     isDeleted: false,
   });
   contractMock.getVersion.mockResolvedValue({
     versionNumber: 1n,
     ipfsCid: 'QmFakeCid',
     encryptedKeyHash: ZERO_BYTES32,
     createdBy: ADDR_A,
     createdAt: 1700000000n,
     isOperational: true,
     restoredFrom: 0n,
   });
   contractMock.getVersionSignatures.mockResolvedValue([]);
   contractMock.getUserPermission.mockResolvedValue(3);
   contractMock.getUserDocuments.mockResolvedValue([DOC_BYTES32]);
   contractMock.getUserDocumentCount.mockResolvedValue(1n);
   contractMock.getDocumentUsers.mockResolvedValue([ADDR_A]);
   contractMock.canView.mockResolvedValue(true);
   contractMock.canEdit.mockResolvedValue(true);
   contractMock.isOwner.mockResolvedValue(true);
   contractMock.totalDocuments.mockResolvedValue(5n);
   contractMock.isPaused.mockResolvedValue(false);
   contractMock.isUserSuspended.mockResolvedValue(false);
 
   registry = new DocumentRegistryContract(makeSigner());
 });
 
 // ── Tests ─────────────────────────────────────────────────────────────────────
 
 describe('DocumentRegistryContract — write: document lifecycle', () => {
   it('createDocument encodes plain string id to bytes32 and passes ipfsCid + keyHash', async () => {
     const cid = 'QmSomeIpfsCid';
     const keyHash = ethers.keccak256(ethers.toUtf8Bytes('key'));
 
     const tx = await registry.createDocument(DOC_ID_PLAIN, cid, keyHash);
 
     expect(contractMock.createDocument).toHaveBeenCalledOnce();
     expect(contractMock.createDocument).toHaveBeenCalledWith(DOC_BYTES32, cid, keyHash);
     expect(tx.hash).toBe(FAKE_TX_HASH);
   });
 
   it('createDocument does not re-hash an already-hex bytes32 docId', async () => {
     await registry.createDocument(DOC_BYTES32, 'QmCid', ZERO_BYTES32);
     expect(contractMock.createDocument).toHaveBeenCalledWith(DOC_BYTES32, 'QmCid', ZERO_BYTES32);
   });
 
   it('createDocumentAndWait resolves with receipt after waiting for confirmation', async () => {
     const receipt = await registry.createDocumentAndWait(DOC_ID_PLAIN, 'QmCid', ZERO_BYTES32);
     expect(receipt.hash).toBe(FAKE_TX_HASH);
     expect(receipt.blockNumber).toBe(42);
   });
 
   it('createVersion sends correct args', async () => {
     await registry.createVersion(DOC_ID_PLAIN, 'QmV2Cid', ZERO_BYTES32);
     expect(contractMock.createVersion).toHaveBeenCalledWith(DOC_BYTES32, 'QmV2Cid', ZERO_BYTES32);
   });
 
   it('setArchiveStatus forwards archived flag', async () => {
     await registry.setArchiveStatus(DOC_ID_PLAIN, true);
     expect(contractMock.setArchiveStatus).toHaveBeenCalledWith(DOC_BYTES32, true);
   });
 
   it('deleteDocument forwards correct bytes32', async () => {
     await registry.deleteDocument(DOC_ID_PLAIN);
     expect(contractMock.deleteDocument).toHaveBeenCalledWith(DOC_BYTES32);
   });
 
   it('restoreVersion forwards version number', async () => {
     await registry.restoreVersion(DOC_ID_PLAIN, 2);
     expect(contractMock.restoreVersion).toHaveBeenCalledWith(DOC_BYTES32, 2);
   });
 
   it('setOperationalVersion forwards version number', async () => {
     await registry.setOperationalVersion(DOC_ID_PLAIN, 3);
     expect(contractMock.setOperationalVersion).toHaveBeenCalledWith(DOC_BYTES32, 3);
   });
 });
 
 describe('DocumentRegistryContract — write: sharing & permissions', () => {
   it('shareDocument forwards correct role as uint8', async () => {
     await registry.shareDocument(DOC_ID_PLAIN, ADDR_B, AccessRole.VIEWER);
     expect(contractMock.shareDocument).toHaveBeenCalledWith(DOC_BYTES32, ADDR_B, AccessRole.VIEWER);
   });
 
   it('shareDocument throws on invalid Ethereum address', async () => {
     await expect(
       registry.shareDocument(DOC_ID_PLAIN, 'not-an-address', AccessRole.VIEWER),
     ).rejects.toThrow('Invalid Ethereum address');
     expect(contractMock.shareDocument).not.toHaveBeenCalled();
   });
 
   it('shareDocumentAndWait returns receipt', async () => {
     const receipt = await registry.shareDocumentAndWait(DOC_ID_PLAIN, ADDR_B, AccessRole.EDITOR);
     expect(receipt.blockNumber).toBe(42);
   });
 
   it('revokePermission forwards address and throws on invalid address', async () => {
     await registry.revokePermission(DOC_ID_PLAIN, ADDR_B);
     expect(contractMock.revokePermission).toHaveBeenCalledWith(DOC_BYTES32, ADDR_B);
 
     await expect(
       registry.revokePermission(DOC_ID_PLAIN, 'bad-addr'),
     ).rejects.toThrow('Invalid Ethereum address');
   });
 
   it('transferOwnership throws on invalid address', async () => {
     await expect(
       registry.transferOwnership(DOC_ID_PLAIN, 'not-valid'),
     ).rejects.toThrow('Invalid Ethereum address');
   });
 
   it('transferOwnership forwards valid address', async () => {
     await registry.transferOwnership(DOC_ID_PLAIN, ADDR_B);
     expect(contractMock.transferOwnership).toHaveBeenCalledWith(DOC_BYTES32, ADDR_B);
   });
 
   it('transferOwnershipAndWait resolves with receipt', async () => {
     const receipt = await registry.transferOwnershipAndWait(DOC_ID_PLAIN, ADDR_B);
     expect(receipt.hash).toBe(FAKE_TX_HASH);
   });
 });
 
 describe('DocumentRegistryContract — write: signing', () => {
   const sig = new Uint8Array([1, 2, 3, 4]);
   const msg = 'Signed doc contents';
 
   it('signDocument forwards all arguments with bytes32 docId', async () => {
     await registry.signDocument(DOC_ID_PLAIN, 1, sig, msg, 'optional comment');
     expect(contractMock.signDocument).toHaveBeenCalledWith(DOC_BYTES32, 1, sig, msg, 'optional comment');
   });
 
   it('signDocument defaults comment to empty string', async () => {
     await registry.signDocument(DOC_ID_PLAIN, 1, sig, msg);
     expect(contractMock.signDocument).toHaveBeenCalledWith(DOC_BYTES32, 1, sig, msg, '');
   });
 
   it('signDocumentAndWait resolves with receipt', async () => {
     const receipt = await registry.signDocumentAndWait(DOC_ID_PLAIN, 1, sig, msg);
     expect(receipt.blockNumber).toBe(42);
   });
 });
 
 describe('DocumentRegistryContract — read functions', () => {
   it('getDocument returns document struct', async () => {
     const doc = await registry.getDocument(DOC_ID_PLAIN);
     expect(contractMock.getDocument).toHaveBeenCalledWith(DOC_BYTES32);
     expect(doc.isDeleted).toBe(false);
     expect(doc.isArchived).toBe(false);
     expect(doc.owner).toBe(ADDR_A);
   });
 
   it('getVersion returns version struct', async () => {
     const version = await registry.getVersion(DOC_ID_PLAIN, 1);
     expect(contractMock.getVersion).toHaveBeenCalledWith(DOC_BYTES32, 1);
     expect(version.isOperational).toBe(true);
   });
 
   it('getVersionSignatures returns array', async () => {
     const sigs = await registry.getVersionSignatures(DOC_ID_PLAIN, 1);
     expect(Array.isArray(sigs)).toBe(true);
   });
 
   it('getUserPermission returns numeric role', async () => {
     const role = await registry.getUserPermission(DOC_ID_PLAIN, ADDR_A);
     expect(role).toBe(3); // OWNER
   });
 
   it('getUserDocuments returns array of bytes32 ids', async () => {
     const docs = await registry.getUserDocuments(ADDR_A);
     expect(docs).toHaveLength(1);
     expect(docs[0]).toBe(DOC_BYTES32);
   });
 
   it('getUserDocumentCount returns bigint', async () => {
     const count = await registry.getUserDocumentCount(ADDR_A);
     expect(count).toBe(1n);
   });
 
   it('getDocumentUsers returns address array', async () => {
     const users = await registry.getDocumentUsers(DOC_ID_PLAIN);
     expect(users).toContain(ADDR_A);
   });
 
   it('canView returns boolean', async () => {
     expect(await registry.canView(DOC_ID_PLAIN, ADDR_A)).toBe(true);
   });
 
   it('canEdit returns boolean', async () => {
     expect(await registry.canEdit(DOC_ID_PLAIN, ADDR_A)).toBe(true);
   });
 
   it('isOwner returns boolean', async () => {
     expect(await registry.isOwner(DOC_ID_PLAIN, ADDR_A)).toBe(true);
   });
 
   it('totalDocuments returns bigint', async () => {
     expect(await registry.totalDocuments()).toBe(5n);
   });
 
   it('isPaused returns boolean', async () => {
     expect(await registry.isPaused()).toBe(false);
   });
 
   it('isUserSuspended returns boolean', async () => {
     expect(await registry.isUserSuspended(ADDR_A)).toBe(false);
   });
 });
 
 describe('DocumentRegistryContract — bytes32 conversion', () => {
   it('treats a short plain string as a key and hashes it', async () => {
     const key = 'short-key';
     const expected = ethers.id(key);
     await registry.getDocument(key);
     expect(contractMock.getDocument).toHaveBeenCalledWith(expected);
   });
 
   it('passes an already-valid 32-byte hex string without re-hashing', async () => {
     const alreadyBytes32 = ethers.zeroPadValue('0x01', 32);
     await registry.getDocument(alreadyBytes32);
     expect(contractMock.getDocument).toHaveBeenCalledWith(alreadyBytes32);
   });
 });
 
 describe('DocumentStatus and AccessRole enums', () => {
   it('DocumentStatus values match smart contract order', () => {
     expect(DocumentStatus.ACTIVE).toBe(0);
     expect(DocumentStatus.ARCHIVED).toBe(1);
     expect(DocumentStatus.DELETED).toBe(2);
   });
 
   it('AccessRole values match smart contract DocumentRole enum', () => {
     expect(AccessRole.NONE).toBe(0);
     expect(AccessRole.VIEWER).toBe(1);
     expect(AccessRole.EDITOR).toBe(2);
     expect(AccessRole.OWNER).toBe(3);
   });
 });
 
 describe('createContracts factory', () => {
   it('returns an object with registry property of correct type', () => {
     const contracts = createContracts(makeSigner());
     expect(contracts).toHaveProperty('registry');
     expect(contracts.registry).toBeInstanceOf(DocumentRegistryContract);
   });
 });
