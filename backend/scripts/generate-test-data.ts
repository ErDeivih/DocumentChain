import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, BlockchainStatus } from '@prisma/client';
import { ethers } from 'ethers';
import { Argon2Service } from '../src/services/argon2Service';
import { KeyManager } from '../src/lib/crypto/KeyManager';

type ProfileName = 'qa-fast' | 'qa-max';

interface ProfileConfig {
  users: number;
  docsPerUser: number;
  maxVersionsPerDoc: number;
  signaturesPerDoc: number;
  walletsPerUser: number;
}

interface CliOptions {
  profile: ProfileName;
  reset: boolean;
  includeSeed: boolean;
}

interface GeneratedUser {
  id: string;
  username: string;
  email: string;
  password: string;
  walletIds: string[];
  walletAddresses: string[];
  /** Hardhat account index (0-based, funded range 0..19). */
  ethWalletIndex: number;
}

interface DemoIdentity {
  username: string;
  email: string;
  fullName: string;
}

// ── Blockchain setup ────────────────────────────────────────────────────────

const HARDHAT_RPC_URL = process.env.BLOCKCHAIN_RPC_URL ?? 'http://localhost:8545';
const HARDHAT_DEPLOYER_KEY =
  process.env.BLOCKCHAIN_PRIVATE_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const CONTRACT_ADDRESS =
  process.env.CONTRACT_DOCUMENT_REGISTRY ?? '0x5FbDB2315678afecb367f032d93F642f64180aa3';
// Standard Hardhat / Anvil deterministic mnemonic
const HARDHAT_MNEMONIC = 'test test test test test test test test test test test junk';
const HARDHAT_FUNDED_ACCOUNT_COUNT = 20;

interface BlockchainContext {
  provider: ethers.JsonRpcProvider;
  contract: ethers.Contract;
  /** Return the Hardhat funded wallet at derivation-path index `i`. Index 0 = deployer. */
  getWallet: (i: number) => ethers.HDNodeWallet;
  /** Return a nonce-managed signer for index `i` to avoid nonce race conditions. */
  getSigner: (i: number) => ethers.NonceManager;
}

