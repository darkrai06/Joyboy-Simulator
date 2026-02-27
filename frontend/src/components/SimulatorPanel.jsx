import { useState } from 'react';
import {
    Play, RotateCcw, ChevronDown, DollarSign,
    Sliders, X, Zap, Settings, Target, Users,
    TrendingUp, Hash, Shuffle, AlertCircle, Loader,
    Plus, Trash2, Phone, Wifi, Clock, Package
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

// ─── Package Card ────────────────────────────────────────────────────────────

const PackageCard = ({ pkg, index, onChange, onRemove, accentColor, disabled, showRemove }) => (
    <div style={{
        padding: '16px', borderRadius: '14px',
        background: `${accentColor}08`,
        border: `1px solid ${accentColor}25`,
        display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={14} style={{ color: accentColor }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Package {index + 1}
                </span>
            </div>
            {showRemove && (
                <button
                    onClick={onRemove}
                    disabled={disabled}
                    style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: '7px', padding: '4px 8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: '#f87171', fontSize: '11px', fontWeight: 600, fontFamily: 'inherit',
                    }}
                >
                    <Trash2 size={11} /> Remove
                </button>
            )}
        </div>

        {/* Label */}
        <div>
            <FieldLabel icon={Package} label="Label" color={accentColor} />
            <InputField value={pkg.label} onChange={v => onChange('label', v)} type="text" placeholder="e.g. 1GB 7-day" accentColor={accentColor} disabled={disabled} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
                <FieldLabel icon={Wifi} label="Data (GB)" required color={accentColor} />
                <InputField value={pkg.data_gb} onChange={v => onChange('data_gb', v)} placeholder="1" min={0} step={0.5} suffix="GB" accentColor={accentColor} disabled={disabled} />
            </div>
            <div>
                <FieldLabel icon={Phone} label="Voice (min)" color={accentColor} />
                <InputField value={pkg.voice_min} onChange={v => onChange('voice_min', v)} placeholder="0" min={0} step={10} suffix="min" accentColor={accentColor} disabled={disabled} />
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
                <FieldLabel icon={Clock} label="Validity (days)" required color={accentColor} />
                <InputField value={pkg.validity_days} onChange={v => onChange('validity_days', v)} placeholder="7" min={1} max={365} suffix="days" accentColor={accentColor} disabled={disabled} />
            </div>
            <div>
                <FieldLabel icon={DollarSign} label="Price (BDT)" required color={accentColor} />
                <InputField value={pkg.price} onChange={v => onChange('price', v)} placeholder="100" min={1} suffix="৳" accentColor={accentColor} disabled={disabled} />
            </div>
        </div>
    </div>
);

// ─── Default parameters ──────────────────────────────────────────────────────

const DEFAULT_PACKAGE = {
    data_gb: 1,
    voice_min: 0,
    validity_days: 7,
    price: 100,
    label: 'Standard',
};

const DEFAULT_PARAMS = {
    mode: 'simulate',

    // Packages
    packages: [{ ...DEFAULT_PACKAGE }],

    // Optimize search ranges
    price_min: 10,
    price_max: 500,
    data_gb_min: 0,
    data_gb_max: 20,
    voice_min_min: 0,
    voice_min_max: 500,
    validity_min: 1,
    validity_max: 30,

    // Market
    N0: 10000,
    T_days: 90,
    discount_rate: 0.01,

    // Acquisition
    beta_data: 0.5,
    beta_voice: 0.3,
    beta_price: 0.05,
    beta_validity: 0.2,
    sigma: 1.0,

    // Data usage
    use_mixture: true,
    mu_light: -0.5,
    sigma_light: 0.5,
    pi_light: 0.4,
    mu_medium: 0.5,
    sigma_medium: 0.6,
    pi_medium: 0.4,
    mu_heavy: 1.5,
    sigma_heavy: 0.7,

    // Voice usage
    mu_voice: 3.0,
    sigma_voice: 0.8,

    // Network costs
    c_gb_3g: 2,
    c_gb_4g: 5,
    c_gb_5g: 10,
    pct_3g: 0.3,
    pct_4g: 0.5,
    pct_5g: 0.2,
    c_min: 0.5,

    // Overage
    p_over_data: 15,
    p_over_voice: 1.5,

    // Renewal
    enable_renewal: false,
    base_renewal_rate: 0.6,
    renewal_decay: 0.05,

    // Simulation settings
    n_simulations: 1000,
    seed: 42,
    risk_lambda: 0.5,

    // BO settings
    n_bo_iterations: 20,
    n_bo_init: 8,
    T_months: 3,
};

// ─── Main Component ────────────────────────────────────────────────────────

const SimulatorPanel = ({ operatorName, accentColor = '#22c55e', onResults }) => {
    const [params, setParams] = useState(DEFAULT_PARAMS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const setNum = key => val => setParams(p => ({ ...p, [key]: val === '' ? '' : Number(val) }));
    const set = key => val => setParams(p => ({ ...p, [key]: val }));

    const updatePackage = (idx, field, val) => {
        setParams(p => {
            const pkgs = [...p.packages];
            pkgs[idx] = {
                ...pkgs[idx],
                [field]: field === 'label' ? val : (val === '' ? '' : Number(val)),
            };
            return { ...p, packages: pkgs };
        });
    };

    const addPackage = () => {
        setParams(p => ({
            ...p,
            packages: [...p.packages, { ...DEFAULT_PACKAGE, label: `Package ${p.packages.length + 1}` }],
        }));
    };

    const removePackage = (idx) => {
        setParams(p => ({
            ...p,
            packages: p.packages.filter((_, i) => i !== idx),
        }));
    };

    const buildSimBody = () => {
        const pkg = params.packages[0] || DEFAULT_PACKAGE;
        return {
            package: {
                data_gb: Number(pkg.data_gb),
                voice_min: Number(pkg.voice_min),
                validity_days: Number(pkg.validity_days),
                price: Number(pkg.price),
                label: pkg.label || 'Package',
            },
            N0: Number(params.N0),
            T_days: Number(params.T_days),
            discount_rate: Number(params.discount_rate),
            beta_data: Number(params.beta_data),
            beta_voice: Number(params.beta_voice),
            beta_price: Number(params.beta_price),
            beta_validity: Number(params.beta_validity),
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
            mu_voice: Number(params.mu_voice),
            sigma_voice: Number(params.sigma_voice),
            c_gb_3g: Number(params.c_gb_3g),
            c_gb_4g: Number(params.c_gb_4g),
            c_gb_5g: Number(params.c_gb_5g),
            pct_3g: Number(params.pct_3g),
            pct_4g: Number(params.pct_4g),
            pct_5g: Number(params.pct_5g),
            c_min: Number(params.c_min),
            p_over_data: Number(params.p_over_data),
            p_over_voice: Number(params.p_over_voice),
            enable_renewal: params.enable_renewal,
            base_renewal_rate: Number(params.base_renewal_rate),
            renewal_decay: Number(params.renewal_decay),
            n_simulations: Number(params.n_simulations),
            seed: Number(params.seed),
            risk_lambda: Number(params.risk_lambda),
        };
    };

    const buildOptBody = () => {
        const pkgs = params.packages.map(pkg => ({
            data_gb: Number(pkg.data_gb),
            voice_min: Number(pkg.voice_min),
            validity_days: Number(pkg.validity_days),
            price: Number(pkg.price),
            label: pkg.label || 'Package',
        }));
        return {
            packages: pkgs,
            price_min: Number(params.price_min),
            price_max: Number(params.price_max),
            data_gb_min: Number(params.data_gb_min),
            data_gb_max: Number(params.data_gb_max),
            voice_min_min: Number(params.voice_min_min),
            voice_min_max: Number(params.voice_min_max),
            validity_min: Number(params.validity_min),
            validity_max: Number(params.validity_max),
            T_months: Number(params.T_months),
            N0: Number(params.N0),
            T_days: Number(params.T_days),
            discount_rate: Number(params.discount_rate),
            beta_data: Number(params.beta_data),
            beta_voice: Number(params.beta_voice),
            beta_price: Number(params.beta_price),
            beta_validity: Number(params.beta_validity),
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
            mu_voice: Number(params.mu_voice),
            sigma_voice: Number(params.sigma_voice),
            c_gb_3g: Number(params.c_gb_3g),
            c_gb_4g: Number(params.c_gb_4g),
            c_gb_5g: Number(params.c_gb_5g),
            pct_3g: Number(params.pct_3g),
            pct_4g: Number(params.pct_4g),
            pct_5g: Number(params.pct_5g),
            c_min: Number(params.c_min),
            p_over_data: Number(params.p_over_data),
            p_over_voice: Number(params.p_over_voice),
            enable_renewal: params.enable_renewal,
            base_renewal_rate: Number(params.base_renewal_rate),
            renewal_decay: Number(params.renewal_decay),
            n_simulations: Number(params.n_simulations),
            seed: Number(params.seed),
            risk_lambda: Number(params.risk_lambda),
            n_bo_iterations: Number(params.n_bo_iterations),
            n_bo_init: Number(params.n_bo_init),
        };
    };

    const runSimulation = async () => {
        setLoading(true);
        setError(null);
        try {
            const body = buildSimBody();
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
            const body = buildOptBody();
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
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Package Simulator</div>
                        <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                            One-time package pricing engine · {operatorName}
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
                        { val: 'simulate', label: 'Single Package', icon: Play, desc: 'Simulate one package offer' },
                        { val: 'optimize', label: 'Bayesian Optimize', icon: Target, desc: 'Find optimal package params' },
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

            {/* ── Package Builder ─────────────────────────────────────── */}
            {isSim && (<div style={{
                background: '#1a1a25', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
                <SectionHeader icon={Package} title={isSim ? 'Package Definition' : 'Initial Package Portfolio'} color={accentColor} />

                {params.packages.map((pkg, idx) => (
                    <PackageCard
                        key={idx}
                        pkg={pkg}
                        index={idx}
                        onChange={(field, val) => updatePackage(idx, field, val)}
                        onRemove={() => removePackage(idx)}
                        accentColor={accentColor}
                        disabled={loading}
                        showRemove={!isSim && params.packages.length > 1}
                    />
                ))}

                {isSim && (
                    <button
                        onClick={addPackage}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                            padding: '10px', borderRadius: '10px', cursor: 'pointer',
                            border: `1px dashed ${accentColor}40`,
                            background: `${accentColor}08`,
                            color: accentColor, fontFamily: 'inherit', fontSize: '12px', fontWeight: 700,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={14} /> Add Package to Portfolio
                    </button>
                )}
            </div>)}

            {/* ── Parameter Form ─────────────────────────────────────── */}
            <div style={{
                background: '#1a1a25', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '20px',
            }}>

                {/* Optimize search ranges (only in optimize mode) */}
                {!isSim && (
                    <div>
                        <SectionHeader icon={Target} title="Search Ranges" color="#f59e0b" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <FieldLabel icon={DollarSign} label="Price Range (BDT)" color="#f59e0b" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <InputField value={params.price_min} onChange={setNum('price_min')} placeholder="10" suffix="min" accentColor="#f59e0b" disabled={loading} />
                                    <InputField value={params.price_max} onChange={setNum('price_max')} placeholder="500" suffix="max" accentColor="#f59e0b" disabled={loading} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel icon={Wifi} label="Data Range (GB)" color="#f59e0b" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <InputField value={params.data_gb_min} onChange={setNum('data_gb_min')} placeholder="0" suffix="min" accentColor="#f59e0b" disabled={loading} />
                                    <InputField value={params.data_gb_max} onChange={setNum('data_gb_max')} placeholder="20" suffix="max" accentColor="#f59e0b" disabled={loading} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel icon={Phone} label="Voice Range (min)" color="#f59e0b" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <InputField value={params.voice_min_min} onChange={setNum('voice_min_min')} placeholder="0" suffix="min" accentColor="#f59e0b" disabled={loading} />
                                    <InputField value={params.voice_min_max} onChange={setNum('voice_min_max')} placeholder="500" suffix="max" accentColor="#f59e0b" disabled={loading} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel icon={Clock} label="Validity Range (days)" color="#f59e0b" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                    <InputField value={params.validity_min} onChange={setNum('validity_min')} placeholder="1" suffix="min" accentColor="#f59e0b" disabled={loading} />
                                    <InputField value={params.validity_max} onChange={setNum('validity_max')} placeholder="30" suffix="max" accentColor="#f59e0b" disabled={loading} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Market Parameters */}
                <div>
                    <SectionHeader icon={Users} title="Market Parameters" color="#6366f1" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <FieldLabel icon={Users} label="Market Size (N₀)" color="#6366f1" />
                            <InputField value={params.N0} onChange={setNum('N0')} placeholder="10000" min={100} accentColor="#6366f1" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Clock} label="Horizon (T days)" color="#6366f1" />
                            <InputField value={params.T_days} onChange={setNum('T_days')} placeholder="90" min={1} suffix="days" accentColor="#6366f1" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={TrendingUp} label="Discount Rate" color="#6366f1" />
                            <InputField value={params.discount_rate} onChange={setNum('discount_rate')} placeholder="0.01" min={0} max={0.5} step={0.001} accentColor="#6366f1" disabled={loading} />
                        </div>
                    </div>
                </div>

                {/* Network Cost Model */}
                <div>
                    <SectionHeader icon={Wifi} title="Network Cost Model (Operator Expense)" color="#34d399" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
                        <div>
                            <FieldLabel icon={DollarSign} label="3G Cost/GB" color="#34d399" />
                            <InputField value={params.c_gb_3g} onChange={setNum('c_gb_3g')} placeholder="2" min={0} suffix="৳" accentColor="#34d399" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={DollarSign} label="4G Cost/GB" color="#34d399" />
                            <InputField value={params.c_gb_4g} onChange={setNum('c_gb_4g')} placeholder="5" min={0} suffix="৳" accentColor="#34d399" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={DollarSign} label="5G Cost/GB" color="#34d399" />
                            <InputField value={params.c_gb_5g} onChange={setNum('c_gb_5g')} placeholder="10" min={0} suffix="৳" accentColor="#34d399" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Phone} label="Voice Cost/min" color="#34d399" />
                            <InputField value={params.c_min} onChange={setNum('c_min')} placeholder="0.5" min={0} step={0.1} suffix="৳" accentColor="#34d399" disabled={loading} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div>
                            <FieldLabel icon={Hash} label="% Users 3G" color="#34d399" />
                            <InputField value={params.pct_3g} onChange={setNum('pct_3g')} placeholder="0.3" min={0} max={1} step={0.05} accentColor="#34d399" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Hash} label="% Users 4G" color="#34d399" />
                            <InputField value={params.pct_4g} onChange={setNum('pct_4g')} placeholder="0.5" min={0} max={1} step={0.05} accentColor="#34d399" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Hash} label="% Users 5G" color="#34d399" />
                            <InputField value={params.pct_5g} onChange={setNum('pct_5g')} placeholder="0.2" min={0} max={1} step={0.05} accentColor="#34d399" disabled={loading} />
                        </div>
                    </div>
                </div>

                {/* Overage & Renewal */}
                <div style={{ display: 'none' }}>
                    <SectionHeader icon={DollarSign} title="Overage Pricing & Renewal" color="#f97316" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div>
                            <FieldLabel icon={DollarSign} label="Data Overage/GB" color="#f97316" />
                            <InputField value={params.p_over_data} onChange={setNum('p_over_data')} placeholder="15" min={0} suffix="৳" accentColor="#f97316" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={DollarSign} label="Voice Overage/min" color="#f97316" />
                            <InputField value={params.p_over_voice} onChange={setNum('p_over_voice')} placeholder="1.5" min={0} step={0.1} suffix="৳" accentColor="#f97316" disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel icon={Hash} label="Renewal Rate" color="#f97316" />
                            <InputField value={params.base_renewal_rate} onChange={setNum('base_renewal_rate')} placeholder="0.6" min={0} max={1} step={0.05} accentColor="#f97316" disabled={loading || !params.enable_renewal} />
                        </div>
                        <div>
                            <FieldLabel icon={Hash} label="Renewal Decay" color="#f97316" />
                            <InputField value={params.renewal_decay} onChange={setNum('renewal_decay')} placeholder="0.05" min={0} max={1} step={0.01} accentColor="#f97316" disabled={loading || !params.enable_renewal} />
                        </div>
                    </div>
                    <ToggleSwitch value={params.enable_renewal} onChange={set('enable_renewal')} label="Enable Renewal (repeat purchases)" color="#f97316" disabled={loading} />
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
                    <ToggleSwitch value={params.use_mixture} onChange={set('use_mixture')} label="Mixture Lognormal Data Usage" color="#a78bfa" disabled={loading} />
                </div>

                {/* Advanced section */}
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

                        {/* Acquisition Parameters */}
                        <div>
                            <SectionHeader icon={TrendingUp} title="Acquisition Model (Utility Function)" color="#f59e0b" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                <div>
                                    <FieldLabel icon={TrendingUp} label="β_data" color="#f59e0b" />
                                    <InputField value={params.beta_data} onChange={setNum('beta_data')} step={0.01} accentColor="#f59e0b" disabled={loading} />
                                </div>
                                <div>
                                    <FieldLabel icon={TrendingUp} label="β_voice" color="#f59e0b" />
                                    <InputField value={params.beta_voice} onChange={setNum('beta_voice')} step={0.01} accentColor="#f59e0b" disabled={loading} />
                                </div>
                                <div>
                                    <FieldLabel icon={TrendingUp} label="β_price" color="#f59e0b" />
                                    <InputField value={params.beta_price} onChange={setNum('beta_price')} step={0.005} accentColor="#f59e0b" disabled={loading} />
                                </div>
                                <div>
                                    <FieldLabel icon={TrendingUp} label="β_validity" color="#f59e0b" />
                                    <InputField value={params.beta_validity} onChange={setNum('beta_validity')} step={0.01} accentColor="#f59e0b" disabled={loading} />
                                </div>
                                <div>
                                    <FieldLabel icon={Shuffle} label="σ (noise)" color="#f59e0b" />
                                    <InputField value={params.sigma} onChange={setNum('sigma')} step={0.05} accentColor="#f59e0b" disabled={loading} />
                                </div>
                            </div>
                        </div>

                        {/* Voice Usage */}
                        <div>
                            <SectionHeader icon={Phone} title="Voice Usage Distribution" color="#60a5fa" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <FieldLabel icon={Hash} label="μ_voice (log-mean)" color="#60a5fa" />
                                    <InputField value={params.mu_voice} onChange={setNum('mu_voice')} step={0.1} accentColor="#60a5fa" disabled={loading} />
                                </div>
                                <div>
                                    <FieldLabel icon={Hash} label="σ_voice (log-std)" color="#60a5fa" />
                                    <InputField value={params.sigma_voice} onChange={setNum('sigma_voice')} step={0.05} min={0.01} accentColor="#60a5fa" disabled={loading} />
                                </div>
                            </div>
                        </div>

                        {/* Data Usage mixture */}
                        {params.use_mixture && (
                            <div>
                                <SectionHeader icon={Users} title="Data Usage Mixture Model (Light / Medium / Heavy)" color="#60a5fa" />
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

                        {/* BO settings (optimize mode only) */}
                        {!isSim && (
                            <div>
                                <SectionHeader icon={Target} title="Bayesian Optimization Settings" color="#f59e0b" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <FieldLabel icon={Hash} label="BO Iterations" color="#f59e0b" />
                                        <InputField value={params.n_bo_iterations} onChange={setNum('n_bo_iterations')} placeholder="20" min={5} max={100} accentColor="#f59e0b" disabled={loading} />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Initial Random Evals" color="#f59e0b" />
                                        <InputField value={params.n_bo_init} onChange={setNum('n_bo_init')} placeholder="8" min={3} max={30} accentColor="#f59e0b" disabled={loading} />
                                    </div>
                                    <div>
                                        <FieldLabel icon={Hash} label="Portfolio Months" color="#f59e0b" />
                                        <InputField value={params.T_months} onChange={setNum('T_months')} placeholder="3" min={1} max={12} suffix="mo" accentColor="#f59e0b" disabled={loading} />
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
