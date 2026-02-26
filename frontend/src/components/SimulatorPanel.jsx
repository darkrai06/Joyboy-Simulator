import { useState } from 'react';
import {
    Play, RotateCcw, ChevronDown, DollarSign,
    Sliders, X, Zap, Settings, Target, Users,
    TrendingUp, Hash, Shuffle, AlertCircle, Loader
} from 'lucide-react';

// ─── Reusable field components ─────────────────────────────────────────────

const FieldLabel = ({ icon: Icon, label, required, color = 'rgba(255,255,255,0.4)' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
        <Icon size={12} style={{ color }} />
        <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {label}
        </span>
        {required && <span style={{ color: '#ef4444', fontSize: '10px' }}>*</span>}
    </div>
);

const InputField = ({ value, onChange, type = 'number', placeholder, min, max, step, suffix, accentColor, disabled }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                min={min} max={max} step={step}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={disabled}
                style={{
                    width: '100%',
                    background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${focused ? accentColor + '70' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: '10px',
                    padding: suffix ? '9px 44px 9px 12px' : '9px 12px',
                    fontSize: '13px', fontWeight: 500, color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
                    outline: 'none', fontFamily: 'inherit',
                    boxShadow: focused ? `0 0 0 3px ${accentColor}18` : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    cursor: disabled ? 'not-allowed' : 'text',
                }}
            />
            {suffix && (
                <span style={{
                    position: 'absolute', right: '11px',
                    fontSize: '11px', fontWeight: 700,
                    color: focused ? accentColor : 'rgba(255,255,255,0.3)',
                    pointerEvents: 'none', transition: 'color 0.2s',
                }}>{suffix}</span>
            )}
        </div>
    );
};

const ToggleSwitch = ({ value, onChange, label, color, disabled }) => (
    <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 13px', borderRadius: '9px', cursor: disabled ? 'not-allowed' : 'pointer',
            border: `1px solid ${value ? color + '50' : 'rgba(255,255,255,0.09)'}`,
            background: value ? `${color}18` : 'rgba(255,255,255,0.03)',
            fontFamily: 'inherit', fontSize: '12px', fontWeight: 600,
            color: value ? color : 'rgba(255,255,255,0.4)',
            transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
        }}
    >
        <div style={{
            width: '28px', height: '16px', borderRadius: '8px',
            background: value ? color : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
            <div style={{
                position: 'absolute', top: '2px',
                left: value ? '14px' : '2px',
                width: '12px', height: '12px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
        </div>
        {label}
    </button>
);

// ─── Section header ─────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, color }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 14px',
        background: `${color}0d`,
        borderRadius: '10px',
        border: `1px solid ${color}25`,
        marginBottom: '14px',
    }}>
        <Icon size={14} style={{ color }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color, letterSpacing: '0.04em' }}>{title}</span>
    </div>
);

// ─── Default parameters ──────────────────────────────────────────────────────

const DEFAULT_PARAMS = {
    // Simulation mode
    mode: 'simulate',   // 'simulate' | 'optimize'

    // Single-point (simulate)
    price: 200,
    data_cap: 10,

    // Ranges (optimize)
    price_min: 50,
    price_max: 500,
    data_cap_min: 1,
    data_cap_max: 50,

    // Market
    N0: 10000,
    T: 12,
    discount_rate: 0.01,

    // Acquisition
    beta1: 0.5,
    beta2: 0.05,
    sigma: 1.0,

    // Usage
    use_mixture: true,
    mu_light: 1.0,
    sigma_light: 0.5,
    pi_light: 0.4,
    mu_medium: 2.0,
    sigma_medium: 0.6,
    pi_medium: 0.4,
    mu_heavy: 3.0,
    sigma_heavy: 0.7,

    // Pricing & Cost
    p_over: 15,
    c_gb: 5,

    // Churn
    alpha0: 0.02,
    alpha1: 0.3,

    // Simulation settings
    n_simulations: 1000,
    seed: 42,
    risk_lambda: 0.5,

    // Prospect theory
    prospect_theory: false,
    prospect_alpha: 0.88,
    prospect_beta_pt: 0.88,
    prospect_lambda: 2.25,

    // BO settings
    n_bo_iterations: 20,
    n_bo_init: 8,
};

