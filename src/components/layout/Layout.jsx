/**
 * Main Layout Wrapper — wraps all authenticated pages
 */
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
