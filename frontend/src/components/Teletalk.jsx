import { Phone, Users, DollarSign, Database, Ticket } from 'lucide-react';
import SimulatorPanel from './SimulatorPanel';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div style={{
    background: '#1a1a25', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px', padding: '18px',
    display: 'flex', flexDirection: 'column', gap: '6px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
        background: `${color}20`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} style={{ color }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
  </div>
);

const Teletalk = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{
        width: '46px', height: '46px', borderRadius: '12px',
        background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Phone size={22} style={{ color: '#8b5cf6' }} />
      </div>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Teletalk</h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Operator analytics & simulation</p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
      <StatCard icon={Users} label="Active Users" value="8,721" sub="+2% from last month" color="#8b5cf6" />
      <StatCard icon={DollarSign} label="Revenue" value="৳38,450" sub="-1% from last month" color="#f87171" />
      <StatCard icon={Database} label="Data Usage" value="214 GB" sub="Daily average" color="#a855f7" />
      <StatCard icon={Ticket} label="Support Tickets" value="9" sub="Open tickets" color="#f97316" />
    </div>

    <SimulatorPanel operatorName="Teletalk" accentColor="#8b5cf6" />
  </div>
);

export default Teletalk;