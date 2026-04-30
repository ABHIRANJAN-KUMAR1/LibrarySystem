import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPending from "./pages/AdminPending";
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import RequestsPage from "./pages/RequestsPage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetail from "./pages/CollectionDetail";
import ResourceDetail from "./pages/ResourceDetail";
import Leaderboard from "./pages/Leaderboard";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Auth Routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes (with layout) */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><AppLayout><Upload /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><AppLayout><RequestsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/collections" element={<ProtectedRoute><AppLayout><CollectionsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/collections/:id" element={<ProtectedRoute><AppLayout><CollectionDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/resources/:id" element={<ProtectedRoute><AppLayout><ResourceDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/pending" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminPending /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminAnalytics /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
