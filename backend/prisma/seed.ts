import { PrismaClient } from '@prisma/client';
import { Argon2Service } from '../src/services/argon2Service';
import { KeyManager } from '../src/lib/crypto/KeyManager';
import { PinataIPFSClient } from '../src/config/pinataClient';
import logger from '../src/utils/logger';

const prisma = new PrismaClient();

async function cleanupPinataIfNeeded() {
  const provider = (process.env.IPFS_PROVIDER || 'pinata').trim().toLowerCase();
  const jwt = process.env.PINATA_JWT;

  if (provider === 'pinata' && jwt) {
    logger.info('🧹 Cleaning up Pinata pins before seed...');
    try {
      const client = new PinataIPFSClient({
        jwt,
        apiKey: process.env.PINATA_API_KEY || undefined,
        apiSecret: process.env.PINATA_API_SECRET || undefined,
        gatewayUrl: process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud'
      });
      await client.unpinAll();
      logger.info('✅ Pinata cleanup complete');
    } catch (error) {
      logger.error('⚠️ Pinata cleanup failed (continuing anyway):', error);
    }
  }
}

async function resetDatabase() {
  logger.info('🗑️  Resetting database...');

  // Delete in child-to-parent order to respect foreign keys
  await prisma.documentShareKey.deleteMany({});
  await prisma.documentSignature.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.version.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.emailVerification.deleteMany({});
  await prisma.passwordReset.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.folder.deleteMany({});
  await prisma.systemConfig.deleteMany({});
  await prisma.systemStats.deleteMany({});
  await prisma.user.deleteMany({});

  logger.info('✅ Database reset complete');
}

async function createUser(data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
}) {
  const { publicKey, privateKey } = KeyManager.generateKeyPair();
  const recoveryKey = KeyManager.generateRecoveryKey();
  const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
  const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, data.password);
  const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);
  const passwordHash = await Argon2Service.hash(data.password);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role,
      publicKey,
      encryptedPrivateKey,
      recoveryKeyHash,
      encryptedPrivateKeyRecovery,
      emailVerified: true,
    }
  });

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token: `seed-${data.username}-email-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      verified: true,
      verifiedAt: new Date(),
    }
  });

  logger.info(`✅ User '${data.username}' created`);
  logger.info(`   Recovery Key: ${recoveryKey}`);

  return { user, recoveryKey };
}

async function createWallet(userId: string, address: string, nickname: string, isPrimary = false) {
  const wallet = await prisma.wallet.create({
    data: {
      userId,
      walletAddress: address,
      nickname,
      isPrimary,
      isConnected: true,
    }
  });
  logger.info(`   Wallet ${nickname} (${address.slice(0, 10)}...) created for user`);
  return wallet;
}

async function createSampleDocument(
  ownerId: string,
  userId: string,
  name: string,
  visibility: 'PUBLIC' | 'PRIVATE',
  blockchainId: string,
  ipfsCid: string,
  fileExtension: string,
  mimeType: string,
  size: number
) {
  const document = await prisma.document.create({
    data: {
      name,
      ownerId,
      visibility,
      blockchainId,
      blockchainStatus: 'SYNCED',
      encryptedSymmetricKey: 'seed-encrypted-key-placeholder',
      size: BigInt(size),
      mimeType,
      fileExtension,
      contentHash: 'seed-content-hash-' + Date.now(),
      metadataHash: 'seed-metadata-hash-' + Date.now(),
      publicId: visibility === 'PUBLIC' ? `pub-${Date.now()}-${Math.random().toString(36).substring(2, 10)}` : null,
    }
  });

  await prisma.version.create({
    data: {
      documentId: document.id,
      userId,
      versionNumber: 1,
      ipfsCid,
      encryptedSymmetricKey: 'seed-encrypted-key-placeholder',
      comment: 'Versión inicial (seed)',
      blockchainTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      blockchainStatus: 'SYNCED',
    }
  });

  logger.info(`   Document '${name}' (${visibility}) created`);
  return document;
}

async function main() {
  logger.info('🌱 Starting database seed...');

  await cleanupPinataIfNeeded();
  await resetDatabase();

  // Create admin user
  const { user: admin } = await createUser({
    username: 'admin',
    email: 'admin@documentchain.local',
    password: 'Admin123!',
    fullName: 'System Administrator',
    role: 'ADMIN',
  });

  // Create demo user
  const { user: demoUser } = await createUser({
    username: 'user',
    email: 'user@documentchain.local',
    password: 'User123!',
    fullName: 'Demo User',
    role: 'USER',
  });

  // Create wallets for both users (needed for blockchain operations)
  await createWallet(admin.id, '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'Personal', true);
  await createWallet(demoUser.id, '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 'Personal', true);

  // Create sample documents for admin
  await createSampleDocument(
    admin.id, admin.id,
    'Contrato de Servicios.pdf',
    'PRIVATE',
    '0x' + 'a'.repeat(64),
    'QmSeedCidAdmin1DocumentChainTestDocumentPrivate',
    'pdf',
    'application/pdf',
    124000
  );

  await createSampleDocument(
    admin.id, admin.id,
    'Informe Anual Público.pdf',
    'PUBLIC',
    '0x' + 'b'.repeat(64),
    'QmSeedCidAdmin2DocumentChainTestDocumentPublic',
    'pdf',
    'application/pdf',
    256000
  );

  await createSampleDocument(
    admin.id, admin.id,
    'Acta Reunión.docx',
    'PRIVATE',
    '0x' + 'c'.repeat(64),
    'QmSeedCidAdmin3DocumentChainTestDocumentActa',
    'docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    45000
  );

  // Create sample documents for demo user
  await createSampleDocument(
    demoUser.id, demoUser.id,
    'Presupuesto Proyecto.xlsx',
    'PRIVATE',
    '0x' + 'd'.repeat(64),
    'QmSeedCidUser1DocumentChainTestDocumentBudget',
    'xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    32000
  );

  await createSampleDocument(
    demoUser.id, demoUser.id,
    'Foto Proyecto.png',
    'PRIVATE',
    '0x' + 'e'.repeat(64),
    'QmSeedCidUser2DocumentChainTestDocumentPhoto',
    'png',
    'image/png',
    1800000
  );

  logger.info('');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('🔐 SEED CREDENTIALS');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('');
  logger.info('  Admin Account');
  logger.info('    Username: admin');
  logger.info('    Password: Admin123!');
  logger.info('    Email:    admin@documentchain.local');
  logger.info('    Wallet:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  logger.info('    Docs:     3 (2 privados, 1 público)');
  logger.info('');
  logger.info('  User Account');
  logger.info('    Username: user');
  logger.info('    Password: User123!');
  logger.info('    Email:    user@documentchain.local');
  logger.info('    Wallet:   0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  logger.info('    Docs:     2 (privados)');
  logger.info('');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('⚠️  IMPORTANT: Change passwords immediately after first login!');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('');

  logger.info('✓ Seed completed successfully');
}

main()
  .catch((e) => {
    logger.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
