import { useState } from 'react';
import { Phone } from 'lucide-react';
import SimulatorPanel from './SimulatorPanel';
import SimulationResults from './SimulationResults';

const GP = () => {
  const [results, setResults] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '46px', height: '46px', borderRadius: '12px',
          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Phone size={22} style={{ color: '#22c55e' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Grameenphone</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
            Monte Carlo pricing simulator · Bayesian optimization engine
          </p>
        </div>
      </div>

      {/* Simulator Panel */}
      <SimulatorPanel
        operatorName="Grameenphone"
        accentColor="#22c55e"
        onResults={setResults}
      />

      {/* Results Dashboard */}
      {results && (
        <SimulationResults result={results} accentColor="#22c55e" />
      )}
    </div>
  );
};

export default GP;