import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        {/* Hamburger — mobile only */}
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>

        {children}
      </main>
    </div>
  );
}