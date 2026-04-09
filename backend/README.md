# DocumentChain - Backend API

## Complete Implementation Status ✅

### Core Features Implemented

- ✅ **Authentication System**
  - User registration with ECDH P-256 key generation
  - Login/logout with JWT tokens
  - Password change (re-encrypts keys)
  - Session management

- ✅ **User Management**
  - Profile CRUD
  - User search
  - Admin user management

- ✅ **Wallet Management**
  - Multiple wallets per user (max 5)
  - Wallet signature verification
  - Primary wallet selection
  - Wallet labeling

- ✅ **Document Management**
  - Upload with encryption (AES-256-GCM)
  - Download with decryption
  - Archive/unarchive
  - Delete (soft delete + IPFS unpin)
  - Transfer ownership

- ✅ **Version Control**
  - Create new versions
  - Set operational version
  - Restore previous versions
  - Download specific versions

- ✅ **Digital Signatures**
  - Sign document versions with comments
  - List signatures
  - Blockchain-backed signatures

- ✅ **Sharing & Permissions**
  - Share documents with role-based access
  - Re-encrypt keys for recipients
  - Current delivered flow for changing an existing role: revoke access and share again
  - Revoke access

- ✅ **Statistics**
  - User statistics
  - Document statistics
  - System statistics (admin)
  - Top documents metrics

- ✅ **Error Handling**
  - Global error handler
  - Validation middleware
  - Proper HTTP status codes

---

## Technology Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Blockchain**: Ethereum + Hardhat + ethers.js
- **Storage**: IPFS Cluster (3+ nodes)
- **Encryption**: Node.js crypto (ECDH P-256 + AES-256-GCM)
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **HTTPS**: Self-signed certificates (dev) / Let's Encrypt (production)

### Smart Contracts
- **Language**: Solidity
- **Contracts**:
  - DocumentRegistry - CRUD operations
  - DocumentVersioning - Version management
  - DocumentSigning - Digital signatures
  - DocumentAccessControl - Role-based permissions (OpenZeppelin)

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client
│   │   ├── blockchain.ts        # Ethers.js contracts
│   │   ├── ipfs.ts              # IPFS client & cluster
│   │   └── jwt.ts               # JWT utilities
│   │
│   ├── lib/
│   │   └── crypto/
│   │       ├── KeyManager.ts    # ECDH key management
│   │       └── FileCrypto.ts    # File encryption/decryption
│   │
│   ├── services/
│   │   ├── authService.ts       # Authentication logic
│   │   ├── userService.ts       # User management
│   │   ├── walletService.ts     # Wallet management
│   │   ├── documentService.ts   # Document operations
│   │   ├── versionService.ts    # Version control
│   │   ├── signatureService.ts  # Digital signatures
│   │   ├── shareService.ts      # Sharing/permissions
│   │   └── statsService.ts      # Statistics
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── walletController.ts
│   │   ├── documentController.ts
│   │   ├── versionController.ts
│   │   ├── signatureController.ts
│   │   ├── shareController.ts
│   │   └── statsController.ts
│   │
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── wallets.ts
│   │   ├── documents.ts
│   │   ├── versions.ts
│   │   ├── signatures.ts
│   │   ├── shares.ts
│   │   └── stats.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── upload.ts            # Multer file upload
│   │   ├── errorHandler.ts      # Global error handler
│   │   └── validator.ts         # Input validation
│   │
│   └── index.ts                 # Main server
│
├── prisma/
│   └── schema.prisma            # Database schema
│
├── ssl/
│   ├── private-key.pem
│   └── certificate.pem
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- IPFS Cluster (optional for development)
- Ethereum node (Hardhat network for development)

### 1. Clone Repository

```bash
git clone <repository-url>
cd documentchain/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/documentchain"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# SSL Certificates
SSL_KEY_PATH="./ssl/private-key.pem"
SSL_CERT_PATH="./ssl/certificate.pem"

# IPFS
IPFS_API_URL="http://localhost:5001"
IPFS_CLUSTER_API_URL="http://localhost:9095"

# Blockchain (fill after deploying contracts)
BLOCKCHAIN_RPC_URL="http://localhost:8545"
BLOCKCHAIN_PRIVATE_KEY="your-backend-wallet-private-key"
CONTRACT_DOCUMENT_REGISTRY=""
CONTRACT_DOCUMENT_VERSIONING=""
CONTRACT_DOCUMENT_SIGNING=""
CONTRACT_DOCUMENT_ACCESS_CONTROL=""
```

### 4. Generate SSL Certificates

```bash
cd ..
bash scripts/generate-ssl-certs.sh
```

### 5. Setup Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Deploy Smart Contracts

In a separate terminal:

```bash
cd ../smart-contracts

# Start local blockchain
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the contract addresses from deployment output to your `.env` file.

### 7. Start IPFS Cluster (Optional)

```bash
cd ../ipfs-cluster
docker-compose up -d
```

### 8. Start Backend Server

```bash
cd ../backend
npm run dev
```

Server will start on `https://localhost:3000`

---

## Usage

### Testing with cURL

**Register User:**
```bash
curl -X POST https://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123",
    "fullName": "Alice Smith"
  }' \
  --insecure
```

**Login:**
```bash
curl -X POST https://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "password123"
  }' \
  --insecure
```

**Upload Document:**
```bash
curl -X POST https://localhost:3000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "name=Important Document" \
  -F "password=password123" \
  --insecure
```

