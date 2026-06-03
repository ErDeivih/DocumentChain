import { describe, expect, it } from 'vitest';
import { ethers } from 'ethers';
import { buildDocumentSignaturePayloadHash, toDocumentBytes32 } from '../services/blockchain/signaturePayload';

describe('document signature payload', () => {
  it('normalizes plain document ids to bytes32', () => {
    expect(toDocumentBytes32('document-1')).toBe(ethers.id('document-1'));
  });

  it('keeps valid bytes32 document ids unchanged', () => {
    const bytes32 = ethers.zeroPadValue('0x01', 32);
    expect(toDocumentBytes32(bytes32)).toBe(bytes32);
  });

  it('matches Solidity abi.encode payload hashing', () => {
    const docId = ethers.id('document-1');
    const message = 'DocumentChain - Firma Digital';
    const contractAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const chainId = 31337n;
    const domain = ethers.id('DocumentChain.Signature');
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'bytes32', 'uint256', 'bytes32', 'address', 'uint256'],
      [domain, docId, 2n, ethers.keccak256(ethers.toUtf8Bytes(message)), contractAddress, chainId],
    );

    expect(buildDocumentSignaturePayloadHash(docId, 2, message, contractAddress, chainId)).toBe(
      ethers.keccak256(encoded),
    );
  });
});