async function setupBlockchain(): Promise<BlockchainContext | null> {
  try {
    const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    // Will throw if the node is unreachable
    await provider.getNetwork();

    const abiPath = path.resolve(
      __dirname,
      '../../smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json',
    );
    const { abi } = JSON.parse(fs.readFileSync(abiPath, 'utf8')) as { abi: ethers.InterfaceAbi };

    const deployer = new ethers.Wallet(HARDHAT_DEPLOYER_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, deployer);

    const walletCache = new Map<number, ethers.HDNodeWallet>();
    const signerCache = new Map<number, ethers.NonceManager>();

    const getWallet = (i: number) => {
      const cached = walletCache.get(i);
      if (cached) return cached;
      const wallet = ethers.HDNodeWallet.fromPhrase(
        HARDHAT_MNEMONIC,
        undefined,
        `m/44'/60'/0'/0/${i}`,
      ).connect(provider) as ethers.HDNodeWallet;
      walletCache.set(i, wallet);
      return wallet;
    };

    const getSigner = (i: number) => {
      const cached = signerCache.get(i);
      if (cached) return cached;
      const signer = new ethers.NonceManager(getWallet(i));
      signerCache.set(i, signer);
      return signer;
    };

    console.log(
      `[blockchain] Conectado a Hardhat ${HARDHAT_RPC_URL} — contrato ${CONTRACT_ADDRESS}`,
    );
    return { provider, contract, getWallet, getSigner };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[blockchain] Nodo no disponible (${msg}). Se usarán hashes sintéticos.`);
    return null;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo123!';

const DEMO_IDENTITIES: DemoIdentity[] = [
  { username: 'laura_garcia', email: 'laura.garcia@documentchain.local', fullName: 'Laura Garcia' },
  { username: 'carmen_martin', email: 'carmen.martin@documentchain.local', fullName: 'Carmen Martin' },
  { username: 'alberto_ruiz', email: 'alberto.ruiz@documentchain.local', fullName: 'Alberto Ruiz' },
  { username: 'diego_ortega', email: 'diego.ortega@documentchain.local', fullName: 'Diego Ortega' },
  { username: 'nuria_sanz', email: 'nuria.sanz@documentchain.local', fullName: 'Nuria Sanz' },
  { username: 'sergio_pascual', email: 'sergio.pascual@documentchain.local', fullName: 'Sergio Pascual' },
  { username: 'marta_herrera', email: 'marta.herrera@documentchain.local', fullName: 'Marta Herrera' },
  { username: 'pablo_navarro', email: 'pablo.navarro@documentchain.local', fullName: 'Pablo Navarro' },
  { username: 'elena_castro', email: 'elena.castro@documentchain.local', fullName: 'Elena Castro' },
  { username: 'jorge_benito', email: 'jorge.benito@documentchain.local', fullName: 'Jorge Benito' },
  { username: 'irene_molina', email: 'irene.molina@documentchain.local', fullName: 'Irene Molina' },
  { username: 'raul_soto', email: 'raul.soto@documentchain.local', fullName: 'Raul Soto' },
  { username: 'beatriz_lozano', email: 'beatriz.lozano@documentchain.local', fullName: 'Beatriz Lozano' },
  { username: 'adrian_calvo', email: 'adrian.calvo@documentchain.local', fullName: 'Adrian Calvo' },
  { username: 'lucia_prieto', email: 'lucia.prieto@documentchain.local', fullName: 'Lucia Prieto' },
  { username: 'daniel_marin', email: 'daniel.marin@documentchain.local', fullName: 'Daniel Marin' },
  { username: 'clara_rey', email: 'clara.rey@documentchain.local', fullName: 'Clara Rey' },
  { username: 'alvaro_robles', email: 'alvaro.robles@documentchain.local', fullName: 'Alvaro Robles' },
  { username: 'patricia_diaz', email: 'patricia.diaz@documentchain.local', fullName: 'Patricia Diaz' },
  { username: 'miguel_pena', email: 'miguel.pena@documentchain.local', fullName: 'Miguel Pena' },
];

function getDemoIdentity(index: number): DemoIdentity {
  const predefined = DEMO_IDENTITIES[index];
  if (predefined) {
    return predefined;
  }

  const suffix = String(index + 1).padStart(2, '0');
  return {
    username: `usuario_demo_${suffix}`,
    email: `usuario.demo.${suffix}@documentchain.local`,
    fullName: `Usuario Demo ${suffix}`,
  };
}

const PROFILES: Record<ProfileName, ProfileConfig> = {
  'qa-fast': {
    users: 6,
    docsPerUser: 3,
    maxVersionsPerDoc: 2,
    signaturesPerDoc: 2,
    walletsPerUser: 2,
  },
  'qa-max': {
    users: 20,
    docsPerUser: 12,
    maxVersionsPerDoc: 5,
    signaturesPerDoc: 4,
    walletsPerUser: 3,
  },
};

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const requestedProfile =
    args.find((arg) => arg.startsWith('--profile='))?.split('=')[1] ??
    process.env.SEED_PROFILE ??
    'qa-fast';
  const profile = requestedProfile === 'qa-max' ? 'qa-max' : 'qa-fast';

  return {
    profile,
    reset: true,
    includeSeed: !args.includes('--skip-seed'),
  };
}

function runReset(includeSeed: boolean): void {
  console.log('\n[1/6] Reseteando base de datos...');
  const seedFlag = includeSeed ? '' : ' --skip-seed';
  execSync(`npx prisma migrate reset --force${seedFlag}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
}

function randomHash(prefix: string, n: number): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`${prefix}-${n}-${Date.now()}-${Math.random()}`));
}

function txHash(n: number): string {
  return ethers.keccak256(ethers.toUtf8Bytes(`tx-${n}-${Date.now()}-${Math.random()}`));
}

