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
import { Landing } from './pages/Landing'; // Import landing page
import { VerifyEmail } from './pages/VerifyEmail';

// Main pages
import { Documents } from './pages/Documents';
import { DocumentDetails } from './pages/DocumentDetails';
import { SharedWithMe } from './pages/SharedWithMe';
import { AdminDashboard } from './pages/AdminDashboard';
import { Verify } from './pages/Verify';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { Audit } from './pages/Audit';
import { DocumentTimeline } from './pages/DocumentTimeline';
import { BlockchainAuditor } from './pages/BlockchainAuditor';
import { PublicDocument } from './pages/PublicDocument';

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
      <Route path="/audit" element={<Audit />} />
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
        <Route path="shared" element={<SharedWithMe />} />
        <Route path="dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="verify" element={<Verify />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="blockchain" element={<BlockchainAuditor />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
