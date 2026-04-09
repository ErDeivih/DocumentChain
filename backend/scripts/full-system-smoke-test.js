const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');
const { ethers } = require('ethers');
const DocumentRegistryArtifact = require('../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json');

const API_BASE_URL = 'http://localhost:3000/api';
const RPC_URL = 'http://localhost:8545';
const ZERO_HASH = ethers.ZeroHash;

const HARDHAT_MNEMONIC = 'test test test test test test test test test test test junk';

const testState = {
  provider: new ethers.JsonRpcProvider(RPC_URL),
  passes: [],
  failures: [],
};
const RUN_ID = Date.now().toString(36);

function getWallet(address) {
  for (let index = 0; index < 20; index += 1) {
    const candidate = ethers.HDNodeWallet.fromPhrase(
      HARDHAT_MNEMONIC,
      undefined,
      `m/44'/60'/0'/0/${index}`
    ).connect(testState.provider);

    if (candidate.address.toLowerCase() === address.toLowerCase()) {
      return candidate;
    }
  }

  throw new Error(`No derived Hardhat wallet found for ${address}`);
}

function recordPass(step, details) {
  testState.passes.push({ step, details });
  const formattedDetails = typeof details === 'string'
    ? details
    : details
      ? JSON.stringify(details)
      : '';
  console.log(`✅ ${step}${formattedDetails ? ` -> ${formattedDetails}` : ''}`);
}

function recordFail(step, error) {
  const message = error instanceof Error ? error.message : String(error);
  testState.failures.push({ step, message });
  console.error(`❌ ${step} -> ${message}`);
}

async function runStep(step, fn) {
  try {
    const details = await fn();
    recordPass(step, details);
    return details;
  } catch (error) {
    recordFail(step, error);
    return null;
  }
}

async function login(identifier, password) {
  const payload = identifier.includes('@')
    ? { email: identifier, password }
    : { username: identifier, password };

  const response = await axios.post(`${API_BASE_URL}/auth/login`, payload, {
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`POST /auth/login -> ${response.status} ${JSON.stringify(response.data)}`);
  }

  if (response.data.requires2FA || !response.data.accessToken) {
    throw new Error(`User ${identifier} requires interactive 2FA verification`);
  }

  const token = response.data.accessToken;
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    validateStatus: () => true,
  });

  return {
    api,
    token,
    user: response.data.user,
  };
}

