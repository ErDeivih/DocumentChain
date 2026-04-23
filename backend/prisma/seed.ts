import { PrismaClient } from '@prisma/client';
import { Argon2Service } from '../src/services/argon2Service';
import { KeyManager } from '../src/lib/crypto/KeyManager';
import logger from '../src/utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seed...');

  // Verificar si ya existe algún admin
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    logger.info('✓ Admin user already exists, skipping seed');
    logger.info(`  Admin username: ${existingAdmin.username}`);
    return;
  }

  logger.info('👤 Creating default admin user...');

  // Credenciales por defecto del primer admin
  const defaultAdmin = {
    username: 'admin',
    email: 'admin@documentchain.local',
    password: 'Admin123!', // Se DEBE cambiar al primer login
    fullName: 'System Administrator'
  };

  // Generar claves de cifrado
  const { publicKey, privateKey } = KeyManager.generateKeyPair();
  const recoveryKey = KeyManager.generateRecoveryKey();
  const recoveryKeyHash = KeyManager.hashRecoveryKey(recoveryKey);
  const encryptedPrivateKey = KeyManager.encryptPrivateKey(privateKey, defaultAdmin.password);
  const encryptedPrivateKeyRecovery = KeyManager.encryptPrivateKeyWithRecovery(privateKey, recoveryKey);

  // Hash de contraseña
  const passwordHash = await Argon2Service.hash(defaultAdmin.password);

  // Crear usuario admin
  const admin = await prisma.user.create({
    data: {
      username: defaultAdmin.username,
      email: defaultAdmin.email,
      passwordHash,
      fullName: defaultAdmin.fullName,
      role: 'ADMIN',
      publicKey,
      encryptedPrivateKey,
      recoveryKeyHash,
      encryptedPrivateKeyRecovery,
      emailVerified: true,
    }
  });

  logger.info('✅ Default admin user created successfully!');
  logger.info('');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('🔐 DEFAULT ADMIN CREDENTIALS (CHANGE IMMEDIATELY!)');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('');
  logger.info('  Username: admin');
  logger.info('  Password: Admin123!');
  logger.info('  Email:    admin@documentchain.local');
  logger.info('');
  logger.info('  Recovery Key (SAVE THIS SECURELY):');
  logger.info(`  ${recoveryKey}`);
  logger.info('');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('⚠️  IMPORTANT: Change the password immediately after first login!');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('');

  // Crear estadísticas vacías para el admin
  await prisma.userStats.create({
    data: {
      userId: admin.id,
      totalDocuments: 0,
      totalSize: BigInt(0),
      totalShared: 0,
      totalDownloads: 0,
      totalSignatures: 0,
      totalTransfers: 0,
      totalRestores: 0,
      totalUnpins: 0
    }
  });

  await prisma.emailVerification.create({
    data: {
      userId: admin.id,
      token: `seed-admin-email-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      verified: true,
      verifiedAt: new Date(),
    }
  });

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
