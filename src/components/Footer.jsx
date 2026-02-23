import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';


export default function Footer() {
    return (
        <footer style={{
            background: 'var(--bg-dark)',
            color: 'rgba(255,255,255,0.75)',
            padding: '60px 0 0'
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '48px' }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <img
                                src="/drive-prime-logo.png"
                                alt="Drive Prime"
                                style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'brightness(1.05)' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '20px' }}>
                            India's trusted marketplace for buying & selling cars and bikes. 10,000+ verified listings across the country.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
                                <a key={i} href="#" style={{
                                    width: 36, height: 36, borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.7)',
                                    transition: 'var(--transition)',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '1rem' }}>Quick Links</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { to: '/search', label: 'Browse Cars' },
                                { to: '/search?type=Bike', label: 'Browse Bikes' },
                                { to: '/dealer-submit', label: 'Sell Your Car' },
                                { to: '/about', label: 'About Us' },
                                { to: '/admin/login', label: 'Admin Login' },
                            ].map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} style={{ fontSize: '0.9rem', transition: 'var(--transition)' }}
                                        onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Vehicle Brands */}
                    <div>
                        <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '1rem' }}>Popular Brands</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Mahindra', 'Royal Enfield'].map(brand => (
                                <li key={brand}>
                                    <Link to={`/search?brand=${encodeURIComponent(brand)}`} style={{ fontSize: '0.9rem', transition: 'var(--transition)' }}
                                        onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.75)'}>
                                        {brand}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '1rem' }}>Contact Us</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <FiMapPin size={16} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.9rem' }}>Drive Prime HQ, Marine Drive, Kochi — 682031, Kerala, India</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <FiPhone size={16} style={{ color: 'var(--primary)' }} />
                                <a href="tel:+918000000000" style={{ fontSize: '0.9rem' }}>+91 80000 00000</a>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <FiMail size={16} style={{ color: 'var(--primary)' }} />
                                <a href="mailto:support@driveprime.in" style={{ fontSize: '0.9rem' }}>support@driveprime.in</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    padding: '20px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '0.85rem',
                }}>
                    <span>© 2026 DrivePrime. All rights reserved.</span>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
