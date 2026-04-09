const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Iniciando despliegue del contrato DocumentRegistry consolidado...\n");

  // Obtener cuenta de despliegue
  const [deployer] = await hre.ethers.getSigners();
  console.log("Desplegando contrato con la cuenta:", deployer.address);
  console.log("Balance de la cuenta:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

  // Desplegar DocumentRegistry consolidado
  console.log("Desplegando DocumentRegistry...");
  const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
  const registry = await DocumentRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ DocumentRegistry desplegado en:", registryAddress, "\n");

  // Verificar roles otorgados
  const ADMIN_ROLE = await registry.ADMIN_ROLE();
  const hasAdminRole = await registry.hasRole(ADMIN_ROLE, deployer.address);
  console.log("Rol ADMIN_ROLE:", ADMIN_ROLE);
  console.log("Deployer tiene ADMIN_ROLE:", hasAdminRole, "\n");

  // Guardar información del despliegue
  const deployment = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DocumentRegistry: registryAddress
    },
    roles: {
      ADMIN_ROLE: ADMIN_ROLE,
      deployer: deployer.address
    }
  };

  // Guardar en archivo JSON
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));
  console.log("Información de despliegue guardada en:", deploymentFile, "\n");

  // Generar contenido .env para el backend
  const envContent = `# Contrato Consolidado DocumentRegistry (${hre.network.name})
CONTRACT_DOCUMENT_REGISTRY=${registryAddress}

# Roles
ADMIN_ROLE=${ADMIN_ROLE}

# Deployer con permisos de administrador
DEPLOYER_ADDRESS=${deployer.address}
`;

  const envFile = path.join(deploymentsDir, `${hre.network.name}.env`);
  fs.writeFileSync(envFile, envContent);
  console.log("Variables de entorno guardadas en:", envFile);
  console.log("\nCopie estas variables a su archivo .env del backend:");
  console.log(envContent);

  console.log("\n✅ ¡Despliegue completado exitosamente!");
  console.log("\n📋 Resumen:");
  console.log("  - Contrato: DocumentRegistry (consolidado)");
  console.log("  - Dirección:", registryAddress);
  console.log("  - Administrador inicial:", deployer.address);
  console.log("  - Funcionalidades: Registro, Versionado, Firmas, Control de Acceso");
  console.log("  - Pausable: Sí (Circuit Breaker Pattern)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
