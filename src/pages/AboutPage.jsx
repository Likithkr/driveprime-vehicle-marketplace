import { FiMapPin, FiPhone, FiMail, FiCheckCircle, FiUsers, FiStar, FiAward } from 'react-icons/fi';
import { INDIA_STATES } from '../data/mockData';

const TEAM = [
    { name: 'Rahul Sharma', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Priya Nair', role: 'Head of Operations', emoji: '👩‍💻' },
    { name: 'Arjun Mehta', role: 'Customer Success', emoji: '👨‍💼' },
];

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#fff', padding: '100px 0 80px', textAlign: 'center',
            }}>
                <div className="container">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fbbf24', padding: '6px 16px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
                        🇮🇳 Made for India
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '20px' }}>
                        About <span style={{ color: 'var(--primary)' }}>Drive Prime</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                        Based in Kochi, operating across India — the most trusted marketplace for buying and selling pre-owned cars and bikes.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="section-pad">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                        <div>
                            <h2 className="section-title" style={{ marginBottom: '16px' }}>Our Mission</h2>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '24px' }}>
                                At Drive Prime, we believe buying a used car should be simple, transparent, and trustworthy. We've built a platform where every listing is verified, every seller is genuine, and every buyer gets the best deal.
                            </p>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '28px' }}>
                                Founded in Kochi, we've helped Indians find their perfect vehicle — from the latest Tata Nexon EV to the classic Royal Enfield Bullet.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['Zero fraud. 100% verified listings', 'Dedicated support team', 'RC transfer & insurance help'].map(item => (
                                    <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <FiCheckCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                        <span style={{ fontWeight: 500 }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {[
                                { icon: '🚗', value: '100+', label: 'Cars Listed' },
                                { icon: '🏍️', value: '200+', label: 'Bikes Listed' },
                                { icon: '👥', value: '1000+', label: 'Happy Buyers' },
                            ].map(({ icon, value, label }) => (
                                <div key={label} style={{
                                    background: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px',
                                    border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow)',
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{icon}</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{value}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* India Coverage */}
            <section className="section-pad" style={{ background: 'var(--bg-dark)' }}>
                <div className="container">
                    <div className="section-header text-center" style={{ marginBottom: '40px' }}>
                        <h2 className="section-title" style={{ color: '#fff' }}>Pan-India Coverage</h2>
                        <p className="section-subtitle">We operate across all states and 500+ cities</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                        {Object.entries(INDIA_STATES).map(([state, cities]) => (
                            <div key={state} style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius)',
                                padding: '16px',
                            }}>
                                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    <FiMapPin size={13} style={{ color: 'var(--primary)', marginRight: '6px' }} />
                                    {state}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                                    {cities.join(' • ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="section-pad">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">Meet the Team</h2>
                        <p className="section-subtitle">Passionate people building the future of car buying in India</p>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {TEAM.map(({ name, role, emoji }) => (
                            <div key={name} style={{
                                background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                                padding: '32px 24px', textAlign: 'center', width: '200px', boxShadow: 'var(--shadow)',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{emoji}</div>
                                <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>{name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Info */}
            <section className="section-pad" style={{ background: 'var(--primary)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
                    {[
                        { icon: <FiMapPin size={24} />, label: 'Address', value: 'Marine Drive, Kochi — 682031, Kerala' },
                        { icon: <FiPhone size={24} />, label: 'Call Us', value: '+91 80000 00000' },
                        { icon: <FiMail size={24} />, label: 'Email', value: 'support@driveprime.in' },
                    ].map(({ icon, label, value }) => (
                        <div key={label} style={{ color: '#fff' }}>
                            <div style={{ marginBottom: '12px', opacity: 0.9 }}>{icon}</div>
                            <p style={{ opacity: 0.75, fontSize: '0.85rem', marginBottom: '4px' }}>{label}</p>
                            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{value}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