**Download Document:**
```bash
curl https://localhost:3000/api/documents/DOCUMENT_ID/download?password=password123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --insecure \
  -o downloaded-file.pdf
```

See [API Documentation](../docs/API.md) for complete endpoint list.

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search` - Search users
- `GET /api/users` (admin) - List all users

### Wallets
- `GET /api/wallets` - List wallets
- `POST /api/wallets` - Add wallet
- `PUT /api/wallets/:id/primary` - Set primary
- `DELETE /api/wallets/:id` - Remove wallet

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document
- `GET /api/documents/:id/download` - Download
- `PUT /api/documents/:id/archive` - Archive
- `DELETE /api/documents/:id` - Delete
- `POST /api/documents/:id/transfer` - Transfer

### Versions
- `GET /api/documents/:id/versions` - List versions
- `POST /api/documents/:id/versions` - Create version
- `PUT /api/documents/:id/versions/:vId/operational` - Set operational
- `POST /api/documents/:id/versions/:vId/restore` - Restore

### Signatures
- `POST /api/signatures` - Sign document
- `GET /api/versions/:id/signatures` - List signatures

### Sharing
- `POST /api/documents/:id/share` - Share document
- `GET /api/documents/:id/shares` - List shares
- `PUT /api/documents/:id/share/:userId` - Update role
- `DELETE /api/documents/:id/share/:userId` - Revoke access

### Statistics
- `GET /api/stats/me` - User stats
- `GET /api/stats/system` (admin) - System stats
- `GET /api/documents/:id/stats` - Document stats

---

## Security Features

### Encryption Architecture

**Three-Layer Security:**

1. **Authentication Layer**: Username/password + JWT
2. **Encryption Layer**: ECDH P-256 + AES-256-GCM (NOT wallet-based)
3. **Blockchain Layer**: Wallet signatures for transactions

**Key Points:**

- Encryption keys NOT derived from wallet
- Allows password change without losing file access
- Wallet only used for blockchain transaction signing
- Private keys encrypted with user password (PBKDF2 + AES-256-GCM)

### Encryption Flow

1. **User Registration**:
   - Generate ECDH P-256 key pair
   - Encrypt private key with password
   - Store encrypted private key in database

2. **File Upload**:
   - Generate random AES-256 symmetric key
   - Encrypt file with symmetric key
   - Upload encrypted file to IPFS
   - Encrypt symmetric key with user's public key
   - Store encrypted key in blockchain

3. **File Sharing**:
   - Decrypt symmetric key with owner's private key
   - Re-encrypt with recipient's public key
   - Store new encrypted key for recipient

4. **File Download**:
   - Decrypt user's private key with password
   - Decrypt symmetric key with private key
   - Download encrypted file from IPFS
   - Decrypt file with symmetric key

---

## Database Schema

See `prisma/schema.prisma` for complete schema.

**Main Models:**
- User - Users with encrypted keys
- Session - Active sessions
- Wallet - User wallets (max 5 per user)
- Document - Documents with IPFS CIDs
- Version - Document versions
- DocumentSignature - Signatures with comments
- DocumentShare - Sharing permissions
- Event - Blockchain event log
- UserStats, DocumentStats, SystemStats - Statistics

---

## Blockchain Integration

### Smart Contracts

**DocumentRegistry**:
- Create, archive, delete documents
- Transfer ownership
- Soft delete support

**DocumentVersioning**:
- Create versions
- Set operational version
- Restore previous versions

**DocumentSigning**:
- Sign versions with comments
- Prevent duplicate signatures

**DocumentAccessControl**:
- Role-based access control
- Grant/revoke permissions
- Change ownership

### Roles

- `OWNER` - Full control
- `SHARED_ADMIN` - Can share, create versions
- `SHARED_WRITE` - Can create versions
- `SHARED_READ` - Can view only

---

## Development

### Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npx prisma migrate dev
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Database studio
npx prisma studio
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Test coverage
npm run test:coverage
```

---

## Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to secure random value
- [ ] Use Let's Encrypt for HTTPS certificates
- [ ] Set up proper PostgreSQL with backups
- [ ] Configure IPFS Cluster with multiple nodes
- [ ] Deploy smart contracts to mainnet/testnet
- [ ] Set up monitoring and logging
- [ ] Configure CORS for frontend domain
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Set up CDN for static assets
- [ ] Configure firewall rules
- [ ] Set up automated backups

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:password@db-server:5432/documentchain"
JWT_SECRET="generate-with-openssl-rand-base64-32"
BLOCKCHAIN_RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
IPFS_CLUSTER_API_URL="https://ipfs-cluster.your-domain.com:9095"
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U user -h localhost -d documentchain
```

### IPFS Issues

```bash
# Check IPFS cluster status
cd ipfs-cluster
docker-compose ps

# View logs
docker-compose logs -f
```

### Blockchain Issues

```bash
# Restart Hardhat node
cd smart-contracts
npx hardhat node

# Re-deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### SSL Certificate Issues

```bash
# Regenerate certificates
bash scripts/generate-ssl-certs.sh

# Check certificate
openssl x509 -in ssl/certificate.pem -text -noout
```

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

[Your License Here]

---

## Contact

[Your Contact Information]

---

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Prisma for excellent ORM
- Hardhat for Ethereum development
- IPFS for decentralized storage
