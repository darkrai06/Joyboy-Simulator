import { Link, useLocation } from 'react-router-dom';
import { Home, Phone, Menu, X, Zap, ChevronRight } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, description, path, isCollapsed, isActive }) => {
  return (
    <Link
      to={path}
      title={isCollapsed ? label : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isCollapsed ? '0' : '12px',
        padding: isCollapsed ? '12px' : '10px 14px',
        borderRadius: '10px',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        background: isActive
          ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(220,38,38,0.15))'
          : 'transparent',
        border: isActive
          ? '1px solid rgba(239,68,68,0.3)'
          : '1px solid transparent',
        color: isActive ? '#fca5a5' : 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        cursor: 'pointer',
        marginBottom: '4px',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
          e.currentTarget.style.border = '1px solid transparent';
        }
      }}
    >
      {isActive && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 0% 50%, rgba(239,68,68,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}
      {isActive && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: '3px',
          background: 'linear-gradient(180deg, #f87171, #dc2626)',
          borderRadius: '0 4px 4px 0',
        }} />
      )}
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.07)',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
        transition: 'all 0.2s ease',
        boxShadow: isActive ? '0 4px 12px rgba(239,68,68,0.35)' : 'none',
      }}>
        <Icon size={17} />
      </div>
      {!isCollapsed && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, lineHeight: 1.2, color: isActive ? '#fff' : 'rgba(255,255,255,0.8)', letterSpacing: '0.01em' }}>{label}</div>
          <div style={{ fontSize: '11px', marginTop: '2px', color: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{description}</div>
        </div>
      )}
      {!isCollapsed && isActive && <ChevronRight size={14} style={{ color: 'rgba(239,68,68,0.7)', flexShrink: 0 }} />}
    </Link>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'home', path: '/', label: 'Dashboard', icon: Home, description: 'Overview & stats' },
    { id: 'gp', path: '/gp', label: 'Simulator', icon: Phone, description: 'Simulation & config' },
  ];

  return (
    <div style={{
      width: isCollapsed ? '72px' : '256px',
      minWidth: isCollapsed ? '72px' : '256px',
      height: '100vh',
      background: '#13131a',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{
        padding: isCollapsed ? '20px 0' : '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        gap: '12px', flexShrink: 0,
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #ef4444, #991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}>
              <Zap size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>Joyboy</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}>
            <Zap size={18} color="#fff" />
          </div>
        )}
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
            <X size={16} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button onClick={() => setIsCollapsed(false)} style={{ margin: '12px auto 0', width: '40px', height: '40px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
          <Menu size={18} />
        </button>
      )}

      {!isCollapsed && (
        <div style={{ padding: '16px 16px 6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Navigation</div>
      )}

      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isCollapsed ? '8px 10px' : '4px 12px' }}>
        {menuItems.map((item) => (
          <SidebarItem key={item.id} icon={item.icon} label={item.label} description={item.description} path={item.path} isCollapsed={isCollapsed} isActive={location.pathname === item.path} />
        ))}
      </nav>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

      <div style={{ padding: isCollapsed ? '12px 10px' : '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '10px', padding: isCollapsed ? '10px' : '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', boxShadow: '0 4px 10px rgba(99,102,241,0.35)' }}>A</div>
          {!isCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>admin@joyboy.com</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;