// ─── Main Component ────────────────────────────────────────────────────────

const SimulatorPanel = ({ operatorName, accentColor = '#22c55e', onResults }) => {
    const [params, setParams] = useState(DEFAULT_PARAMS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const set = key => val => setParams(p => ({ ...p, [key]: val }));
    const setNum = key => val => setParams(p => ({ ...p, [key]: val === '' ? '' : Number(val) }));

    const runSimulation = async () => {
        setLoading(true);
        setError(null);
        try {
            const body = {
                price: Number(params.price),
                data_cap: Number(params.data_cap),
                N0: Number(params.N0),
                T: Number(params.T),
                discount_rate: Number(params.discount_rate),
                beta1: Number(params.beta1),
                beta2: Number(params.beta2),
                sigma: Number(params.sigma),
                use_mixture: params.use_mixture,
                mu_light: Number(params.mu_light),
                sigma_light: Number(params.sigma_light),
                pi_light: Number(params.pi_light),
                mu_medium: Number(params.mu_medium),
                sigma_medium: Number(params.sigma_medium),
                pi_medium: Number(params.pi_medium),
                mu_heavy: Number(params.mu_heavy),
                sigma_heavy: Number(params.sigma_heavy),
                p_over: Number(params.p_over),
                c_gb: Number(params.c_gb),
                alpha0: Number(params.alpha0),
                alpha1: Number(params.alpha1),
                n_simulations: Number(params.n_simulations),
                seed: Number(params.seed),
                risk_lambda: Number(params.risk_lambda),
                prospect_theory: params.prospect_theory,
                prospect_alpha: Number(params.prospect_alpha),
                prospect_beta_pt: Number(params.prospect_beta_pt),
                prospect_lambda: Number(params.prospect_lambda),
            };
            const res = await fetch('http://localhost:8000/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Simulation failed');
            }
            const data = await res.json();
            onResults({ type: 'simulate', data, params: body });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const runOptimize = async () => {
        setLoading(true);
        setError(null);
        try {
            const body = {
                price_min: Number(params.price_min),
                price_max: Number(params.price_max),
                data_cap_min: Number(params.data_cap_min),
                data_cap_max: Number(params.data_cap_max),
                N0: Number(params.N0),
                T: Number(params.T),
                discount_rate: Number(params.discount_rate),
                beta1: Number(params.beta1),
                beta2: Number(params.beta2),
                sigma: Number(params.sigma),
                use_mixture: params.use_mixture,
                mu_light: Number(params.mu_light),
                sigma_light: Number(params.sigma_light),
                pi_light: Number(params.pi_light),
                mu_medium: Number(params.mu_medium),
                sigma_medium: Number(params.sigma_medium),
                pi_medium: Number(params.pi_medium),
                mu_heavy: Number(params.mu_heavy),
                sigma_heavy: Number(params.sigma_heavy),
                p_over: Number(params.p_over),
                c_gb: Number(params.c_gb),
                alpha0: Number(params.alpha0),
                alpha1: Number(params.alpha1),
                n_simulations: Number(params.n_simulations),
                seed: Number(params.seed),
                risk_lambda: Number(params.risk_lambda),
                prospect_theory: params.prospect_theory,
                prospect_alpha: Number(params.prospect_alpha),
                prospect_beta_pt: Number(params.prospect_beta_pt),
                prospect_lambda: Number(params.prospect_lambda),
                n_bo_iterations: Number(params.n_bo_iterations),
                n_bo_init: Number(params.n_bo_init),
            };
            const res = await fetch('http://localhost:8000/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Optimization failed');
            }
            const data = await res.json();
            onResults({ type: 'optimize', data, params: body });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setParams(DEFAULT_PARAMS);
        setError(null);
        onResults(null);
    };

    const isSim = params.mode === 'simulate';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Panel Header ───────────────────────────────────────── */}
            <div style={{
                background: '#1a1a25',
                border: `1px solid ${loading ? accentColor + '40' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '16px', padding: '18px 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'border-color 0.3s',
                boxShadow: loading ? `0 0 40px ${accentColor}12` : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '11px',
                        background: `${accentColor}22`, border: `1px solid ${accentColor}45`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sliders size={19} style={{ color: accentColor }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Monte Carlo Simulator</div>
                        <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                            Bayesian-optimized pricing engine · {operatorName}
                        </div>
                    </div>
                </div>
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 13px', borderRadius: '20px', background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
                        <Loader size={13} style={{ color: accentColor, animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: accentColor }}>Running...</span>
                    </div>
                )}
            </div>

            {/* ── Mode Selector ──────────────────────────────────────── */}
            <div style={{
                background: '#1a1a25', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '16px 18px',
            }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                    Simulation Mode
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                        { val: 'simulate', label: 'Single Simulation', icon: Play, desc: 'Run MC at fixed (price, cap)' },
                        { val: 'optimize', label: 'Bayesian Optimize', icon: Target, desc: 'Find optimal (price, cap)' },
                    ].map(({ val, label, icon: Icon, desc }) => (
                        <button
                            key={val}
                            onClick={() => set('mode')(val)}
                            style={{
                                flex: 1, padding: '13px 16px', borderRadius: '12px', cursor: 'pointer',
                                border: `1px solid ${params.mode === val ? accentColor + '55' : 'rgba(255,255,255,0.08)'}`,
                                background: params.mode === val ? `${accentColor}15` : 'rgba(255,255,255,0.03)',
                                fontFamily: 'inherit', textAlign: 'left',
                                display: 'flex', flexDirection: 'column', gap: '4px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                <Icon size={14} style={{ color: params.mode === val ? accentColor : 'rgba(255,255,255,0.4)' }} />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: params.mode === val ? '#fff' : 'rgba(255,255,255,0.55)' }}>{label}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', paddingLeft: '21px' }}>{desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Parameter Form ─────────────────────────────────────── */}
            <div style={{
                background: '#1a1a25', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '20px',
            }}>

                {/* Decision Variables */}
                <div>
                    <SectionHeader icon={DollarSign} title="Decision Variables" color={accentColor} />
                    {isSim ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <FieldLabel icon={DollarSign} label="Price (BDT/month)" required color={accentColor} />
                                <InputField value={params.price} onChange={setNum('price')} placeholder="200" min={1} suffix="৳" accentColor={accentColor} disabled={loading} />
                            </div>
                            <div>
                                <FieldLabel icon={Sliders} label="Data Cap (GB)" required color={accentColor} />
                                <InputField value={params.data_cap} onChange={setNum('data_cap')} placeholder="10" min={0.1} step={0.5} suffix="GB" accentColor={accentColor} disabled={loading} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <FieldLabel icon={DollarSign} label="Price Range (BDT)" required color={accentColor} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <InputField value={params.price_min} onChange={setNum('price_min')} placeholder="50" suffix="min" accentColor={accentColor} disabled={loading} />
                                    <InputField value={params.price_max} onChange={setNum('price_max')} placeholder="500" suffix="max" accentColor={accentColor} disabled={loading} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel icon={Sliders} label="Data Cap Range (GB)" required color={accentColor} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <InputField value={params.data_cap_min} onChange={setNum('data_cap_min')} placeholder="1" suffix="min" accentColor={accentColor} disabled={loading} />
                                    <InputField value={params.data_cap_max} onChange={setNum('data_cap_max')} placeholder="50" suffix="max" accentColor={accentColor} disabled={loading} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Market Parameters */}
                <div>
                    <SectionHeader icon={Users} title="Market Parameters" color="#6366f1" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <FieldLabel icon={Users} label="Market Size (N₀)" color="#6366f1" />
                            <InputField value={params.N0} onChange={setNum('N0')} placeholder="10000" min={100} accentColor="#6366f1" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Hash} label="Time Horizon (T)" color="#6366f1" />
                            <InputField value={params.T} onChange={setNum('T')} placeholder="12" min={1} max={60} suffix="mo" accentColor="#6366f1" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={TrendingUp} label="Discount Rate (r)" color="#6366f1" />
                            <InputField value={params.discount_rate} onChange={setNum('discount_rate')} placeholder="0.01" min={0} max={0.5} step={0.001} accentColor="#6366f1" disabled={loading} />
                        </div>
                    </div>
                </div>

                {/* Acquisition Parameters */}
                <div>
                    <SectionHeader icon={TrendingUp} title="Acquisition Model (Utility β₁·V(d) − β₂·p + ε)" color="#f59e0b" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <FieldLabel icon={TrendingUp} label="β₁ (data sensitivity)" color="#f59e0b" />
                            <InputField value={params.beta1} onChange={setNum('beta1')} placeholder="0.5" step={0.01} accentColor="#f59e0b" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={TrendingUp} label="β₂ (price sensitivity)" color="#f59e0b" />
                            <InputField value={params.beta2} onChange={setNum('beta2')} placeholder="0.05" step={0.005} accentColor="#f59e0b" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Shuffle} label="σ (utility noise)" color="#f59e0b" />
                            <InputField value={params.sigma} onChange={setNum('sigma')} placeholder="1.0" step={0.05} accentColor="#f59e0b" disabled={loading} />
                        </div>
                    </div>
                </div>

                {/* Churn Parameters */}
                <div>
                    <SectionHeader icon={X} title="Churn Model (α₀ + α₁·OverageRate)" color="#ef4444" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <FieldLabel icon={X} label="α₀ (base churn rate)" color="#ef4444" />
                            <InputField value={params.alpha0} onChange={setNum('alpha0')} placeholder="0.02" step={0.005} max={1} accentColor="#ef4444" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={X} label="α₁ (overage churn sensitivity)" color="#ef4444" />
                            <InputField value={params.alpha1} onChange={setNum('alpha1')} placeholder="0.3" step={0.05} max={5} accentColor="#ef4444" disabled={loading} />
                        </div>
                    </div>
                </div>

                {/* Cost & Overage */}
                <div>
                    <SectionHeader icon={DollarSign} title="Cost & Revenue Parameters" color="#34d399" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <FieldLabel icon={DollarSign} label="Cost per GB (c_gb)" color="#34d399" />
                            <InputField value={params.c_gb} onChange={setNum('c_gb')} placeholder="5" min={0} suffix="৳/GB" accentColor="#34d399" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={DollarSign} label="Overage Price (p_over)" color="#34d399" />
                            <InputField value={params.p_over} onChange={setNum('p_over')} placeholder="15" min={0} suffix="৳/GB" accentColor="#34d399" disabled={loading} />
                        </div>
                    </div>
                </div>

                {/* Simulation Settings */}
                <div>
                    <SectionHeader icon={Settings} title="Simulation Settings" color="#a78bfa" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <FieldLabel icon={Hash} label="Simulations (M)" color="#a78bfa" />
                            <InputField value={params.n_simulations} onChange={setNum('n_simulations')} placeholder="1000" min={100} max={5000} accentColor="#a78bfa" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Shuffle} label="Random Seed" color="#a78bfa" />
                            <InputField value={params.seed} onChange={setNum('seed')} placeholder="42" min={0} accentColor="#a78bfa" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Sliders} label="Risk Aversion (λ)" color="#a78bfa" />
                            <InputField value={params.risk_lambda} onChange={setNum('risk_lambda')} placeholder="0.5" min={0} step={0.05} accentColor="#a78bfa" disabled={loading} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <ToggleSwitch value={params.use_mixture} onChange={set('use_mixture')} label="Mixture Lognormal Usage" color="#a78bfa" disabled={loading} />
                        <ToggleSwitch value={params.prospect_theory} onChange={set('prospect_theory')} label="Prospect Theory Utility" color="#a78bfa" disabled={loading} />
                    </div>
                </div>

                {/* Advanced: BO settings + usage mixture params */}
                <button
                    onClick={() => setShowAdvanced(a => !a)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        background: 'none', border: `1px solid rgba(255,255,255,0.08)`,
                        borderRadius: '9px', padding: '8px 14px', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.35)', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600,
                        transition: 'all 0.2s', width: 'fit-content',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                    <ChevronDown size={13} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Parameters
                </button>

                {showAdvanced && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
                        {/* Usage mixture */}
                        {params.use_mixture && (
                            <div>
                                <SectionHeader icon={Users} title="Usage Mixture Model (Light / Medium / Heavy)" color="#60a5fa" />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {[
                                        { label: 'Light', color: '#34d399', prefix: 'light' },
                                        { label: 'Medium', color: '#60a5fa', prefix: 'medium' },
                                        { label: 'Heavy', color: '#f87171', prefix: 'heavy' },
                                    ].map(({ label, color, prefix }) => (
                                        <div key={prefix} style={{ padding: '12px', background: `${color}08`, border: `1px solid ${color}20`, borderRadius: '10px' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label} Users</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div>
                                                    <FieldLabel icon={Hash} label="μ (log-mean)" color={color} />
                                                    <InputField value={params[`mu_${prefix}`]} onChange={setNum(`mu_${prefix}`)} step={0.1} accentColor={color} disabled={loading} />
                                                </div>
                                                <div>
                                                    <FieldLabel icon={Hash} label="σ (log-std)" color={color} />
                                                    <InputField value={params[`sigma_${prefix}`]} onChange={setNum(`sigma_${prefix}`)} step={0.05} min={0.01} accentColor={color} disabled={loading} />
                                                </div>
                                                {prefix !== 'heavy' && (
                                                    <div>
                                                        <FieldLabel icon={Hash} label="π (fraction)" color={color} />
                                                        <InputField value={params[`pi_${prefix}`]} onChange={setNum(`pi_${prefix}`)} step={0.05} min={0} max={1} accentColor={color} disabled={loading} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bayesian Optimization settings (only in optimize mode) */}
                        {!isSim && (
                            <div>
                                <SectionHeader icon={Target} title="Bayesian Optimization Settings" color="#f59e0b" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <FieldLabel icon={Hash} label="BO Iterations" color="#f59e0b" />
                                        <InputField value={params.n_bo_iterations} onChange={setNum('n_bo_iterations')} placeholder="20" min={5} max={100} accentColor="#f59e0b" disabled={loading} />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Initial Random Evals" color="#f59e0b" />
                                        <InputField value={params.n_bo_init} onChange={setNum('n_bo_init')} placeholder="8" min={3} max={30} accentColor="#f59e0b" disabled={loading} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Prospect Theory */}
                        {params.prospect_theory && (
                            <div>
                                <SectionHeader icon={TrendingUp} title="Prospect Theory Parameters" color="#f97316" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <FieldLabel icon={Hash} label="α (gain exponent)" color="#f97316" />
                                        <InputField value={params.prospect_alpha} onChange={setNum('prospect_alpha')} step={0.01} min={0} max={1} accentColor="#f97316" disabled={loading} />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="β (loss exponent)" color="#f97316" />
                                        <InputField value={params.prospect_beta_pt} onChange={setNum('prospect_beta_pt')} step={0.01} min={0} max={1} accentColor="#f97316" disabled={loading} />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="λ (loss aversion)" color="#f97316" />
                                        <InputField value={params.prospect_lambda} onChange={setNum('prospect_lambda')} step={0.05} min={1} accentColor="#f97316" disabled={loading} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* ── Error Display ──────────────────────────────────────── */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                }}>
                    <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f87171' }}>Simulation Error</div>
                        <div style={{ fontSize: '12px', color: 'rgba(248,113,113,0.8)', marginTop: '3px' }}>{error}</div>
                    </div>
                </div>
            )}

            {/* ── Action Bar ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={isSim ? runSimulation : runOptimize}
                    disabled={loading}
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                        padding: '13px 20px', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                        border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: '#fff',
                        background: loading
                            ? 'rgba(255,255,255,0.1)'
                            : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        boxShadow: loading ? 'none' : `0 4px 20px ${accentColor}40`,
                        transition: 'all 0.2s',
                        opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                >
                    {loading
                        ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running simulation...</>
                        : isSim
                            ? <><Play size={16} /> Run Monte Carlo Simulation</>
                            : <><Zap size={16} /> Run Bayesian Optimization</>
                    }
                </button>
                <button
                    onClick={reset}
                    disabled={loading}
                    style={{
                        padding: '13px 16px', borderRadius: '12px', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.09)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                        opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                    <RotateCcw size={14} />
                    Reset
                </button>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SimulatorPanel;
