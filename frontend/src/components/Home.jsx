import { Link } from 'react-router-dom';
import { Phone, Wifi, Radio, Signal, Users, Activity, DollarSign, Globe, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, delay }) => (
  <div
    className="animate-fade-in-up"
    style={{
      background: '#1a1a25',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      animationDelay: delay,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3)`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {/* Background gradient accent */}
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: '100px', height: '100px',
      background: `radial-gradient(circle at 100% 0%, ${color}18 0%, transparent 70%)`,
      pointerEvents: 'none',
    }} />

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px',
        background: `${color}20`,
        border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '12px', fontWeight: 600,
        color: trendUp ? '#34d399' : '#f87171',
        background: trendUp ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
        padding: '3px 8px', borderRadius: '20px',
      }}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend}
      </div>
    </div>

    <div>
      <div style={{
        fontSize: '28px', fontWeight: 800,
        color: '#fff', letterSpacing: '-0.03em', lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontSize: '13px', color: 'rgba(255,255,255,0.4)',
        marginTop: '4px', fontWeight: 500,
      }}>{label}</div>
    </div>

    {/* Mini bar chart decoration */}
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '28px' }}>
      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: '3px 3px 0 0',
          background: i === 9 ? color : `${color}40`,
          height: `${h}%`,
          transition: 'height 0.3s ease',
        }} />
      ))}
    </div>
  </div>
);

const MNOCard = ({ icon: Icon, name, path, color, users, status }) => (
  <Link
    to={path}
    style={{
      background: '#1a1a25',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '18px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = '#1e1e2d';
      e.currentTarget.style.borderColor = `${color}40`;
      e.currentTarget.style.transform = 'translateX(4px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = '#1a1a25';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.transform = 'translateX(0)';
    }}
  >
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
      background: `${color}20`, border: `1px solid ${color}35`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={19} style={{ color }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{name}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{users} users</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: status === 'live' ? '#34d399' : '#f87171',
        boxShadow: status === 'live' ? '0 0 8px rgba(52,211,153,0.6)' : '0 0 8px rgba(248,113,113,0.6)',
      }} />
      <ArrowRight size={15} style={{ color: 'rgba(255,255,255,0.2)' }} />
    </div>
  </Link>
);

const ActivityItem = ({ action, time, operator, type }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <div style={{
      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
      background: type === 'success' ? '#34d399' : type === 'warning' ? '#fbbf24' : '#60a5fa',
      boxShadow: `0 0 6px ${type === 'success' ? 'rgba(52,211,153,0.5)' : type === 'warning' ? 'rgba(251,191,36,0.5)' : 'rgba(96,165,250,0.5)'}`,
    }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{action}</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{operator}</div>
    </div>
    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{time}</div>
  </div>
);

const Home = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const stats = [
    { icon: Users, label: 'Total Users', value: '1.23M', trend: '+12%', trendUp: true, color: '#6366f1', delay: '0ms' },
    { icon: Activity, label: 'Active Sessions', value: '45.6K', trend: '+8%', trendUp: true, color: '#34d399', delay: '60ms' },
    { icon: DollarSign, label: 'Revenue (BDT)', value: '৳ 2.4M', trend: '+5%', trendUp: true, color: '#f59e0b', delay: '120ms' },
    { icon: Globe, label: 'MNO Operators', value: '5', trend: 'Stable', trendUp: true, color: '#60a5fa', delay: '180ms' },
  ];

  const mnos = [
    { icon: Phone, name: 'Grameenphone', path: '/gp', color: '#22c55e', users: '45.6K', status: 'live' },
    { icon: Wifi, name: 'Robi', path: '/robi', color: '#3b82f6', users: '28.3K', status: 'live' },
    { icon: Radio, name: 'Airtel', path: '/airtel', color: '#f97316', users: '19.1K', status: 'live' },
    { icon: Signal, name: 'Banglalink', path: '/banglalink', color: '#ef4444', users: '31.4K', status: 'live' },
    { icon: Phone, name: 'Teletalk', path: '/teletalk', color: '#8b5cf6', users: '8.7K', status: 'warning' },
  ];

  const activity = [
    { action: 'New user batch synced', operator: 'Grameenphone', time: '2m ago', type: 'success' },
    { action: 'Revenue report generated', operator: 'Robi', time: '14m ago', type: 'info' },
    { action: 'API rate limit reached', operator: 'Teletalk', time: '32m ago', type: 'warning' },
    { action: 'Session data updated', operator: 'Airtel', time: '1h ago', type: 'success' },
    { action: 'User export completed', operator: 'Banglalink', time: '2h ago', type: 'info' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>

      {/* ── Welcome Banner ───────────────────────── */}
      <div
        className="animate-fade-in-up"
        style={{
          borderRadius: '18px', padding: '28px 32px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a25 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* BG blobs */}
        <div style={{ position: 'absolute', top: '-30px', right: '80px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '-20px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {dateStr}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'}, Admin 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', marginTop: '6px', fontWeight: 400 }}>
            Here's what's happening across your MNO network today.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginTop: '18px', padding: '8px 16px', borderRadius: '30px',
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.7)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>All systems operational</span>
            <span style={{ fontSize: '12px', color: 'rgba(52,211,153,0.6)' }}>· {timeStr}</span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Bottom Row ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>

        {/* MNO Quick Access */}
        <div style={{
          background: '#1a1a25', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>MNO Operators</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>5 registered</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mnos.map((m, i) => <MNOCard key={i} {...m} />)}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#1a1a25', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '22px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Recent Activity
          </div>
          <div>
            {activity.map((a, i) => <ActivityItem key={i} {...a} />)}
          </div>
          <button style={{
            width: '100%', marginTop: '14px', padding: '9px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;