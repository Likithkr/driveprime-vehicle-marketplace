import { useState, useMemo } from 'react';
import { FiDollarSign, FiInfo } from 'react-icons/fi';

function calcEMI(principal, ratePercent, months) {
    if (!principal || !ratePercent || !months) return 0;
    const r = ratePercent / 12 / 100;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const TENURES = [12, 24, 36, 48, 60, 72, 84];

export default function EMICalculator({ defaultPrice = 0 }) {
    const [loanAmount, setLoanAmount] = useState(Math.round(defaultPrice * 0.8));
    const [rate, setRate] = useState(9.5);
    const [tenure, setTenure] = useState(48);

    const emi = useMemo(() => calcEMI(loanAmount, rate, tenure), [loanAmount, rate, tenure]);
    const totalPayable = emi * tenure;
    const totalInterest = totalPayable - loanAmount;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            color: '#fff',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <FiDollarSign size={22} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>EMI Calculator</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Loan Amount */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                        <label>Loan Amount</label>
                        <span style={{ fontWeight: 700 }}>₹{Number(loanAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <input type="range" min={50000} max={10000000} step={10000}
                        value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))}
                        style={{ background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.75, marginTop: '4px' }}>
                        <span>₹50K</span><span>₹1 Cr</span>
                    </div>
                </div>

                {/* Interest Rate */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                        <label>Interest Rate (p.a.)</label>
                        <span style={{ fontWeight: 700 }}>{rate}%</span>
                    </div>
                    <input type="range" min={5} max={20} step={0.1}
                        value={rate} onChange={e => setRate(Number(e.target.value))}
                        style={{ background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.75, marginTop: '4px' }}>
                        <span>5%</span><span>20%</span>
                    </div>
                </div>

                {/* Tenure */}
                <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '10px' }}>Loan Tenure</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {TENURES.map(t => (
                            <button key={t} onClick={() => setTenure(t)}
                                style={{
                                    padding: '6px 14px', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 600,
                                    background: tenure === t ? '#fff' : 'rgba(255,255,255,0.2)',
                                    color: tenure === t ? 'var(--primary)' : '#fff',
                                    border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                                }}>
                                {t}M
                            </button>
                        ))}
                    </div>
                </div>

                {/* Result */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                    textAlign: 'center',
                    backdropFilter: 'blur(8px)',
                }}>
                    <p style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '4px' }}>Monthly EMI</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900 }}>
                        ₹{Math.round(emi).toLocaleString('en-IN')}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '0.8rem', opacity: 0.85 }}>
                        <span>Total: ₹{Math.round(totalPayable).toLocaleString('en-IN')}</span>
                        <span>Interest: ₹{Math.round(totalInterest).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '16px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <FiInfo size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                EMI is indicative. Actual loan amount and interest depends on the lender.
            </p>
        </div>
    );
}
