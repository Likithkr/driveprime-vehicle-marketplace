import React from 'react';
import { useStore } from '../store/StoreContext';

export default function TermsPage() {
    const { state } = useStore();
    const brand = state?.settings?.brand_name || "Drive Prime";

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '60px 20px 80px' }}>
            <div className="container" style={{ maxWidth: '800px', background: '#fff', padding: '50px 60px', borderRadius: '24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>

                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', marginBottom: '8px', color: 'var(--primary)' }}>
                    Terms & Conditions
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '40px', fontWeight: 500 }}>
                    {brand} – Terms & Conditions
                </p>

                <div style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text)' }}>
                    <p style={{ marginBottom: '24px', fontSize: '1.05rem', fontWeight: 500 }}>
                        {brand} operates as an automotive marketplace and vehicle facilitation platform.
                    </p>

                    <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <li>
                            <strong>{brand}</strong> lists vehicles sourced from verified dealers, partners, and individual sellers.
                        </li>
                        <li>
                            <strong>{brand}</strong> does not manufacture vehicles and does not guarantee mechanical performance unless specifically mentioned under "{brand} Certified".
                        </li>
                        <li>
                            Vehicle availability is subject to change without prior notice.
                        </li>
                        <li>
                            Pricing may vary based on location, transport charges, taxes, and seller agreement.
                        </li>
                        <li>
                            Buyers are encouraged to conduct independent inspections before finalizing purchase.
                        </li>
                        <li>
                            <strong>{brand}</strong> facilitates documentation assistance but final ownership transfer is subject to respective RTO regulations.
                        </li>
                        <li>
                            <strong>{brand}</strong> reserves the right to modify services, pricing, and policies without prior notice.
                        </li>
                    </ol>
                </div>

                <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style={{ marginTop: '8px' }}>By using the {brand} platform, you agree to these terms & conditions in full.</p>
                </div>
            </div>
        </div>
    );
}
