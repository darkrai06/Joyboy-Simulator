import { useState } from 'react';
import {
    Play, RotateCcw, ChevronDown, Clock, Wifi, DollarSign,
    Calendar, Radio, Sliders, Plus, Trash2, X,
    CheckCircle2, Package
} from 'lucide-react';

/* ─── Reusable field parts ───────────────────────────── */
const FieldLabel = ({ icon: Icon, label, required, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
        <Icon size={13} style={{ color: color || 'rgba(255,255,255,0.4)' }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {label}
        </span>
        {required && <span style={{ color: '#ef4444', fontSize: '10px' }}>*</span>}
    </div>
);

const InputField = ({ value, onChange, type = 'number', placeholder, min, suffix, accentColor }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused ? accentColor + '60' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: '10px',
                    padding: suffix ? '10px 46px 10px 12px' : '10px 12px',
                    fontSize: '14px', fontWeight: 500, color: '#fff',
                    outline: 'none', fontFamily: 'inherit',
                    boxShadow: focused ? `0 0 0 3px ${accentColor}18` : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
            />
            {suffix && (
                <span style={{
                    position: 'absolute', right: '12px',
                    fontSize: '11px', fontWeight: 700,
                    color: focused ? accentColor : 'rgba(255,255,255,0.3)',
                    pointerEvents: 'none', transition: 'color 0.2s',
                }}>{suffix}</span>
            )}
        </div>
    );
};

const SelectField = ({ value, onChange, options, accentColor }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%', appearance: 'none', WebkitAppearance: 'none',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused ? accentColor + '60' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: '10px', padding: '10px 36px 10px 12px',
                    fontSize: '14px', fontWeight: 500, color: '#fff',
                    outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: focused ? `0 0 0 3px ${accentColor}18` : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
            >
                {options.map(o => <option key={o.value} value={o.value} style={{ background: '#1a1a25', color: '#fff' }}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
        </div>
    );
};

const ToggleSwitch = ({ value, onChange, label, color }) => (
    <button
        onClick={() => onChange(!value)}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
            border: `1px solid ${value ? color + '50' : 'rgba(255,255,255,0.09)'}`,
            background: value ? `${color}15` : 'rgba(255,255,255,0.03)',
            fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
            color: value ? color : 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s',
        }}
    >
        <div style={{
            width: '30px', height: '17px', borderRadius: '9px',
            background: value ? color : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
            <div style={{
                position: 'absolute', top: '2.5px',
                left: value ? '15px' : '2.5px',
                width: '12px', height: '12px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
        </div>
        {label}
    </button>
);

/* ─── Empty form state ───────────────────────────────── */
const emptyEntry = () => ({
    packageType: 'internet',
    minutes: '',
    data: '',
    dataUnit: 'GB',
    price: '',
    validity: '',
    validityUnit: 'days',
    autoRenew: false,
    roamingEnabled: false,
});

/* ─── Entry card (saved dataset) ────────────────────── */
const EntryCard = ({ entry, index, accentColor, onDelete }) => {
    const pkgLabels = { internet: 'Internet', voice: 'Voice', combo: 'Combo', sms: 'SMS' };
    const showVoice = entry.packageType === 'voice' || entry.packageType === 'combo';
    const showData = entry.packageType === 'internet' || entry.packageType === 'combo';

    const pills = [
        { label: pkgLabels[entry.packageType], always: true },
        showVoice && entry.minutes && { label: `${entry.minutes} min` },
        showData && entry.data && { label: `${entry.data} ${entry.dataUnit}` },
        entry.price && { label: `৳ ${entry.price}` },
        entry.validity && { label: `${entry.validity} ${entry.validityUnit}` },
        entry.autoRenew && { label: 'Auto-Renew' },
        entry.roamingEnabled && { label: 'Roaming' },
    ].filter(Boolean);

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${accentColor}30`,
            borderRadius: '12px', padding: '14px 16px',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            animation: 'fadeInUp 0.25s ease',
        }}>
            {/* Index badge */}
            <div style={{
                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                background: `${accentColor}20`, border: `1px solid ${accentColor}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, color: accentColor,
            }}>{index + 1}</div>

            {/* Pills */}
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pills.map((p, i) => (
                    <span key={i} style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        background: i === 0 ? `${accentColor}22` : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${i === 0 ? accentColor + '40' : 'rgba(255,255,255,0.09)'}`,
                        color: i === 0 ? accentColor : 'rgba(255,255,255,0.65)',
                    }}>{p.label}</span>
                ))}
            </div>

            {/* Delete */}
            <button
                onClick={() => onDelete(index)}
                style={{
                    flexShrink: 0, background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '8px', padding: '5px',
                    cursor: 'pointer', color: '#f87171',
                    display: 'flex', alignItems: 'center',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

/* ─── Input form for one entry ───────────────────────── */
const EntryForm = ({ form, setForm, accentColor, onSave, onCancel, isFirst }) => {
    const set = key => val => setForm(f => ({ ...f, [key]: val }));
    const showVoice = form.packageType === 'voice' || form.packageType === 'combo';
    const showData = form.packageType === 'internet' || form.packageType === 'combo';

    const packageTypes = [
        { value: 'internet', label: 'Internet' },
        { value: 'voice', label: 'Voice' },
        { value: 'combo', label: 'Combo' },
        { value: 'sms', label: 'SMS' },
    ];


    return (
        <div style={{
            background: '#1a1a25',
            border: `1px solid ${accentColor}40`,
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: `0 0 30px ${accentColor}10`,
            animation: 'fadeInUp 0.25s ease',
        }}>
            {/* Form header */}
            <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: `${accentColor}0c`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={15} style={{ color: accentColor }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                        New Dataset Entry
                    </span>
                </div>
                {!isFirst && (
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', display: 'flex', padding: '2px' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Package Type */}
                <div>
                    <FieldLabel icon={Radio} label="Package Type" required color={accentColor} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {packageTypes.map(pt => (
                            <button
                                key={pt.value}
                                onClick={() => set('packageType')(pt.value)}
                                style={{
                                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                    border: `1px solid ${form.packageType === pt.value ? accentColor + '60' : 'rgba(255,255,255,0.09)'}`,
                                    background: form.packageType === pt.value ? accentColor + '22' : 'rgba(255,255,255,0.03)',
                                    color: form.packageType === pt.value ? accentColor : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                                }}
                            >{pt.label}</button>
                        ))}
                    </div>
                </div>

                {/* Minutes / Data */}
                <div style={{ display: 'grid', gridTemplateColumns: showVoice && showData ? '1fr 1fr' : '1fr', gap: '14px' }}>
                    {showVoice && (
                        <div>
                            <FieldLabel icon={Clock} label="Minutes" required color={accentColor} />
                            <InputField value={form.minutes} onChange={set('minutes')} placeholder="e.g. 300" min={1} suffix="min" accentColor={accentColor} />
                        </div>
                    )}
                    {showData && (
                        <div>
                            <FieldLabel icon={Wifi} label="Data" required color={accentColor} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px' }}>
                                <InputField value={form.data} onChange={set('data')} placeholder="e.g. 10" min={0.1} accentColor={accentColor} />
                                <SelectField value={form.dataUnit} onChange={set('dataUnit')} options={[{ value: 'MB', label: 'MB' }, { value: 'GB', label: 'GB' }]} accentColor={accentColor} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Price / Validity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                        <FieldLabel icon={DollarSign} label="Price (BDT)" required color={accentColor} />
                        <InputField value={form.price} onChange={set('price')} placeholder="e.g. 149" min={1} suffix="৳" accentColor={accentColor} />
                    </div>
                    <div>
                        <FieldLabel icon={Calendar} label="Validity" required color={accentColor} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '8px' }}>
                            <InputField value={form.validity} onChange={set('validity')} placeholder="e.g. 30" min={1} accentColor={accentColor} />
                            <SelectField value={form.validityUnit} onChange={set('validityUnit')} options={[{ value: 'hours', label: 'Hrs' }, { value: 'days', label: 'Days' }, { value: 'months', label: 'Months' }]} accentColor={accentColor} />
                        </div>
                    </div>
                </div>



                {/* Toggles */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <ToggleSwitch value={form.autoRenew} onChange={set('autoRenew')} label="Auto-Renew" color={accentColor} />
                    <ToggleSwitch value={form.roamingEnabled} onChange={set('roamingEnabled')} label="Roaming Enabled" color={accentColor} />
                </div>

                {/* Save entry button */}
                <button
                    onClick={onSave}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '11px', borderRadius: '10px', cursor: 'pointer',
                        border: `1px solid ${accentColor}50`,
                        background: `${accentColor}20`,
                        color: accentColor, fontFamily: 'inherit', fontSize: '13px', fontWeight: 700,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}35`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${accentColor}20`; }}
                >
                    <CheckCircle2 size={15} />
                    Save Entry
                </button>
            </div>
        </div>
    );
};

/* ══ MAIN ════════════════════════════════════════════════ */
const SimulatorPanel = ({ operatorName, accentColor = '#22c55e' }) => {
    const [entries, setEntries] = useState([]);
    const [showForm, setShowForm] = useState(true);
    const [formData, setFormData] = useState(emptyEntry());
    const [simRunning, setSimRunning] = useState(false);
    const [hoverStart, setHoverStart] = useState(false);
    const [hoverAdd, setHoverAdd] = useState(false);
    const [hoverReset, setHoverReset] = useState(false);

    const handleSaveEntry = () => {
        setEntries(prev => [...prev, { ...formData }]);
        setFormData(emptyEntry());
        setShowForm(false);       // hide form after saving; user clicks "Add More" to get it back
    };

    const handleDeleteEntry = (idx) => {
        setEntries(prev => prev.filter((_, i) => i !== idx));
    };

    const handleReset = () => {
        setEntries([]);
        setFormData(emptyEntry());
        setShowForm(true);
        setSimRunning(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Panel header ─────────────────────────── */}
            <div style={{
                background: '#1a1a25',
                border: `1px solid ${simRunning ? accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '16px', padding: '18px 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'border-color 0.3s',
                boxShadow: simRunning ? `0 0 40px ${accentColor}12` : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: `${accentColor}20`, border: `1px solid ${accentColor}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sliders size={18} style={{ color: accentColor }} />
                    </div>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Simulation Panel</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
                            {entries.length === 0
                                ? 'Fill in at least one dataset to begin'
                                : `${entries.length} dataset${entries.length > 1 ? 's' : ''} configured`}
                        </div>
                    </div>
                </div>

                {simRunning && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>Running</span>
                    </div>
                )}
            </div>

            {/* ── Saved entries list ───────────────────── */}
            {entries.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '2px' }}>
                        Datasets ({entries.length})
                    </div>
                    {entries.map((entry, i) => (
                        <EntryCard key={i} entry={entry} index={i} accentColor={accentColor} onDelete={handleDeleteEntry} />
                    ))}
                </div>
            )}

            {/* ── Entry form ───────────────────────────── */}
            {showForm && (
                <EntryForm
                    form={formData}
                    setForm={setFormData}
                    accentColor={accentColor}
                    onSave={handleSaveEntry}
                    onCancel={() => setShowForm(false)}
                    isFirst={entries.length === 0}
                />
            )}

            {/* ── Add More button (shown when form is hidden and entries exist) ── */}
            {!showForm && (
                <button
                    onClick={() => { setFormData(emptyEntry()); setShowForm(true); }}
                    onMouseEnter={() => setHoverAdd(true)}
                    onMouseLeave={() => setHoverAdd(false)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '12px', borderRadius: '12px', cursor: 'pointer',
                        border: `1px dashed ${hoverAdd ? accentColor + '80' : 'rgba(255,255,255,0.15)'}`,
                        background: hoverAdd ? `${accentColor}0d` : 'transparent',
                        color: hoverAdd ? accentColor : 'rgba(255,255,255,0.4)',
                        fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
                        transition: 'all 0.2s',
                    }}
                >
                    <Plus size={16} />
                    Add More Dataset
                </button>
            )}

            {/* ── Action bar ───────────────────────────── */}
            {entries.length > 0 && (
                <div style={{
                    background: '#1a1a25',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', padding: '16px 20px',
                    display: 'flex', gap: '12px',
                }}>
                    {/* Start / Stop */}
                    <button
                        onClick={() => setSimRunning(r => !r)}
                        onMouseEnter={() => setHoverStart(true)}
                        onMouseLeave={() => setHoverStart(false)}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', border: 'none',
                            fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: '#fff',
                            background: simRunning
                                ? (hoverStart ? '#7f1d1d' : '#991b1b')
                                : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                            boxShadow: simRunning ? '0 4px 20px rgba(239,68,68,0.25)' : `0 4px 20px ${accentColor}40`,
                            transform: hoverStart ? 'translateY(-1px)' : 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {simRunning ? <X size={16} /> : <Play size={16} />}
                        {simRunning ? 'Stop Simulation' : `Run Simulation (${entries.length} dataset${entries.length > 1 ? 's' : ''})`}
                    </button>

                    {/* Reset */}
                    <button
                        onClick={handleReset}
                        onMouseEnter={() => setHoverReset(true)}
                        onMouseLeave={() => setHoverReset(false)}
                        style={{
                            padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.09)',
                            background: hoverReset ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                            color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                        }}
                    >
                        <RotateCcw size={15} />
                        Reset All
                    </button>
                </div>
            )}
        </div>
    );
};

export default SimulatorPanel;
