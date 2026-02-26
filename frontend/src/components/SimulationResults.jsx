import { useState, useMemo } from 'react';
import {
    TrendingUp, DollarSign, Shield, BarChart2, Activity,
    Target, Sliders, AlertTriangle, ChevronDown, ChevronUp,
    Award, Zap, Package, Wifi, Phone, Clock, Users
} from 'lucide-react';

// ─── Color helpers ─────────────────────────────────────────────────────────

const fmt = (n, decimals = 0) =>
    n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const fmtBDT = n => n == null ? '—' : `৳ ${fmt(n)}`;

// ─── Summary Card ────────────────────────────────────────────────────────────

const MetricBadge = ({ label, value, color, large }) => (
    <div style={{
        padding: large ? '16px 20px' : '12px 16px',
        borderRadius: '12px',
        background: `${color}12`,
        border: `1px solid ${color}30`,
        display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
        <div style={{ fontSize: '10.5px', fontWeight: 700, color: `${color}99`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: large ? '22px' : '16px', fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
    </div>
);

// ─── SVG Histogram ───────────────────────────────────────────────────────────

const ProfitHistogram = ({ bins, counts, accentColor, expectedProfit }) => {
    const W = 460, H = 180, pad = { l: 45, r: 10, t: 10, b: 30 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const maxCount = Math.max(...counts, 1);
    const minBin = bins[0];
    const maxBin = bins[bins.length - 1];
    const range = maxBin - minBin || 1;

    const bars = counts.map((count, i) => {
        const x = pad.l + ((bins[i] - minBin) / range) * plotW;
        const w = Math.max(1, ((bins[i + 1] - bins[i]) / range) * plotW - 1);
        const h = (count / maxCount) * plotH;
        const y = pad.t + plotH - h;
        return { x, y, w, h, count };
    });

    const optX = pad.l + ((expectedProfit - minBin) / range) * plotW;

    const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map(f => ({
        y: pad.t + plotH - f * plotH,
        label: fmt(f * maxCount),
    }));

    const xTicks = [0, 0.25, 0.5, 0.75, 1.0].map(f => ({
        x: pad.l + f * plotW,
        label: fmtBDT(minBin + f * range).replace('৳ ', '৳'),
    }));

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            {yTicks.map((t, i) => (
                <line key={i} x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y}
                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {yTicks.map((t, i) => (
                <text key={i} x={pad.l - 6} y={t.y + 4} textAnchor="end"
                    fontSize="8" fill="rgba(255,255,255,0.3)">{t.label}</text>
            ))}
            {bars.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h}
                    fill={`${accentColor}55`} stroke={`${accentColor}80`} strokeWidth="0.5" rx="1" />
            ))}
            {optX >= pad.l && optX <= W - pad.r && (
                <>
                    <line x1={optX} y1={pad.t} x2={optX} y2={pad.t + plotH}
                        stroke={accentColor} strokeWidth="2" strokeDasharray="4 3" />
                    <text x={optX + 4} y={pad.t + 14} fontSize="9" fill={accentColor} fontWeight="700">E[Π]</text>
                </>
            )}
            {xTicks.map((t, i) => (
                <text key={i} x={t.x} y={H - 5} textAnchor="middle"
                    fontSize="8" fill="rgba(255,255,255,0.3)">{t.label}</text>
            ))}
        </svg>
    );
};

// ─── SVG Convergence Chart ────────────────────────────────────────────────────

const ConvergenceChart = ({ data, accentColor }) => {
    const W = 460, H = 160, pad = { l: 50, r: 10, t: 10, b: 28 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const N = data.length;
    if (!N) return null;

    const minV = Math.min(...data);
    const maxV = Math.max(...data);
    const range = maxV - minV || 1;

    const pts = data.map((v, i) => ({
        x: pad.l + (i / (N - 1)) * plotW,
        y: pad.t + plotH - ((v - minV) / range) * plotH,
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${pad.t + plotH} L ${pts[0].x} ${pad.t + plotH} Z`;

    const yTicks = [0, 0.5, 1.0].map(f => ({
        y: pad.t + plotH - f * plotH,
        label: fmtBDT(minV + f * range).replace('৳ ', '৳'),
    }));

    const xTicks = [0, 0.25, 0.5, 0.75, 1.0].map(f => ({
        x: pad.l + f * plotW,
        label: fmt(Math.round(f * N)),
    }));

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            <defs>
                <linearGradient id="cvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {yTicks.map((t, i) => (
                <line key={i} x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y}
                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {yTicks.map((t, i) => (
                <text key={i} x={pad.l - 6} y={t.y + 4} textAnchor="end"
                    fontSize="8" fill="rgba(255,255,255,0.3)">{t.label}</text>
            ))}
            <path d={areaD} fill="url(#cvGrad)" />
            <path d={pathD} fill="none" stroke={accentColor} strokeWidth="1.5" />
            {xTicks.map((t, i) => (
                <text key={i} x={t.x} y={H - 5} textAnchor="middle"
                    fontSize="8" fill="rgba(255,255,255,0.3)">{t.label}</text>
            ))}
        </svg>
    );
};

// ─── Sensitivity Bar Chart ────────────────────────────────────────────────────

const SensitivityChart = ({ items, accentColor }) => {
    if (!items?.length) return null;
    const maxAbs = Math.max(...items.map(s => s.abs_gradient), 1);
    const labels = {
        price: 'Price', data_gb: 'Data (GB)', voice_min: 'Voice (min)',
        validity_days: 'Validity (days)',
        beta_data: 'β_data', beta_voice: 'β_voice',
        beta_price: 'β_price', beta_validity: 'β_validity',
        c_gb_3g: 'Cost 3G/GB', c_gb_4g: 'Cost 4G/GB', c_gb_5g: 'Cost 5G/GB',
        c_min: 'Cost/min', base_renewal_rate: 'Renewal Rate',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {items.map((s, i) => {
                const pct = (s.abs_gradient / maxAbs) * 100;
                const isPos = s.gradient >= 0;
                const col = isPos ? '#34d399' : '#f87171';
                return (
                    <div key={s.parameter} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '120px', textAlign: 'right', fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: 500, flexShrink: 0 }}>
                            {labels[s.parameter] || s.parameter}
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '20px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute', left: 0, top: 0, height: '100%',
                                width: `${pct}%`,
                                background: `${col}50`, borderRadius: '4px',
                                transition: 'width 0.5s ease',
                            }} />
                            <div style={{
                                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                fontSize: '10px', fontWeight: 700, color: col,
                            }}>
                                {fmt(s.gradient, 0)} {isPos ? '▲' : '▼'}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Period Profit Chart ─────────────────────────────────────────────────────

const PeriodChart = ({ periods, accentColor }) => {
    if (!periods?.length) return null;
    const W = 460, H = 140, pad = { l: 50, r: 10, t: 10, b: 30 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const profits = periods.map(p => p.profit);
    const minV = Math.min(...profits, 0);
    const maxV = Math.max(...profits, 1);
    const range = maxV - minV || 1;
    const N = periods.length;
    const barW = Math.max(4, plotW / N - 2);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            {[0, 0.5, 1.0].map((f, i) => {
                const y = pad.t + plotH - f * plotH;
                return (
                    <g key={i}>
                        <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.3)">
                            {fmtBDT(minV + f * range).replace('৳ ', '৳')}
                        </text>
                    </g>
                );
            })}
            {periods.map((p, i) => {
                const x = pad.l + i * (plotW / N) + 1;
                const h = Math.max(1, ((p.profit - minV) / range) * plotH);
                const y = pad.t + plotH - h;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barW} height={h}
                            fill={`${accentColor}55`} stroke={`${accentColor}90`} strokeWidth="0.5" rx="2" />
                        <text x={x + barW / 2} y={H - 5} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">
                            P{p.period}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// ─── User Retention Chart ────────────────────────────────────────────────────

const RetentionChart = ({ periods, accentColor }) => {
    if (!periods?.length || periods.length < 2) return null;
    const W = 460, H = 140, pad = { l: 50, r: 10, t: 10, b: 28 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const users = periods.map(p => p.active_users);
    const maxUsers = Math.max(...users, 1);

    const pts = users.map((u, i) => ({
        x: pad.l + (i / (users.length - 1 || 1)) * plotW,
        y: pad.t + plotH - (u / maxUsers) * plotH,
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            {[0, 0.5, 1.0].map((f, i) => (
                <g key={i}>
                    <line x1={pad.l} y1={pad.t + (1 - f) * plotH} x2={W - pad.r} y2={pad.t + (1 - f) * plotH}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <text x={pad.l - 6} y={pad.t + (1 - f) * plotH + 4} textAnchor="end"
                        fontSize="8" fill="rgba(255,255,255,0.3)">{fmt(f * maxUsers)}</text>
                </g>
            ))}
            <path d={pathD} fill="none" stroke={accentColor} strokeWidth="2" />
            {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={accentColor} stroke="#1a1a25" strokeWidth="1.5" />
            ))}
            {periods.map((pp, i) => (
                <text key={i} x={pts[i].x} y={H - 5} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">
                    P{pp.period}
                </text>
            ))}
        </svg>
    );
};

// ─── BO Scatter Plot ─────────────────────────────────────────────────────────

const BOScatterPlot = ({ evaluations, optPkg, accentColor }) => {
    if (!evaluations?.length) return null;
    const W = 460, H = 220, pad = { l: 50, r: 15, t: 10, b: 35 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const prices = evaluations.map(e => e.price);
    const dataGbs = evaluations.map(e => e.data_gb);
    const profits = evaluations.map(e => e.expected_profit);

    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const minD = Math.min(...dataGbs), maxD = Math.max(...dataGbs);
    const minPr = Math.min(...profits), maxPr = Math.max(...profits, minPr + 1);

    const pts = evaluations.map(e => ({
        cx: pad.l + ((e.price - minP) / (maxP - minP || 1)) * plotW,
        cy: pad.t + plotH - ((e.data_gb - minD) / (maxD - minD || 1)) * plotH,
        intensity: (e.expected_profit - minPr) / (maxPr - minPr || 1),
    }));

    const optCx = optPkg ? pad.l + ((optPkg.price - minP) / (maxP - minP || 1)) * plotW : 0;
    const optCy = optPkg ? pad.t + plotH - ((optPkg.data_gb - minD) / (maxD - minD || 1)) * plotH : 0;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            {[0, 0.5, 1.0].map((f, i) => (
                <line key={i} x1={pad.l} y1={pad.t + f * plotH} x2={W - pad.r} y2={pad.t + f * plotH}
                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            ))}
            {[0, 0.5, 1.0].map((f, i) => (
                <text key={i} x={pad.l - 6} y={pad.t + (1 - f) * plotH + 4} textAnchor="end"
                    fontSize="8" fill="rgba(255,255,255,0.3)">{fmt(minD + f * (maxD - minD), 1)} GB</text>
            ))}
            {[0, 0.5, 1.0].map((f, i) => (
                <text key={i} x={pad.l + f * plotW} y={H - 5} textAnchor="middle"
                    fontSize="8" fill="rgba(255,255,255,0.3)">৳{fmt(minP + f * (maxP - minP))}</text>
            ))}
            <text x={W / 2} y={H} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontWeight="700">Price (BDT)</text>
            <text x={10} y={pad.t + plotH / 2} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontWeight="700"
                transform={`rotate(-90, 10, ${pad.t + plotH / 2})`}>Data (GB)</text>
            {pts.map((p, i) => (
                <circle key={i} cx={p.cx} cy={p.cy} r="5"
                    fill={`rgba(99,102,241,${0.3 + 0.7 * p.intensity})`}
                    stroke="rgba(99,102,241,0.6)" strokeWidth="0.8" />
            ))}
            {optPkg && (
                <>
                    <circle cx={optCx} cy={optCy} r="9" fill="none" stroke={accentColor} strokeWidth="2.5" />
                    <circle cx={optCx} cy={optCy} r="4.5" fill={accentColor} />
                    <text x={optCx + 12} y={optCy - 4} fontSize="9" fill={accentColor} fontWeight="700">Optimal</text>
                </>
            )}
        </svg>
    );
};

// ─── Panel wrapper ────────────────────────────────────────────────────────────

const Panel = ({ title, icon: Icon, children, color = 'rgba(255,255,255,0.1)', collapsible = false }) => {
    const [open, setOpen] = useState(true);
    return (
        <div style={{
            background: '#1a1a25', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', overflow: 'hidden',
        }}>
            <div
                onClick={() => collapsible && setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '15px 20px',
                    borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    cursor: collapsible ? 'pointer' : 'default',
                    background: `${color}08`,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <Icon size={15} style={{ color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{title}</span>
                </div>
                {collapsible && (open ? <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />)}
            </div>
            {open && <div style={{ padding: '18px 20px' }}>{children}</div>}
        </div>
    );
};

// ─── Risk slider ───────────────────────────────────────────────────────────────

const RiskPanel = ({ expectedProfit, variance, std, initialLambda, color }) => {
    const [lambda, setLambda] = useState(initialLambda || 0.5);
    const riskAdj = expectedProfit - lambda * std;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <MetricBadge label="E[Π] Expected Profit" value={fmtBDT(Math.round(expectedProfit))} color={color} />
                <MetricBadge label="Std(Π) Std Dev" value={fmtBDT(Math.round(std))} color="#f59e0b" />
                <MetricBadge label="Risk-Adjusted Profit" value={fmtBDT(Math.round(riskAdj))} color={riskAdj >= 0 ? '#34d399' : '#f87171'} />
            </div>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Risk Aversion λ</span>
                    <span style={{ fontSize: '12px', color, fontWeight: 700 }}>{lambda.toFixed(2)}</span>
                </div>
                <input
                    type="range" min={0} max={2} step={0.05} value={lambda}
                    onChange={e => setLambda(Number(e.target.value))}
                    style={{ width: '100%', accentColor: color }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Risk-neutral (0)</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Risk-averse (2)</span>
                </div>
                <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Formula</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
                        RAP = E[Π] − λ·Std(Π) = {fmtBDT(Math.round(expectedProfit))} − {lambda.toFixed(2)}·{fmtBDT(Math.round(std))} = <span style={{ color, fontWeight: 700 }}>{fmtBDT(Math.round(riskAdj))}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Offer Comparison Table ──────────────────────────────────────────────────

const OfferTable = ({ offers, accentColor }) => {
    if (!offers?.length) return null;
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {['Tier', 'Data', 'Voice', 'Validity', 'Price', 'E[Π]', 'Risk-Adj', 'CI'].map((h, i) => (
                            <th key={i} style={{ padding: '8px 10px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {offers.map((o, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: i === 0 ? accentColor : 'rgba(255,255,255,0.7)' }}>
                                {i === 0 && '🏆 '}{o.label}
                            </td>
                            <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.6)' }}>{o.data_gb} GB</td>
                            <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.6)' }}>{o.voice_min} min</td>
                            <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.6)' }}>{o.validity_days}d</td>
                            <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.6)' }}>৳{fmt(o.price)}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: o.expected_profit >= 0 ? '#34d399' : '#f87171' }}>{fmtBDT(Math.round(o.expected_profit))}</td>
                            <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.5)' }}>{fmtBDT(Math.round(o.risk_adjusted_profit))}</td>
                            <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>[{fmtBDT(Math.round(o.ci_lower))}, {fmtBDT(Math.round(o.ci_upper))}]</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SimulationResults = ({ result, accentColor = '#22c55e' }) => {
    if (!result) return null;

    const { type, data } = result;
    const simData = type === 'optimize' ? data.simulation_result : data;
    const isOptimized = type === 'optimize';
    const pkg = simData.package || {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeInUp 0.4s ease' }}>

            {/* ── Results banner ───────────────────────────────────── */}
            <div style={{
                padding: '20px 24px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${accentColor}18 0%, rgba(99,102,241,0.1) 100%)`,
                border: `1px solid ${accentColor}35`,
                display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${accentColor}25`, border: `1px solid ${accentColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isOptimized ? <Award size={20} style={{ color: accentColor }} /> : <Activity size={20} style={{ color: accentColor }} />}
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                                {isOptimized ? 'Bayesian Optimization Complete' : 'Monte Carlo Simulation Complete'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                                {isOptimized
                                    ? `${data.bo_evaluations?.length || 0} evaluations · Optimal package found`
                                    : `${simData.n_simulations_run} simulations · Seed ${simData.seed_used} · ${simData.total_periods} periods`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package summary */}
                <div style={{
                    display: 'flex', gap: '10px', flexWrap: 'wrap',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={14} style={{ color: accentColor }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{pkg.label || 'Package'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        {pkg.data_gb > 0 && (
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Wifi size={11} /> {pkg.data_gb} GB
                            </span>
                        )}
                        {pkg.voice_min > 0 && (
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={11} /> {pkg.voice_min} min
                            </span>
                        )}
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {pkg.validity_days} days
                        </span>
                        <span style={{ fontSize: '12px', color: accentColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={11} /> ৳{pkg.price}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <MetricBadge
                        label="Expected Profit"
                        value={fmtBDT(Math.round(simData.expected_profit))}
                        color="#34d399" large
                    />
                    <MetricBadge
                        label="Risk-Adj Profit"
                        value={fmtBDT(Math.round(simData.risk_adjusted_profit))}
                        color={simData.risk_adjusted_profit >= 0 ? '#6366f1' : '#f87171'} large
                    />
                    <MetricBadge
                        label="Simulations"
                        value={fmt(simData.n_simulations_run)}
                        color="rgba(255,255,255,0.5)"
                    />
                </div>
            </div>

            {/* ── Stats Row ────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                    { label: '95% CI Lower', value: fmtBDT(Math.round(simData.confidence_interval?.lower)), color: '#60a5fa' },
                    { label: '95% CI Upper', value: fmtBDT(Math.round(simData.confidence_interval?.upper)), color: '#60a5fa' },
                    { label: 'Std Dev', value: fmtBDT(Math.round(simData.std)), color: '#f59e0b' },
                    { label: 'Total Periods', value: simData.total_periods, color: '#a78bfa' },
                ].map((m, i) => <MetricBadge key={i} {...m} />)}
            </div>

            {/* ── Profit Distribution Histogram ────────────────────── */}
            <Panel title="Profit Distribution" icon={BarChart2} color={accentColor} collapsible>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    Frequency distribution of total discounted profit across {simData.n_simulations_run} simulations. Dashed line = E[Π].
                </div>
                <ProfitHistogram
                    bins={simData.profit_hist_bins || []}
                    counts={simData.profit_hist_counts || []}
                    accentColor={accentColor}
                    expectedProfit={simData.expected_profit}
                />
            </Panel>

            {/* ── Convergence Curve ─────────────────────────────────── */}
            <Panel title="MC Convergence Curve" icon={Activity} color="#6366f1" collapsible>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    Running mean of E[Π] as simulations increase. Should stabilize.
                </div>
                <ConvergenceChart data={simData.convergence_data || []} accentColor="#6366f1" />
            </Panel>

            {/* ── Period Breakdown + Retention ─────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Panel title="Profit per Period" icon={DollarSign} color={accentColor}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                        Average profit per validity period (renewal cycle)
                    </div>
                    <PeriodChart periods={simData.period_profits || []} accentColor={accentColor} />
                </Panel>
                <Panel title="User Retention" icon={Users} color="#60a5fa">
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>
                        Active users across renewal cycles
                    </div>
                    <RetentionChart periods={simData.period_profits || []} accentColor="#60a5fa" />
                </Panel>
            </div>

            {/* ── Offer Comparison ──────────────────────────────────── */}
            {simData.offers?.length > 0 && (
                <Panel title="Multi-Tier Offer Comparison" icon={Target} color="#f59e0b" collapsible>
                    <div style={{ marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                        Auto-generated offer tiers around your package. Sorted by expected profit.
                    </div>
                    <OfferTable offers={simData.offers} accentColor={accentColor} />
                </Panel>
            )}

            {/* ── Sensitivity Analysis ──────────────────────────────── */}
            <Panel title="Sensitivity Analysis (∂E[Π]/∂θ)" icon={Sliders} color="#f59e0b" collapsible>
                <div style={{ marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    How each parameter affects profit.
                    <span style={{ color: '#34d399' }}> ▲ positive</span> = increases profit;
                    <span style={{ color: '#f87171' }}> ▼ negative</span> = decreases profit.
                </div>
                <SensitivityChart items={simData.sensitivity || []} accentColor="#f59e0b" />
            </Panel>

            {/* ── Risk Metrics ──────────────────────────────────────── */}
            <Panel title="Risk Metrics & Risk-Adjusted Profit" icon={Shield} color="#a78bfa">
                <RiskPanel
                    expectedProfit={simData.expected_profit}
                    variance={simData.variance}
                    std={simData.std}
                    initialLambda={0.5}
                    color="#a78bfa"
                />
            </Panel>

            {/* ── Bayesian Optimization Results ─────────────────────── */}
            {isOptimized && (
                <>
                    <Panel title="Bayesian Optimization Convergence" icon={Zap} color={accentColor} collapsible>
                        <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                            Best-found E[Π] at each evaluation. Shows the optimizer learning.
                        </div>
                        <ConvergenceChart data={data.bo_convergence || []} accentColor={accentColor} />
                    </Panel>
                    <Panel title="BO Evaluation Scatter (Price × Data)" icon={Target} color="#6366f1" collapsible>
                        <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                            Each point is an evaluated (price, data_gb) pair. Intensity = relative profit. <span style={{ color: accentColor }}>★ = optimal</span>.
                        </div>
                        <BOScatterPlot
                            evaluations={data.bo_evaluations || []}
                            optPkg={data.optimal_package}
                            accentColor={accentColor}
                        />
                    </Panel>
                </>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SimulationResults;
