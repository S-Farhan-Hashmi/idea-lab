/**
 * AuthContext — manages Firebase Authentication state.
 * In mock mode, provides a simulated login flow.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Mock credentials for demo without Firebase
const MOCK_USER = {
  uid: 'mock-user-001',
  email: 'admin@coldchain.hospital',
  displayName: 'Dr. Admin',
  photoURL: null,
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for persisted session (mock mode)
    const saved = localStorage.getItem('coldchain_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  /**
   * Login with email/password
   * Tries Firebase first, falls back to mock credentials
   */
  async function login(email, password, rememberMe = false) {
    setLoading(true);
    try {
      // Try Firebase Auth (when configured)
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('../firebase/config');
        if (auth) {
          const result = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || email.split('@')[0],
            photoURL: result.user.photoURL,
            role: 'admin',
          };
          setUser(firebaseUser);
          if (rememberMe) localStorage.setItem('coldchain_user', JSON.stringify(firebaseUser));
          toast.success('Welcome back!');
          return true;
        }
      } catch (fbErr) {
        // Fall through to mock login
        if (fbErr.code && !fbErr.code.includes('api-key')) throw fbErr;
      }

      // Mock login (demo mode)
      if (email === 'admin@coldchain.hospital' && password === 'admin123') {
        setUser(MOCK_USER);
        if (rememberMe) localStorage.setItem('coldchain_user', JSON.stringify(MOCK_USER));
        toast.success('Logged in (Demo Mode)');
        return true;
      } else {
        throw new Error('Invalid credentials. Use: admin@coldchain.hospital / admin123');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      if (auth) await signOut(auth);
    } catch {}
    setUser(null);
    localStorage.removeItem('coldchain_user');
    toast.success('Logged out successfully');
  }

  async function resetPassword(email) {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../firebase/config');
      if (auth) {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent!');
        return true;
      }
      toast.success('Password reset email sent (demo mode)');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