async function apiOk(client, method, url, data, config) {
  const response = await client.request({ method, url, data, ...config });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${method.toUpperCase()} ${url} -> ${response.status} ${JSON.stringify(response.data)}`);
  }
  return response.data;
}

async function uploadForm(client, url, fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value && value.value && Buffer.isBuffer(value.value)) {
      form.append(key, value.value, {
        filename: value.filename,
        contentType: value.contentType,
      });
    } else if (value !== undefined && value !== null) {
      form.append(key, value);
    }
  }

  const response = await client.post(url, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`POST ${url} -> ${response.status} ${JSON.stringify(response.data)}`);
  }

  return response.data;
}

function makeRegistry(wallet, address) {
  return new ethers.Contract(address, DocumentRegistryArtifact.abi, wallet);
}

async function main() {
  console.log('===============================================');
  console.log('  DocumentChain - Full System Smoke Test');
  console.log('===============================================');

  const health = await runStep('Health check', async () => {
    const response = await axios.get(`${API_BASE_URL}/health/detailed`);
    if (response.data.status !== 'healthy') {
      throw new Error(JSON.stringify(response.data));
    }
    return `backend=${response.data.status}`;
  });

  const adminSession = await runStep('Login admin seed', () => login('admin', 'Admin123!'));
  const demo1 = await runStep('Login carmen_martin', () => login('carmen_martin', 'Demo123!'));
  const demo2 = await runStep('Login diego_ortega', () => login('diego_ortega', 'Demo123!'));

  if (!health || !adminSession || !demo1 || !demo2) {
    throw new Error('Base sessions could not be established');
  }

  const adminUsers = await runStep('Admin list users', async () => {
    const data = await apiOk(adminSession.api, 'get', '/admin/users');
    return `${data.users.length} users`;
  });

  await runStep('Admin system status', async () => {
    const data = await apiOk(adminSession.api, 'get', '/admin/system/status');
    return `paused=${data.isPaused ?? data.paused ?? 'unknown'}`;
  });

  await runStep('Auth me demo1', async () => {
    const data = await apiOk(demo1.api, 'get', '/auth/me');
    return data.user.username;
  });

  const demo1Profile = await runStep('Profile demo1', async () => {
    const data = await apiOk(demo1.api, 'get', '/users/profile');
    return data.user.username;
  });

  const demo1Wallets = await runStep('Wallets demo1', async () => {
    const data = await apiOk(demo1.api, 'get', '/wallets');
    return `${data.wallets.length} wallets`;
  });

  const demo2Wallets = await runStep('Wallets demo2', async () => {
    const data = await apiOk(demo2.api, 'get', '/wallets');
    return `${data.wallets.length} wallets`;
  });

  const demo1Primary = (await apiOk(demo1.api, 'get', '/wallets/primary')).wallet;
  const demo2Primary = (await apiOk(demo2.api, 'get', '/wallets/primary')).wallet;
  const demo1Wallet = getWallet(demo1Primary.address);
  const demo2Wallet = getWallet(demo2Primary.address);
  const demo1Signer = new ethers.NonceManager(demo1Wallet);
  const demo2Signer = new ethers.NonceManager(demo2Wallet);

  await runStep('Stats me demo1', async () => {
    const data = await apiOk(demo1.api, 'get', '/stats/me');
    return `documents=${data.stats?.documentsOwned ?? data.documentsOwned ?? 'n/a'}`;
  });

  const category = await runStep('Create/update/delete category demo1', async () => {
    const categoryName = `Smoke Category ${RUN_ID}`;
    const updatedCategoryName = `Smoke Category Updated ${RUN_ID}`;
    const created = await apiOk(demo1.api, 'post', '/categories', {
      name: categoryName,
      description: 'Created by smoke test',
      color: '#2255aa',
      icon: 'folder',
    });
    const categoryId = created.category.id;
    await apiOk(demo1.api, 'put', `/categories/${categoryId}`, {
      name: updatedCategoryName,
      description: 'Updated by smoke test',
      color: '#113377',
      isActive: true,
    });
    await apiOk(demo1.api, 'get', `/categories/${categoryId}/stats`);
    await apiOk(demo1.api, 'delete', `/categories/${categoryId}`);
    return categoryId;
  });

  const folderId = await runStep('Create/update/get/delete folder demo1', async () => {
    const folderName = `Smoke Folder ${RUN_ID}`;
    const updatedFolderName = `Smoke Folder Updated ${RUN_ID}`;
    const created = await apiOk(demo1.api, 'post', '/folders', {
      name: folderName,
      description: 'Created by smoke test',
      color: '#334455',
      icon: 'folder',
    });
    const id = created.folder.id;
    await apiOk(demo1.api, 'put', `/folders/${id}`, {
      name: updatedFolderName,
      description: 'Updated by smoke test',
    });
    await apiOk(demo1.api, 'get', `/folders/${id}`);
    await apiOk(demo1.api, 'get', `/folders/${id}/path`);
    await apiOk(demo1.api, 'get', `/folders/${id}/stats`);
    return id;
  });

  const contractAddress = (await apiOk(demo1.api, 'get', '/config/contracts')).contracts.documentRegistry;
  const registryAsDemo1 = makeRegistry(demo1Signer, contractAddress);
  const registryAsDemo2 = makeRegistry(demo2Signer, contractAddress);

  const preparedDocument = await runStep('Prepare document create demo1', async () => {
    const payload = await uploadForm(demo1.api, '/documents/prepare', {
      encryptedFile: {
        value: Buffer.from('Smoke test document content', 'utf8'),
        filename: 'smoke-document.txt',
        contentType: 'text/plain',
      },
      name: 'Smoke Test Document',
      mimeType: 'text/plain',
      walletId: demo1Primary.id,
      folderId,
      tags: JSON.stringify(['smoke', 'api']),
    });
    return payload;
  });

  let createdDocumentId = null;
  let blockchainDocId = null;

  if (preparedDocument) {
    await runStep('Create document on blockchain demo1', async () => {
      const tx = await registryAsDemo1.createDocument(preparedDocument.docId, preparedDocument.ipfsCid, ZERO_HASH);
      await tx.wait();
      await apiOk(demo1.api, 'post', '/documents/confirm', {
        documentId: preparedDocument.documentId,
        txHash: tx.hash,
        blockchainId: preparedDocument.docId,
      });
      createdDocumentId = preparedDocument.documentId;
      blockchainDocId = preparedDocument.docId;
      return tx.hash;
    });
  }

  if (createdDocumentId) {
    await runStep('List/get/download document demo1', async () => {
      await apiOk(demo1.api, 'get', '/documents');
      await apiOk(demo1.api, 'get', `/documents/${createdDocumentId}`);
      const download = await demo1.api.get(`/documents/${createdDocumentId}/download`, {
        responseType: 'arraybuffer',
        validateStatus: () => true,
      });
      if (download.status < 200 || download.status >= 300) {
        throw new Error(`download failed -> ${download.status}`);
      }
      return `${download.data.byteLength} bytes`;
    });

    if (folderId) {
      await runStep('Move document to folder demo1', async () => {
        await apiOk(demo1.api, 'post', `/folders/${folderId}/move`, {
          documentIds: [createdDocumentId],
        });
        return folderId;
      });
    }

    await runStep('Assign category demo1', async () => {
      const created = await apiOk(demo1.api, 'post', '/categories', {
        name: `Smoke Assign Category ${RUN_ID}`,
      });
      await apiOk(demo1.api, 'post', '/categories/assign', {
        documentIds: [createdDocumentId],
        categoryId: created.category.id,
      });
      return created.category.id;
    });

    const preparedVersion = await runStep('Prepare version create demo1', async () => {
      const payload = await uploadForm(demo1.api, `/documents/${createdDocumentId}/versions/prepare`, {
        encryptedFile: {
          value: Buffer.from('Smoke test document v2 content', 'utf8'),
          filename: 'smoke-document-v2.txt',
          contentType: 'text/plain',
        },
        walletId: demo1Primary.id,
        comment: 'Smoke version 2',
      });
      return payload;
    });

    let versionId = null;
    if (preparedVersion) {
      await runStep('Create version on blockchain demo1', async () => {
        const tx = await registryAsDemo1.createVersion(blockchainDocId, preparedVersion.ipfsCid, ZERO_HASH);
        await tx.wait();
        await apiOk(demo1.api, 'post', `/documents/${createdDocumentId}/versions/confirm`, {
          documentId: createdDocumentId,
          versionId: preparedVersion.versionId,
          txHash: tx.hash,
          blockchainId: preparedVersion.versionNumber,
        });
        versionId = preparedVersion.versionId;
        return tx.hash;
      });
    }

    await runStep('List versions and signatures demo1', async () => {
      const versions = await apiOk(demo1.api, 'get', `/documents/${createdDocumentId}/versions`);
      await apiOk(demo1.api, 'get', `/documents/${createdDocumentId}/signatures`);
      await apiOk(demo1.api, 'get', `/documents/${createdDocumentId}/stats`);
      return `${versions.versions.length} versions`;
    });

    await runStep('Prepare and confirm share demo1->demo2', async () => {
      const decryptedSymmetricKey = crypto.randomBytes(32).toString('base64');
      const preparedShare = await apiOk(demo1.api, 'post', `/documents/${createdDocumentId}/share/prepare`, {
        sharedWithUserId: demo2.user.id,
        role: 'SHARED_READ',
        walletId: demo1Primary.id,
        decryptedSymmetricKey,
      });
      const tx = await registryAsDemo1.shareDocument(blockchainDocId, demo2Primary.address, 1);
      await tx.wait();
      await apiOk(demo1.api, 'post', `/documents/${createdDocumentId}/share/confirm`, {
        shareId: preparedShare.shareId,
        txHash: tx.hash,
      });
      await apiOk(demo1.api, 'get', `/documents/${createdDocumentId}/check-permission?role=SHARED_READ`);
      return tx.hash;
    });

    await runStep('Shared document visible to demo2', async () => {
      const shared = await apiOk(demo2.api, 'get', '/shares/with-me');
      const match = shared.documents.find((doc) => doc.id === createdDocumentId);
      if (!match) {
        throw new Error('Shared document not visible to recipient');
      }
      return `shared docs=${shared.documents.length}`;
    });

    await runStep('Prepare and confirm signature demo2', async () => {
      const preparedSignature = await apiOk(demo2.api, 'post', '/signatures/prepare', {
        documentId: createdDocumentId,
        versionNumber: 2,
        walletId: demo2Primary.id,
      });
      const ecdsaSignature = await demo2Wallet.signMessage(preparedSignature.messageToSign);
      const tx = await registryAsDemo2.signDocument(
        blockchainDocId,
        preparedSignature.versionId,
        ecdsaSignature,
        preparedSignature.messageToSign,
        'Smoke test signature'
      );
      await tx.wait();
      await apiOk(demo2.api, 'post', '/signatures/confirm', {
        signatureId: preparedSignature.signatureId,
        txHash: tx.hash,
        ecdsaSignature,
      });
      return tx.hash;
    });

    await runStep('Archive document demo1', async () => {
      await apiOk(demo1.api, 'post', `/documents/${createdDocumentId}/archive/prepare`);
      const tx = await registryAsDemo1.setArchiveStatus(blockchainDocId, true);
      await tx.wait();
      await apiOk(demo1.api, 'post', `/documents/${createdDocumentId}/archive/confirm`, {
        txHash: tx.hash,
      });
      return tx.hash;
    });

    await runStep('Prepare and confirm transfer demo1->demo2', async () => {
      const decryptedSymmetricKey = crypto.randomBytes(32).toString('base64');
      const preparedTransfer = await apiOk(demo1.api, 'post', `/documents/${createdDocumentId}/transfer/prepare`, {
        newOwnerId: demo2.user.id,
        walletId: demo1Primary.id,
        newOwnerWalletAddress: demo2Primary.address,
        decryptedSymmetricKey,
      });
      const tx = await registryAsDemo1['transferOwnership(bytes32,address)'](
        preparedTransfer.docId,
        preparedTransfer.newOwnerAddress,
      );
      await tx.wait();
      await apiOk(demo1.api, 'post', `/documents/${createdDocumentId}/transfer/confirm`, {
        transferId: preparedTransfer.transferId,
        txHash: tx.hash,
        signature: preparedTransfer.message,
      });
      return tx.hash;
    });

    await runStep('Transferred document visible to demo2 as owner', async () => {
      const doc = await apiOk(demo2.api, 'get', `/documents/${createdDocumentId}`);
      if (doc.document.ownerId !== demo2.user.id) {
        throw new Error(`Expected owner ${demo2.user.id}, got ${doc.document.ownerId}`);
      }
      return `ownerId=${doc.document.ownerId}`;
    });
  }

  await runStep('Prepare and confirm suspension demo2', async () => {
    const prepared = await apiOk(demo2.api, 'post', '/users/me/suspend/prepare', {
      reason: 'Smoke test suspension',
    });
    const tx = await registryAsDemo2.suspendMyself();
    await tx.wait();
    await apiOk(demo2.api, 'post', '/users/me/suspend/confirm', {
      txHash: tx.hash,
      reason: 'Smoke test suspension',
    });
    return tx.hash;
  });

  await runStep('Suspended demo2 blocked from documents', async () => {
    const response = await demo2.api.get('/documents', { validateStatus: () => true });
    if (response.status !== 403) {
      throw new Error(`Expected 403, got ${response.status}`);
    }
    return response.data.error;
  });

  await runStep('Suspended demo2 can still call auth/me', async () => {
    const data = await apiOk(demo2.api, 'get', '/auth/me');
    if (!data.user.isSuspended) {
      throw new Error('Expected suspended user in /auth/me');
    }
    return data.user.username;
  });

  await runStep('Prepare and confirm reactivation demo2', async () => {
    await apiOk(demo2.api, 'post', '/users/me/unsuspend/prepare');
    const tx = await registryAsDemo2.unsuspendMyself();
    await tx.wait();
    await apiOk(demo2.api, 'post', '/users/me/unsuspend/confirm', {
      txHash: tx.hash,
    });
    return tx.hash;
  });

  await runStep('Demo2 regains documents access', async () => {
    const response = await demo2.api.get('/documents', { validateStatus: () => true });
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    return `${response.data.documents.length} docs visible`;
  });

  if (folderId) {
    await runStep('Delete folder demo1', async () => {
      await apiOk(demo1.api, 'delete', `/folders/${folderId}?deleteContents=true`);
      return folderId;
    });
  }

  console.log('-----------------------------------------------');
  console.log(`PASSED: ${testState.passes.length}`);
  console.log(`FAILED: ${testState.failures.length}`);
  if (testState.failures.length > 0) {
    console.log(JSON.stringify(testState.failures, null, 2));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Smoke test aborted:', error);
  process.exit(1);
});