async function createUser(
  index: number,
  walletCount: number,
  bc: BlockchainContext | null,
): Promise<GeneratedUser> {
  const identity = getDemoIdentity(index);
  const { username, email, fullName } = identity;

  const { publicKey, privateKey } = KeyManager.generateKeyPair();
  const recoveryKey = KeyManager.generateRecoveryKey();
  const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
  const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, DEMO_PASSWORD);
  const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);
  const passwordHash = await Argon2Service.hash(DEMO_PASSWORD);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      passwordHash,
      publicKey,
      encryptedPrivateKey,
      recoveryKeyHash,
      encryptedPrivateKeyRecovery,
      twoFactorEnabled: index % 2 === 0,
      twoFactorSecret: index % 2 === 0 ? `JBSWY3DPEHPK3PXP${index}` : null,
      twoFactorBackupCodes: index % 2 === 0 ? JSON.stringify([`code-${index}-1`, `code-${index}-2`]) : null,
      isSuspended: index > 0 && index % 9 === 0,
      suspendedAt: index > 0 && index % 9 === 0 ? new Date(Date.now() - index * 3600 * 1000) : null,
      suspendReason: index > 0 && index % 9 === 0 ? 'Cuenta suspendida para pruebas QA' : null,
    },
  });

  await prisma.userStats.create({
    data: {
      userId: user.id,
      totalDocuments: 0,
      totalSize: BigInt(0),
      totalShared: 0,
      totalDownloads: 0,
      totalSignatures: 0,
      totalTransfers: 0,
      totalRestores: 0,
      totalUnpins: 0,
    },
  });

  await prisma.notificationPreference.create({
    data: {
      userId: user.id,
      emailEnabled: true,
      pushEnabled: index % 2 === 0,
      typePreferences: {
        documentShared: true,
        documentSigned: true,
        transferReceived: true,
      },
    },
  });

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: `email-token-${index}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      verified: index % 3 === 0,
      verifiedAt: index % 3 === 0 ? new Date() : null,
    },
  });

  if (index % 2 === 1) {
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: `reset-token-${index}-${Date.now()}`,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        used: false,
      },
    });
  }

  const walletIds: string[] = [];
  const walletAddresses: string[] = [];
  // Hardhat funded accounts are 0..19; recycle indexes if user count exceeds that.
  const ethWalletIndex = index % HARDHAT_FUNDED_ACCOUNT_COUNT;

  for (let i = 0; i < walletCount; i += 1) {
    // Primary wallet uses the corresponding Hardhat funded account so the seed
    // can sign real blockchain transactions. Extra wallets remain random.
    const wallet =
      i === 0 && bc
        ? bc.getWallet(ethWalletIndex)
        : ethers.Wallet.createRandom();
    const created = await prisma.wallet.create({
      data: {
        userId: user.id,
        walletAddress: wallet.address.toLowerCase(),
        nickname: i === 0 ? 'Principal' : `Secundaria ${i}`,
        isPrimary: i === 0,
        isConnected: true,
      },
    });

    walletIds.push(created.id);
    walletAddresses.push(created.walletAddress);
  }

  return {
    id: user.id,
    username,
    email,
    password: DEMO_PASSWORD,
    walletIds,
    walletAddresses,
    ethWalletIndex,
  };
}

async function createDocumentsAndEvents(
  users: GeneratedUser[],
  config: ProfileConfig,
  bc: BlockchainContext | null,
): Promise<void> {
  console.log('[3/6] Generando documentos, versiones, firmas, comparticiones y auditoria...');
  if (bc) {
    console.log('      [blockchain] Transacciones reales activadas');
  } else {
    console.log('      [blockchain] Modo sintético (nodo no disponible)');
  }

  let blockchainCounter = 1;
  const baseDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const docKinds = [
    { ext: 'pdf', mime: 'application/pdf', name: 'contrato_arrendamiento' },
    { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'informe_trimestral' },
    { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'balance_contable' },
    { ext: 'png', mime: 'image/png', name: 'plano_instalacion' },
    { ext: 'zip', mime: 'application/zip', name: 'expediente_firmas' },
  ];
  const categoryNames = ['Contratacion', 'Finanzas', 'Legal', 'Operaciones', 'Clientes', 'Recursos Humanos'];
  const folderNames = ['Expedientes', 'Facturacion', 'Firmas', 'Proyectos', 'Archivo', 'Seguimiento'];

  for (let u = 0; u < users.length; u += 1) {
    const owner = users[u];

    const category = await prisma.category.create({
      data: {
        userId: owner.id,
        name: `${categoryNames[u % categoryNames.length]} ${u + 1}`,
        description: 'Categoria de pruebas automatizadas',
        color: '#2B6CB0',
        icon: 'folder',
        isPredefined: false,
      },
    });

    const folder = await prisma.folder.create({
      data: {
        userId: owner.id,
        name: `${folderNames[u % folderNames.length]} ${u + 1}`,
        description: 'Carpeta principal de demo',
        color: '#0B7285',
        icon: 'archive',
      },
    });

    for (let d = 0; d < config.docsPerUser; d += 1) {
      const docCreatedAt = new Date(baseDate + (u * 100 + d) * 60 * 60 * 1000);
      const docKind = docKinds[(u + d) % docKinds.length];
      const isArchived = d % 4 === 0;

      // Build a deterministic docId bytes32 so the seed is repeatable
      const docSeedKey = `doc-user${u}-doc${d}-${Date.now()}`;
      const docBytes32 = ethers.id(docSeedKey);
      const ipfsCid = `Qm${ethers.keccak256(ethers.toUtf8Bytes(`cid-${docSeedKey}`)).slice(2, 34)}`;
      const encKeyHash = ethers.keccak256(ethers.toUtf8Bytes(`enckey-${docSeedKey}`)) as `0x${string}`;

      // ── Send real createDocument transaction ────────────────────────────
      let docTxHash = txHash(blockchainCounter);
      let docBlockNumber = 9000 + blockchainCounter;
      let docGasUsed = BigInt(135000 + d * 1000);
      let docStatus: BlockchainStatus = BlockchainStatus.SYNCED;
      let docError: string | null = null;

      if (bc) {
        try {
          const ownerSigner = bc.getSigner(owner.ethWalletIndex);
          const tx = await (bc.contract.connect(ownerSigner) as ethers.Contract).createDocument(
            docBytes32,
            ipfsCid,
            encKeyHash,
          );
          const receipt = await tx.wait(1) as ethers.TransactionReceipt;
          docTxHash = receipt.hash;
          docBlockNumber = receipt.blockNumber;
          docGasUsed = receipt.gasUsed;
          docStatus = BlockchainStatus.SYNCED;
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err);
          console.warn(`    [bc] createDocument u=${u} d=${d} falló: ${reason}`);
          docStatus = BlockchainStatus.FAILED;
          docError = reason;
        }
      }

      const document = await prisma.document.create({
        data: {
          name: `${docKind.name}_${owner.username}_${d + 1}.${docKind.ext}`,
          description: 'Documento generado para pruebas E2E',
          mimeType: docKind.mime,
          size: BigInt(60000 + d * 1500),
          contentHash: randomHash('content', blockchainCounter),
          metadataHash: randomHash('metadata', blockchainCounter),
          fileExtension: docKind.ext,
          ownerId: owner.id,
          folderId: folder.id,
          categoryId: category.id,
          tags: ['demo', 'qa', d % 2 === 0 ? 'legal' : 'finanzas', docKind.ext],
          encryptedSymmetricKey: randomHash('sym', blockchainCounter),
          encryptionIV: Buffer.from(`iv-${blockchainCounter}`).toString('base64'),
          encryptionAuthTag: Buffer.from(`tag-${blockchainCounter}`).toString('base64'),
          blockchainStatus: docStatus,
          blockchainError: docError,
          blockchainId: docBytes32,
          blockchainTxHash: docTxHash,
          creatorWalletId: owner.walletIds[0],
          createdAt: docCreatedAt,
          isArchived,
          archivedAt: isArchived ? new Date(docCreatedAt.getTime() + 2 * 60 * 60 * 1000) : null,
        },
      });

      await prisma.event.create({
        data: {
          eventType: 'DOCUMENT_CREATED',
          userId: owner.id,
          documentId: document.id,
          metadata: {
            blockchainId: docBytes32,
            source: 'automated-generator',
          },
          transactionHash: document.blockchainTxHash,
          blockNumber: docBlockNumber,
          blockTimestamp: new Date(docCreatedAt.getTime() + 2 * 60 * 1000),
            gasUsed: docGasUsed,
          createdAt: new Date(docCreatedAt.getTime() + 2 * 60 * 1000),
        },
      });

      const versionCount = 1 + (d % config.maxVersionsPerDoc);
      let latestVersionId = '';
      // Version 1 was created inside createDocument on-chain; extra versions need createVersion txs
      let latestOnchainVersionNum = 1;

      for (let v = 0; v < versionCount; v += 1) {
        const versionIpfsCid = `Qm${ethers.keccak256(ethers.toUtf8Bytes(`cid-v${v}-${docSeedKey}`)).slice(2, 34)}`;
        const versionEncKeyHash = ethers.keccak256(ethers.toUtf8Bytes(`enckey-v${v}-${docSeedKey}`)) as `0x${string}`;

        let verTxHash = txHash(blockchainCounter + v);
        let verBlockNumber = 9500 + blockchainCounter + v;
        let verGasUsed = BigInt(100000 + v * 500);

        // v=0: version already created on-chain by createDocument; only send tx for v>0
        if (v > 0 && bc && docStatus === BlockchainStatus.SYNCED) {
          try {
            const ownerSigner = bc.getSigner(owner.ethWalletIndex);
            const tx = await (bc.contract.connect(ownerSigner) as ethers.Contract).createVersion(
              docBytes32,
              versionIpfsCid,
              versionEncKeyHash,
            );
            const receipt = await tx.wait(1) as ethers.TransactionReceipt;
            verTxHash = receipt.hash;
            verBlockNumber = receipt.blockNumber;
            verGasUsed = receipt.gasUsed;
            latestOnchainVersionNum = v + 1;
          } catch (err) {
            console.warn(`    [bc] createVersion u=${u} d=${d} v=${v} falló: ${err instanceof Error ? err.message : err}`);
          }
        }

        const version = await prisma.version.create({
          data: {
            documentId: document.id,
            userId: owner.id,
            encryptedSymmetricKey: randomHash('version-sym', blockchainCounter + v),
            encryptionIV: Buffer.from(`version-iv-${blockchainCounter}-${v}`).toString('base64'),
            encryptionAuthTag: Buffer.from(`version-tag-${blockchainCounter}-${v}`).toString('base64'),
            comment: v === 0 ? 'Version inicial' : `Revision ${v + 1}`,
            blockchainStatus: BlockchainStatus.SYNCED,
            blockchainTxHash: verTxHash,
            versionNumber: v + 1,
            isOperational: v === versionCount - 1,
            ipfsCid: versionIpfsCid,
            createdAt: new Date(docCreatedAt.getTime() + (v + 1) * 20 * 60 * 1000),
          },
        });

        latestVersionId = version.id;

        await prisma.event.create({
          data: {
            eventType: 'DOCUMENT_VERSION_CREATED',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              versionNumber: v + 1,
            },
            transactionHash: version.blockchainTxHash,
            blockNumber: verBlockNumber,
            blockTimestamp: new Date(docCreatedAt.getTime() + (v + 1) * 20 * 60 * 1000),
            gasUsed: verGasUsed,
            createdAt: new Date(docCreatedAt.getTime() + (v + 1) * 20 * 60 * 1000),
          },
        });
      }

      const signers = users.filter((candidate) => candidate.id !== owner.id).slice(0, config.signaturesPerDoc);
      for (let s = 0; s < signers.length; s += 1) {
        const signer = signers[s];

        let sigTxHash = txHash(blockchainCounter + s + 99);
        let sigBlockNumber = 9800 + blockchainCounter + s;
        let sigGasUsed = BigInt(80000 + s * 1200);

        if (bc && docStatus === BlockchainStatus.SYNCED) {
          try {
            const ownerSigner = bc.getSigner(owner.ethWalletIndex);
            const signerSigner = bc.getSigner(signer.ethWalletIndex);
            const signerAddress = await signerSigner.getAddress();
            // First share the document with the signer so they can sign
            const shareRole = s % 2 === 0 ? 1 : 2; // 1=VIEWER, 2=EDITOR
            await (bc.contract.connect(ownerSigner) as ethers.Contract)
              .shareDocument(docBytes32, signerAddress, shareRole)
              .then((tx: ethers.ContractTransactionResponse) => tx.wait(1));

            const onchainDoc = await (bc.contract.connect(ownerSigner) as ethers.Contract).getDocument(docBytes32);
            const versionToSign = Number(onchainDoc.latestVersion ?? 0n);
            if (versionToSign <= 0) {
              throw new Error('No valid on-chain version to sign');
            }

            // Build a real ECDSA signature over the document id
            const msgHash = ethers.keccak256(ethers.toUtf8Bytes(`sign-${docBytes32}`));
            const ethSig = await signerSigner.signMessage(ethers.getBytes(msgHash));
            const tx = await (bc.contract.connect(signerSigner) as ethers.Contract).signDocument(
              docBytes32,
              versionToSign,
              ethSig,
              `Firmado documento ${document.name}`,
              '',
            );
            const receipt = await tx.wait(1) as ethers.TransactionReceipt;
            sigTxHash = receipt.hash;
            sigBlockNumber = receipt.blockNumber;
            sigGasUsed = receipt.gasUsed;
          } catch (err) {
            console.warn(`    [bc] signDocument u=${u} d=${d} s=${s} falló: ${err instanceof Error ? err.message : err}`);
          }
        }

        const signature = await prisma.documentSignature.create({
          data: {
            documentId: document.id,
            versionId: latestVersionId,
            userId: signer.id,
            signerWalletId: signer.walletIds[0],
            blockchainStatus: BlockchainStatus.SYNCED,
            blockchainTxHash: sigTxHash,
            signedAt: new Date(docCreatedAt.getTime() + (s + 1) * 50 * 60 * 1000),
          },
        });

        await prisma.event.create({
          data: {
            eventType: 'DOCUMENT_SIGNED',
            userId: signer.id,
            documentId: document.id,
            metadata: {
              signatureId: signature.id,
              signerWallet: signer.walletAddresses[0],
            },
            transactionHash: signature.blockchainTxHash,
              blockNumber: sigBlockNumber,
              blockTimestamp: new Date(docCreatedAt.getTime() + (s + 1) * 50 * 60 * 1000),
              gasUsed: sigGasUsed,
            createdAt: new Date(docCreatedAt.getTime() + (s + 1) * 50 * 60 * 1000),
          },
        });

        await prisma.event.create({
          data: {
            eventType: 'SHARE_CONFIRMED',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              sharedWithUserId: signer.id,
              role: s % 2 === 0 ? 'VIEWER' : 'EDITOR',
            },
            transactionHash: txHash(blockchainCounter + s + 199),
            blockNumber: 9900 + blockchainCounter + s,
            createdAt: new Date(docCreatedAt.getTime() + (s + 1) * 55 * 60 * 1000),
          },
        });

        await prisma.notification.create({
          data: {
            userId: signer.id,
            type: 'DOCUMENT_SHARED',
            title: 'Nuevo documento compartido',
            message: `${owner.username} compartio ${document.name} contigo`,
            link: `/app/documents/${document.id}`,
            data: {
              documentId: document.id,
              owner: owner.username,
            },
            isRead: s % 2 === 0,
            readAt: s % 2 === 0 ? new Date(docCreatedAt.getTime() + 65 * 60 * 1000) : null,
          },
        });
      }

      if (d % 3 === 0) {
        const recipient = users[(u + 1) % users.length];
        await prisma.event.create({
          data: {
            eventType: 'DOCUMENT_TRANSFERRED',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              fromUserId: owner.id,
              toUserId: recipient.id,
            },
            transactionHash: txHash(blockchainCounter + 300),
            blockNumber: 10000 + blockchainCounter,
            createdAt: new Date(docCreatedAt.getTime() + 90 * 60 * 1000),
          },
        });
      }

      if (d % 2 === 0) {
        await prisma.event.create({
          data: {
            eventType: 'DOCUMENT_RESTORED',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              reason: 'Validacion de historial de restauracion',
            },
            transactionHash: txHash(blockchainCounter + 400),
            blockNumber: 10100 + blockchainCounter,
            createdAt: new Date(docCreatedAt.getTime() + 100 * 60 * 1000),
          },
        });
      }

      if (document.isArchived) {
        await prisma.event.create({
          data: {
            eventType: 'DOCUMENT_ARCHIVED',
            userId: owner.id,
            documentId: document.id,
            metadata: {
              reason: 'Archivado automatico de dataset QA',
            },
            transactionHash: txHash(blockchainCounter + 500),
            blockNumber: 10200 + blockchainCounter,
            createdAt: new Date(docCreatedAt.getTime() + 110 * 60 * 1000),
          },
        });
      }

      blockchainCounter += 1;
    }
  }
}

async function recomputeStats(users: GeneratedUser[]): Promise<void> {
  console.log('[4/6] Recalculando estadisticas de usuario y documento...');

  const allDocuments = await prisma.document.findMany({
    include: {
      versions: true,
      signatures: true,
    },
  });

  for (const doc of allDocuments) {
    const totalDownloads = Math.floor(Math.random() * 15);
    const totalViews = totalDownloads + Math.floor(Math.random() * 20);

    await prisma.documentStats.upsert({
      where: { documentId: doc.id },
      create: {
        documentId: doc.id,
        totalVersions: doc.versions.length,
        totalSignatures: doc.signatures.length,
        totalDownloads,
        totalShares: await prisma.event.count({
          where: {
            documentId: doc.id,
            eventType: 'SHARE_CONFIRMED',
          },
        }),
        totalViews,
        totalRestores: await prisma.event.count({
          where: {
            documentId: doc.id,
            eventType: 'DOCUMENT_RESTORED',
          },
        }),
      },
      update: {
        totalVersions: doc.versions.length,
        totalSignatures: doc.signatures.length,
        totalDownloads,
        totalShares: await prisma.event.count({
          where: {
            documentId: doc.id,
            eventType: 'SHARE_CONFIRMED',
          },
        }),
        totalViews,
        totalRestores: await prisma.event.count({
          where: {
            documentId: doc.id,
            eventType: 'DOCUMENT_RESTORED',
          },
        }),
      },
    });
  }

  for (const user of users) {
    const ownedDocs = await prisma.document.findMany({
      where: { ownerId: user.id },
      select: { size: true },
    });

    const totalSize = ownedDocs.reduce<bigint>((acc, item) => acc + item.size, BigInt(0));

    await prisma.userStats.update({
      where: { userId: user.id },
      data: {
        totalDocuments: ownedDocs.length,
        totalSize,
        totalShared: await prisma.event.count({
          where: { userId: user.id, eventType: 'SHARE_CONFIRMED' },
        }),
        totalDownloads: await prisma.notification.count({
          where: { userId: user.id, type: 'DOCUMENT_SHARED' },
        }),
        totalSignatures: await prisma.documentSignature.count({
          where: { userId: user.id },
        }),
        totalTransfers: await prisma.event.count({
          where: { userId: user.id, eventType: 'DOCUMENT_TRANSFERRED' },
        }),
        totalRestores: await prisma.event.count({
          where: { userId: user.id, eventType: 'DOCUMENT_RESTORED' },
        }),
        totalUnpins: 0,
        lastActivityAt: new Date(),
      },
    });
  }

  await prisma.systemStats.create({
    data: {
      statType: 'DAILY',
      periodStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      newUsers: users.length,
      activeUsers: users.length,
      totalUsers: await prisma.user.count(),
      newDocuments: await prisma.document.count(),
      totalDocuments: await prisma.document.count(),
      totalStorage: (await prisma.document.aggregate({
        _sum: { size: true },
      }))._sum.size || BigInt(0),
      newStorage: BigInt(0),
      totalEvents: await prisma.event.count(),
      totalShares: await prisma.event.count({ where: { eventType: 'SHARE_CONFIRMED' } }),
      totalSignatures: await prisma.documentSignature.count(),
      totalTransfers: await prisma.event.count({ where: { eventType: 'DOCUMENT_TRANSFERRED' } }),
      totalRestores: await prisma.event.count({ where: { eventType: 'DOCUMENT_RESTORED' } }),
      totalUnpins: 0,
      lastSyncedBlock: 11000,
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'verification.mode' },
    create: { key: 'verification.mode', value: 'strict' },
    update: { value: 'strict' },
  });

  await prisma.systemConfig.upsert({
    where: { key: '2fa.requiredForAdmin' },
    create: { key: '2fa.requiredForAdmin', value: 'true' },
    update: { value: 'true' },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'notifications.digest' },
    create: { key: 'notifications.digest', value: 'daily' },
    update: { value: 'daily' },
  });
}

async function printSummary(profile: ProfileName, generatedUsers: GeneratedUser[]): Promise<void> {
  console.log('[6/6] Resumen de datos generados');

  const totals = {
    users: await prisma.user.count(),
    wallets: await prisma.wallet.count(),
    documents: await prisma.document.count(),
    versions: await prisma.version.count(),
    signatures: await prisma.documentSignature.count(),
    events: await prisma.event.count(),
    notifications: await prisma.notification.count(),
    suspendedUsers: await prisma.user.count({ where: { isSuspended: true } }),
    failedDocuments: await prisma.document.count({ where: { blockchainStatus: BlockchainStatus.FAILED } }),
  };

  const demo = generatedUsers[0];

  console.log('\n============================================');
  console.log(`Perfil ejecutado: ${profile}`);
  console.log('============================================');
  console.log(`Usuarios totales: ${totals.users}`);
  console.log(`Wallets totales: ${totals.wallets}`);
  console.log(`Documentos: ${totals.documents}`);
  console.log(`Versiones: ${totals.versions}`);
  console.log(`Firmas: ${totals.signatures}`);
  console.log(`Eventos de auditoria: ${totals.events}`);
  console.log(`Notificaciones: ${totals.notifications}`);
  console.log(`Usuarios suspendidos: ${totals.suspendedUsers}`);
  console.log(`Documentos en FAILED: ${totals.failedDocuments}`);
  console.log('--------------------------------------------');
  console.log('Credenciales demo para validacion manual:');
  console.log(`Usuario: ${demo.username}`);
  console.log(`Email:   ${demo.email}`);
  console.log(`Clave:   ${demo.password}`);
  console.log(`Wallet principal: ${demo.walletAddresses[0]}`);
  console.log('============================================\n');

  console.log('Credenciales admin por seed: admin / Admin123!');
}

async function main(): Promise<void> {
  const options = parseArgs();
  const profileConfig = PROFILES[options.profile];

  console.log('Generador de datos DocumentChain');
  console.log(`Perfil: ${options.profile}`);
  console.log(`Reset DB: ${options.reset ? 'si' : 'no'}`);
  console.log(`Incluye seed: ${options.includeSeed ? 'si' : 'no'}`);

  if (options.reset) {
    runReset(options.includeSeed);
  }

  console.log('[2/6] Creando usuarios demo, wallets y preferencias...');

  const generatedUsers: GeneratedUser[] = [];
  const bc = await setupBlockchain();
  for (let i = 0; i < profileConfig.users; i += 1) {
    const generated = await createUser(i, profileConfig.walletsPerUser, bc);
    generatedUsers.push(generated);
  }

  await createDocumentsAndEvents(generatedUsers, profileConfig, bc);
  await recomputeStats(generatedUsers);

  console.log('[5/6] Generando sesiones de login de prueba...');
  for (const [index, user] of generatedUsers.entries()) {
    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken: `access-${user.id}-${Date.now()}`,
        refreshToken: `refresh-${user.id}-${Date.now()}-${index}`,
        accessTokenExpiresAt: index % 5 === 0 ? new Date(Date.now() - 10 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000),
        refreshTokenExpiresAt: index % 7 === 0 ? new Date(Date.now() - 24 * 60 * 60 * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await printSummary(options.profile, generatedUsers);
}

main()
  .catch((error) => {
    console.error('Error al generar datos de prueba:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
