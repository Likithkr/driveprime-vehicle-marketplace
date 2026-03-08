import React from 'react';
import { useStore } from '../store/StoreContext';

export default function PrivacyPolicyPage() {
    const { state } = useStore();
    const brand = state?.settings?.brand_name || "Drive Prime";

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '60px 20px 80px' }}>
            <div className="container" style={{ maxWidth: '800px', background: '#fff', padding: '50px 60px', borderRadius: '24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>

                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', marginBottom: '8px', color: 'var(--primary)' }}>
                    Privacy & Policies
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '40px', fontWeight: 500 }}>
                    Legal documentation and policies for {brand}
                </p>

                <div style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text)' }}>

                    {/* Privacy Policy */}
                    <div style={{ marginBottom: 48 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 16, color: '#0f172a' }}>🔒 Privacy Policy</h2>
                        <p style={{ marginBottom: 16, fontWeight: 500 }}>{brand} respects your privacy.</p>
                        <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>We collect customer information such as name, phone number, email, and vehicle preferences for service purposes.</li>
                            <li>We do not sell personal information to third parties.</li>
                            <li>Information may be shared with verified dealer partners for transaction purposes only.</li>
                            <li>We use reasonable security measures to protect user data.</li>
                            <li>By using our website, you consent to our privacy practices.</li>
                        </ol>
                    </div>

                    {/* Refund Policy */}
                    <div style={{ marginBottom: 48 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 16, color: '#0f172a' }}>💰 Refund Policy</h2>
                        <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>Booking amounts, if applicable, are subject to seller agreement.</li>
                            <li>Refund eligibility depends on inspection results and cancellation terms agreed during booking.</li>
                            <li>Delivery and transport charges are non-refundable once vehicle dispatch is initiated.</li>
                        </ol>
                    </div>

                    {/* Delivery & Transfer Policy */}
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 16, color: '#0f172a' }}>🚚 Delivery & Transfer Policy</h2>
                        <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li>{brand} provides delivery assistance across India through partnered transport services.</li>
                            <li>Delivery timelines may vary depending on location and transport availability.</li>
                            <li>Interstate vehicle transfer is subject to RTO regulations and applicable charges.</li>
                            <li>Buyers are responsible for applicable road tax differences and re-registration fees.</li>
                        </ol>
                    </div>

                </div>

                <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
}
