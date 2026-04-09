/**
 * Script para verificar el balance de la wallet del backend
 * Uso: npx ts-node scripts/check-wallet.ts
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MIN_BALANCE_MATIC = 1; // Umbral de alerta
const MIN_BALANCE_RECOMMENDED = 10; // Balance recomendado

async function checkWallet() {
  console.log('🔍 Verificando wallet del backend...\n');

  // Validar variables de entorno
  if (!process.env.BLOCKCHAIN_PRIVATE_KEY) {
    console.error('❌ ERROR: BLOCKCHAIN_PRIVATE_KEY no configurada en .env');
    process.exit(1);
  }

  if (!process.env.BLOCKCHAIN_RPC_URL) {
    console.error('❌ ERROR: BLOCKCHAIN_RPC_URL no configurada en .env');
    process.exit(1);
  }

  try {
    // Conectar al provider
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);

    // Obtener información de la red
    const network = await provider.getNetwork();
    console.log(`📡 Red: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`🔗 RPC: ${process.env.BLOCKCHAIN_RPC_URL}\n`);

    // Obtener balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInEther = parseFloat(ethers.formatEther(balance));

    // Mostrar información
    console.log('👛 INFORMACIÓN DE LA WALLET');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Dirección:        ${wallet.address}`);
    console.log(`Balance:          ${balanceInEther.toFixed(4)} ${getNetworkCurrency(network.chainId)}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Análisis del balance
    if (balanceInEther === 0) {
      console.log('🚨 CRÍTICO: La wallet NO tiene fondos');
      console.log('   → NO se pueden ejecutar transacciones');
      console.log('   → Fondea la cuenta inmediatamente\n');
      
      if (network.chainId === 80001n) {
        console.log('💡 Para testnet Mumbai, usa el faucet:');
        console.log('   https://faucet.polygon.technology/\n');
      } else if (network.chainId === 137n) {
        console.log('💡 Para Polygon Mainnet, compra MATIC en un exchange\n');
      }
    } else if (balanceInEther < MIN_BALANCE_MATIC) {
      console.log(`⚠️  ADVERTENCIA: Balance bajo (< ${MIN_BALANCE_MATIC} ${getNetworkCurrency(network.chainId)})`);
      console.log('   → Recarga la cuenta pronto\n');
    } else if (balanceInEther < MIN_BALANCE_RECOMMENDED) {
      console.log(`⚡ Balance aceptable, pero recomendado: ${MIN_BALANCE_RECOMMENDED} ${getNetworkCurrency(network.chainId)}\n`);
    } else {
      console.log('✅ Balance suficiente\n');
    }

    // Estimación de transacciones
    const avgGasPrice = (await provider.getFeeData()).gasPrice || 0n;
    const avgTxCost = 150000n * avgGasPrice; // ~150k gas promedio
    const estimatedTxs = balance / avgTxCost;

    console.log('📊 ESTIMACIONES');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Gas Price:        ${ethers.formatUnits(avgGasPrice, 'gwei')} Gwei`);
    console.log(`Costo por Tx:     ~${ethers.formatEther(avgTxCost)} ${getNetworkCurrency(network.chainId)}`);
    console.log(`Txs estimadas:    ~${estimatedTxs.toString().split('.')[0]} transacciones`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Verificar contratos
    console.log('📝 CONTRATOS CONFIGURADOS');
    console.log('═══════════════════════════════════════════════════════');
    const contracts = {
      'DocumentRegistry': process.env.CONTRACT_DOCUMENT_REGISTRY,
      'DocumentVersioning': process.env.CONTRACT_DOCUMENT_VERSIONING,
      'DocumentSigning': process.env.CONTRACT_DOCUMENT_SIGNING,
      'DocumentAccessControl': process.env.CONTRACT_DOCUMENT_ACCESS_CONTROL,
    };

    for (const [name, address] of Object.entries(contracts)) {
      if (address) {
        const code = await provider.getCode(address);
        const isDeployed = code !== '0x';
        console.log(`${isDeployed ? '✅' : '❌'} ${name.padEnd(25)} ${address}`);
      } else {
        console.log(`❌ ${name.padEnd(25)} NO CONFIGURADO`);
      }
    }
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('❌ ERROR al verificar wallet:');
    console.error(error.message);
    process.exit(1);
  }
}

function getNetworkCurrency(chainId: bigint): string {
  const currencies: { [key: string]: string } = {
    '1': 'ETH',
    '137': 'MATIC',
    '80001': 'MATIC',
    '31337': 'ETH', // Hardhat local
  };
  return currencies[chainId.toString()] || 'ETH';
}

// Ejecutar
checkWallet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
