/**
 * Layout.jsx — OS shell wrapper for all authenticated pages
 */
import OSShell from './OSShell';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <OSShell />
      <main className="os-main">
        <Outlet />
      </main>
    </div>
  );
}
