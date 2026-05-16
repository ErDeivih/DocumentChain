# DocumentChain - API Documentation

## Base URL
```
Development: https://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

**Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Authentication

#### POST /auth/register
Register a new user with automatic ECDH key generation.

**Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123",
  "fullName": "Alice Smith"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "alice",
    "email": "alice@example.com",
    "fullName": "Alice Smith",
    "role": "USER",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n..."
  }
}
```

#### POST /auth/login
Login with username and password.

**Body:**
```json
{
  "username": "alice",
  "password": "password123"
}
```

**Response:** Same as register

#### POST /auth/logout
Invalidate current session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "userId": "uuid",
    "username": "alice",
    "role": "USER"
  }
}
```

#### POST /auth/change-password
Change password (re-encrypts keys).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

### Users

#### GET /users/profile
Get current user's profile.

**Headers:** `Authorization: Bearer <token>`

#### PUT /users/profile
Update profile.

**Body:**
```json
{
  "email": "newemail@example.com",
  "fullName": "Alice M. Smith"
}
```

#### GET /users/search?q=username
Search users by username (for sharing).

**Query Params:**
- `q` (required): Search query
- `limit` (optional): Max results (default: 10)

#### GET /users (Admin Only)
List all users with pagination.

**Query Params:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

---

### Wallets

#### GET /wallets
Get all wallets for current user.

#### POST /wallets
Add new wallet (max 5 per user).

**Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "label": "MetaMask Wallet",
  "signature": "0x...",
  "message": "Sign this message...",
  "isPrimary": false
}
```

#### PUT /wallets/:walletId/primary
Set wallet as primary.

#### PUT /wallets/:walletId/label
Update wallet label.

**Body:**
```json
{
  "label": "New Label"
}
```

#### DELETE /wallets/:walletId
Remove wallet.

#### POST /wallets/challenge
Get challenge message for wallet verification.

**Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "message": "Sign this message to verify you own wallet 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb. Timestamp: 1234567890"
}
```

---

### Documents

#### POST /documents
Upload and encrypt a new document.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` (file): Document file
- `name` (string): Document name
- `description` (string, optional): Description
- `password` (string): User password for encryption

**Response:**
```json
{
  "document": {
    "id": "uuid",
    "blockchainId": "1",
    "name": "Contract.pdf",
    "description": "Important contract",
    "mimeType": "application/pdf",
    "size": 1024000,
    "isArchived": false,
    "isDeleted": false,
    "ownerId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /documents
List user's documents (owned + shared).

**Query Params:**
- `includeArchived` (boolean): Include archived docs
- `page` (number): Page number
- `limit` (number): Items per page

#### GET /documents/:documentId
Get document details.

#### GET /documents/:documentId/download?password=xxx
Download and decrypt document.

**Query Params:**
- `password` (required): User password for decryption

#### PUT /documents/:documentId/archive
Archive document.

#### PUT /documents/:documentId/unarchive
Unarchive document.

#### DELETE /documents/:documentId
Soft delete document and unpin from IPFS.

#### POST /documents/:documentId/transfer
Transfer ownership to another user.

**Body:**
```json
{
  "newOwnerId": "uuid",
  "currentPassword": "password123",
  "newOwnerPassword": "theirpassword"
}
```

---

### Versions

#### GET /documents/:documentId/versions
List all versions for a document.

#### POST /documents/:documentId/versions
Create new version.

**Form Data:**
- `file` (file): New version file
- `password` (string): User password
- `comment` (string, optional): Version comment

#### PUT /documents/:documentId/versions/:versionId/operational
Set version as operational (active).

#### POST /documents/:documentId/versions/:versionId/restore
Restore old version (creates new version with old content).

**Body:**
```json
{
  "password": "password123",
  "comment": "Restored from version 3"
}
```

#### GET /versions/:versionId
Get version details.

#### GET /versions/:versionId/download?password=xxx
Download specific version.

---

### Signatures

#### POST /signatures
Sign a document version.

**Body:**
```json
{
  "versionId": "uuid",
  "walletAddress": "0x...",
  "comment": "Reviewed and approved"
}
```

#### GET /versions/:versionId/signatures
Get all signatures for a version.

#### GET /versions/:versionId/signatures/check
Check if current user has signed.

**Response:**
```json
{
  "hasSigned": true
}
```

#### GET /documents/:documentId/signatures
Get all signatures for all versions of a document.

#### DELETE /signatures/:signatureId
Remove your own signature.

---

### Sharing

#### POST /documents/:documentId/share
Share document with another user.

**Body:**
```json
{
  "recipientUserId": "uuid",
  "role": "SHARED_READ",
  "password": "password123"
}
```

**Roles:**
- `SHARED_READ`: Can view and download
- `SHARED_WRITE`: Can view, download, and create versions
- `SHARED_ADMIN`: Can view, download, create versions, and share

#### GET /documents/:documentId/shares
List users who have access.

#### PUT /documents/:documentId/share/:userId
Update user's role.

**Body:**
```json
{
  "role": "SHARED_WRITE"
}
```

#### DELETE /documents/:documentId/share/:userId
Revoke access.

#### GET /documents/:documentId/my-role
Get your role for a document.

#### GET /shares/with-me
Get documents shared with you.

---

### Statistics

#### GET /stats/me
Get current user's statistics.

**Response:**
```json
{
  "stats": {
    "userId": "uuid",
    "documentsOwned": 10,
    "documentsShared": 5,
    "totalVersions": 25,
    "totalSignatures": 8,
    "storageUsed": 104857600
  }
}
```

#### GET /documents/:documentId/stats
Get statistics for a specific document.

#### GET /stats/system (Admin Only)
Get system-wide statistics.

**Response:**
```json
{
  "stats": {
    "totalUsers": 100,
    "totalDocuments": 500,
    "totalVersions": 1500,
    "totalSignatures": 300,
    "totalStorageUsed": 10485760000,
    "activeUsers": 75
  }
}
```

#### GET /stats/top-documents?metric=size&limit=10 (Admin Only)
Get top documents by metric.

**Query Params:**
- `metric`: `size` | `versions` | `signatures` | `shares`
- `limit`: Number of results (default: 10)

---

## Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": "..."
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "error": "Resource already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production.

---

## File Upload Limits

- Maximum file size: 100 MB
- Maximum files per request: 10
- Supported formats: All

---

## Encryption Flow

1. **Registration**: User registers → ECDH P-256 key pair generated → Private key encrypted with password
2. **Upload**: File uploaded → Encrypted with AES-256-GCM → Uploaded to IPFS → Symmetric key encrypted with user's public key
3. **Share**: Symmetric key re-encrypted with recipient's public key
4. **Download**: Symmetric key decrypted with user's private key → File decrypted

**Important**: Encryption keys are NOT derived from wallet. Wallet is only used for blockchain transaction signing.
