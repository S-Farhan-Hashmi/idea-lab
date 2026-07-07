/**
 * App.jsx — Root router with protected routes and context providers
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider } from './contexts/SettingsContext';

import Layout from './components/layout/Layout';
import LoadingScreen from './components/layout/LoadingScreen';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import Analytics from './pages/Analytics';
import TemperatureHistory from './pages/TemperatureHistory';
import AlertsPage from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected — all wrapped in Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DataProvider>
              <Layout />
            </DataProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/history" element={<TemperatureHistory />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
              duration: 3000,
            }}
          />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
