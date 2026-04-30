import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import UploadPage from './pages/UploadPage'
import BrowseResources from './pages/BrowseResources'
import MyUploads from './pages/MyUploads'
import AdminDashboard from './pages/AdminDashboard'
import PendingApprovals from './pages/PendingApprovals'
import AdminResources from './pages/AdminResources'

// Protect routes that need authentication
function RequireAuth({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// Protect routes that need admin role
function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// Redirect already-logged-in users away from auth pages
function GuestOnly({ children }) {
  const { user, isAdmin } = useAuth()
  if (user) return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      {/* User routes */}
      <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
      <Route path="/browse" element={<RequireAuth><BrowseResources /></RequireAuth>} />
      <Route path="/upload" element={<RequireAuth><UploadPage /></RequireAuth>} />
      <Route path="/my-uploads" element={<RequireAuth><MyUploads /></RequireAuth>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/pending" element={<RequireAdmin><PendingApprovals /></RequireAdmin>} />
      <Route path="/admin/resources" element={<RequireAdmin><AdminResources /></RequireAdmin>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
