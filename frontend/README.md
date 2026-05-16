# DocumentChain Frontend

Modern React frontend for the DocumentChain blockchain-based document management system.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **State Management**: 
  - TanStack Query (React Query) for server state
  - Zustand for client state
  - Context API for authentication
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Blockchain**: ethers.js v6

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client functions
│   │   ├── auth.ts
│   │   ├── documents.ts
│   │   ├── versions.ts
│   │   ├── shares.ts
│   │   └── wallets.ts
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   ├── auth/        # Authentication components
│   │   ├── documents/   # Document management
│   │   ├── versions/    # Version control
│   │   ├── sharing/     # Sharing system
│   │   ├── layout/      # Layout components
│   │   ├── wallets/     # Wallet management
│   │   └── stats/       # Statistics
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   │   ├── api.ts       # Axios configuration
│   │   └── utils.ts     # Helper functions
│   ├── pages/           # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Profile.tsx
│   │   ├── Documents.tsx
│   │   ├── DocumentDetails.tsx
│   │   ├── SharedWithMe.tsx
│   │   └── Dashboard.tsx
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript config
├── .env                 # Environment variables
└── package.json
```

## Features Implemented

### Authentication
- ✅ Login with username/password
- ✅ User registration
- ✅ JWT token management
- ✅ Protected routes
- ✅ Persistent authentication
- ✅ Password change
- ✅ Logout

### Document Management
- ✅ Upload documents with encryption
- ✅ List documents (paginated)
- ✅ View document details
- ✅ Download encrypted documents
- ✅ Archive documents
- ✅ Delete documents
- ✅ Search/filter documents

### Version Control
- ✅ View version history
- ✅ Download specific versions
- ✅ Set operational version
- ✅ Restore previous versions
- ✅ Version metadata display

### Sharing System
- ✅ Share documents with users
- ✅ Role-based permissions (READ, WRITE, ADMIN)
- ✅ View shared documents
- ✅ Update share permissions
- ✅ Revoke access
- ✅ List documents shared with me

### Dashboard & Statistics
- ✅ User statistics overview
- ✅ Storage usage
- ✅ Document counts
- ✅ Sharing statistics

### UI Components
- ✅ Button (multiple variants)
- ✅ Input (with validation states)
- ✅ Card
- ✅ Modal
- ✅ Loading states
- ✅ Alert/notifications
- ✅ Badge
- ✅ Responsive layout
- ✅ Dark mode ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `https://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
VITE_API_URL=https://localhost:3000/api
VITE_APP_NAME=DocumentChain
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## API Integration

The frontend connects to the backend API via Axios with the following features:

- **Base URL**: Configured via `VITE_API_URL`
- **Authentication**: JWT tokens in `Authorization` header
- **Token Refresh**: Automatic token refresh on 401
- **Error Handling**: Global error interceptor
- **Request/Response Logging**: In development mode

### API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/download` - Download document
- `PATCH /api/documents/:id/archive` - Archive document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/versions/:documentId` - List versions
- `POST /api/versions/:documentId` - Create version
- `GET /api/shares/:documentId` - List shares
- `POST /api/shares/:documentId` - Share document
- `GET /api/shares/shared-with-me` - Get shared documents
- `GET /api/stats/user` - User statistics

## Key Features

### Encryption Flow

1. **Upload**: User provides password → File encrypted with AES-256-GCM → Uploaded to IPFS
2. **Download**: User provides password → File decrypted locally → Download starts

### Authentication Flow

1. User logs in → JWT token received
2. Token stored in localStorage
3. Token included in all API requests
4. Auto-refresh on expiration
5. Redirect to login on 401

### State Management

- **Server State**: TanStack Query for caching and synchronization
- **Auth State**: React Context for user session
- **Client State**: Zustand for UI state (planned for future features)

## Styling

Using Tailwind CSS with custom configuration:

- **Colors**: Primary blue palette
- **Responsive**: Mobile-first approach
- **Dark Mode**: Ready for implementation
- **Custom Components**: Consistent design system

## TypeScript

Fully typed with TypeScript:

- Strict mode enabled
- Complete type definitions for all API responses
- Type-safe API client
- Type-safe components and props

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Optimizations

- Code splitting with React.lazy
- Image optimization
- React Query caching
- Debounced search
- Pagination for large lists
- Optimistic updates

## Security

- XSS protection via React
- CSRF tokens in API requests
- Secure token storage
- Password encryption before transmission
- Content Security Policy ready

## Future Enhancements

- [ ] Advanced search filters
- [ ] Bulk operations
- [ ] Real-time notifications
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Offline support with service workers
- [ ] End-to-end tests

## Troubleshooting

### Common Issues

**API Connection Error**
```
Solution: Ensure backend is running on https://localhost:3000
Check VITE_API_URL in .env file
```

**Login Failed**
```
Solution: Check credentials
Ensure backend database is running
Check browser console for errors
```

**Upload Failed**
```
Solution: Check file size (max 100MB)
Ensure strong password (min 6 chars)
Verify IPFS is running
```

## Development Notes

### Component Guidelines

1. Use functional components with hooks
2. TypeScript for all components
3. Props interfaces exported
4. Use Tailwind for styling
5. Implement error boundaries
6. Add loading states

### API Client Guidelines

1. Use dedicated API functions
2. Handle errors consistently
3. Type all responses
4. Use React Query for data fetching
5. Implement retry logic

## License

MIT

## Contributors

- TFG Project Team

---

For backend documentation, see `../backend/README.md`
