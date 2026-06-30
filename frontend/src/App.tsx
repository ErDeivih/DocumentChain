import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/layout/Layout';

// Auth pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Profile } from './pages/Profile';
import { Landing } from './pages/Landing';
import { VerifyEmail } from './pages/VerifyEmail';

// Main pages (eager)
import { Documents } from './pages/Documents';
import { DocumentDetails } from './pages/DocumentDetails';
import { Verify } from './pages/Verify';
import { Notifications } from './pages/Notifications';
import { DocumentTimeline } from './pages/DocumentTimeline';
import { PublicDocument } from './pages/PublicDocument';

// Lazy-loaded pages
const SharedWithMe = lazy(() => import('./pages/SharedWithMe').then(m => ({ default: m.SharedWithMe })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const BlockchainAuditor = lazy(() => import('./pages/BlockchainAuditor').then(m => ({ default: m.BlockchainAuditor })));

/**
 * Componente raíz de la aplicación.
 *
 * Define el enrutamiento principal mediante React Router, distinguendo entre rutas públicas,
 * rutas protegidas que requieren autenticación y rutas restringidas a administradores.
 *
 * @returns Árbol de rutas de la aplicación.
 */
function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/public/d/:publicId" element={<PublicDocument />} />
      <Route path="/public/d/:publicId/v/:versionNumber" element={<PublicDocument />} />
      {/* Protected routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/documents" replace />} />
        <Route path="documents" element={<Documents />} />
        <Route path="documents/:id" element={<DocumentDetails />} />
        <Route path="documents/:id/timeline" element={<DocumentTimeline />} />
        <Route path="shared" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>}><SharedWithMe /></Suspense>} />
        <Route path="dashboard" element={<AdminRoute><Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>}><AdminDashboard /></Suspense></AdminRoute>} />
        <Route path="verify" element={<Verify />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>}><Settings /></Suspense>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="blockchain" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>}><BlockchainAuditor /></Suspense>} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
