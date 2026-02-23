import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';

const pageTitles = {
  '/': { title: 'Dashboard', sub: 'Welcome back, Admin' },
  '/gp': { title: 'Grameenphone', sub: 'Operator Analytics' },
  '/robi': { title: 'Robi', sub: 'Operator Analytics' },
  '/airtel': { title: 'Airtel', sub: 'Operator Analytics' },
  '/banglalink': { title: 'Banglalink', sub: 'Operator Analytics' },
  '/teletalk': { title: 'Teletalk', sub: 'Operator Analytics' },
};

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const meta = pageTitles[location.pathname] || { title: 'Admin', sub: '' };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f14', overflow: 'hidden' }}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* ── Main Area ─────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Top Bar ──────────────────────────────── */}
        <div style={{
          height: '64px', flexShrink: 0,
          background: 'rgba(19,19,26,0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px',
          gap: '16px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Page title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '18px', fontWeight: 700,
              color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>{meta.title}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
              {meta.sub}
            </div>
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', padding: '7px 14px',
            width: '220px',
          }}>
            <Search size={15} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <input
              placeholder="Search…"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: '13px', color: 'rgba(255,255,255,0.7)',
                width: '100%',
              }}
            />
          </div>

          {/* Notification bell */}
          <button style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
            position: 'relative', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <Bell size={17} />
            {/* dot indicator */}
            <div style={{
              position: 'absolute', top: '9px', right: '9px',
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#ef4444',
              border: '2px solid #13131a',
            }} />
          </button>

          {/* Avatar */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
          }}>A</div>
        </div>

        {/* ── Content ──────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '28px',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;