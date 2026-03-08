import { FiMapPin, FiPhone, FiMail, FiCheckCircle, FiCrosshair, FiGlobe, FiTool, FiTruck, FiShield, FiHome } from 'react-icons/fi';
import { useStore } from '../store/StoreContext';

export default function AboutPage() {
    const { state } = useStore();
    const brand = state?.settings?.brand_name || "Drive Prime";

    return (
        <div>
            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#fff', padding: 'clamp(60px, 10vw, 100px) 0 clamp(40px, 8vw, 80px)', textAlign: 'center',
            }}>
                <div className="container">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#fbbf24', padding: '6px 16px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
                        🇮🇳 Made for India
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '20px' }}>
                        About <span style={{ color: 'var(--primary)' }}>{brand}</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                        {brand} is committed to eliminating confusion in the used car market and creating transparent vehicle transactions across the country.
                    </p>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="section-pad">
                <div className="container">
                    <div className="grid-2">
                        <div style={{ background: '#fff', padding: 'clamp(24px, 5vw, 40px)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ background: '#e0f2fe', color: '#0369a1', padding: 12, borderRadius: 12 }}>
                                    <FiGlobe size={24} />
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Our Vision</h2>
                            </div>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                To become one of India’s most trusted and technology-driven automotive marketplaces
                                delivering transparent, convenient, and premium car buying and selling experiences
                                across the country and beyond.
                            </p>
                        </div>

                        <div style={{ background: '#fff', padding: 'clamp(24px, 5vw, 40px)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ background: '#fef3c7', color: '#d97706', padding: 12, borderRadius: 12 }}>
                                    <FiCrosshair size={24} />
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Our Mission</h2>
                            </div>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
                                {[
                                    'Eliminating confusion in the used car market',
                                    'Creating transparent vehicle transactions',
                                    'Supporting customers from search to delivery',
                                    'Expanding into showrooms, service centers, and a full automotive ecosystem.'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <FiCheckCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ lineHeight: 1.6 }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="section-pad" style={{ background: '#f8fafc' }}>
                <div className="container">
                    <div className="section-header text-center" style={{ marginBottom: 48 }}>
                        <h2 className="section-title">How {brand} Works</h2>
                        <p className="section-subtitle">Simple. Transparent. Reliable.</p>
                    </div>

                    <div className="grid-4">
                        {[
                            { step: 'Step 1', title: 'Share Your Requirement', desc: 'Tell us your budget, preferred model, and location.' },
                            { step: 'Step 2', title: 'Source & Verification', desc: 'We shortlist suitable vehicles through our network and verify documentation.' },
                            { step: 'Step 3', title: 'Inspection & Test Drive', desc: 'Schedule a physical or video inspection before finalizing.' },
                            { step: 'Step 4', title: 'Secure Deal & Delivery', desc: 'Complete documentation and receive delivery support.' },
                        ].map((s, i) => (
                            <div key={i} style={{ background: '#fff', padding: 'clamp(20px, 4vw, 32px)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', position: 'relative', zIndex: 1 }}>
                                <div style={{ background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '0.8rem', padding: '6px 12px', borderRadius: 99, display: 'inline-block', marginBottom: 16 }}>{s.step}</div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 12 }}>{s.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="section-pad">
                <div className="container">
                    <div className="section-header text-center" style={{ marginBottom: 48 }}>
                        <h2 className="section-title">Our Services</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {[
                            { icon: FiShield, title: 'Used Car Buying', desc: 'Browse verified vehicles sourced through trusted dealers and individual sellers. Complete assistance from selection to documentation.' },
                            { icon: FiCheckCircle, title: 'Car Selling Assistance', desc: 'Get fair market valuation, professional listing support, and access to verified buyers.' },
                            { icon: FiHome, title: 'Home Test Drives', desc: 'Experience selected vehicles at your convenience.' },
                            { icon: FiTruck, title: 'Doorstep Delivery', desc: 'Secure and hassle-free vehicle delivery assistance across India.' },
                            { icon: FiTool, title: 'Drive Prime Services', desc: 'Inspection support, extended care programs, and automotive service solutions. (Coming Soon)' },
                        ].map((srv, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'clamp(20px, 4vw, 32px)', background: '#fff', borderRadius: 24, border: '1px solid var(--border)' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(249,115,22,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <srv.icon size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>{srv.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{srv.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Info */}
            <section className="section-pad" style={{ background: 'var(--primary)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
                    {[
                        { icon: <FiMapPin size={24} />, label: 'Address', value: state?.settings?.dealer_address || 'Marine Drive, Kochi — 682031, Kerala' },
                        { icon: <FiPhone size={24} />, label: 'Call Us', value: state?.settings?.dealer_phone || '+91 80000 00000' },
                        { icon: <FiMail size={24} />, label: 'Email', value: state?.settings?.dealer_email || 'support@driveprime.in' },
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
