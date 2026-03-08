import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomer';
import { useToast } from '../components/ToastProvider';
import { api } from '../lib/api';
import { FiUser, FiPhone, FiLock, FiLogOut, FiCheckCircle } from 'react-icons/fi';

export default function CustomerProfilePage() {
    const customer = useCustomer();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [user, setUser] = useState(customer.getUser());
    const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        if (!customer.isLoggedIn()) {
            navigate('/');
        } else {
            const u = customer.getUser();
            setUser(u);
            setProfileForm({ name: u?.name || '', phone: u?.phone || '' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            const res = await api.auth.updateProfile(profileForm, customer.getToken());
            if (res.success) {
                // Update local storage explicitly
                customer.login(customer.getToken(), res.user);
                setUser(res.user);
                addToast('Profile updated successfully!', 'success');
            }
        } catch (err) {
            addToast(err.message || 'Failed to update profile', 'error');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return addToast('New passwords do not match', 'error');
        }
        if (passwordForm.newPassword.length < 6) {
            return addToast('Password must be at least 6 characters', 'error');
        }

        setLoadingPassword(true);
        try {
            const res = await api.auth.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            }, customer.getToken());

            if (res.success) {
                addToast('Password changed successfully!', 'success');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            addToast(err.message || 'Failed to change password', 'error');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleLogout = () => {
        customer.logout();
        navigate('/');
        addToast('Logged out successfully', 'info');
    };

    if (!user) return null;

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', marginBottom: '8px' }}>
                    My Profile
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Manage your account details and security settings.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Profile Information */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiUser color="var(--primary)" /> Personal Information
                        </h2>
                        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} size={16} />
                                    <input
                                        type="text"
                                        required
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="form-input"
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    className="form-input"
                                    style={{ background: '#f1f5f9', color: '#64748b' }}
                                    disabled
                                    title="Email cannot be changed"
                                />
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Email address cannot be changed.</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <FiPhone style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} size={16} />
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="form-input"
                                        placeholder="e.g. 9876543210"
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '8px' }}>
                                <button type="submit" className="btn btn-primary" disabled={loadingProfile} style={{ display: 'inline-flex', gap: '6px' }}>
                                    {loadingProfile ? 'Saving...' : <><FiCheckCircle /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiLock color="var(--primary)" /> Security Settings
                        </h2>
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600 }}>Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="form-input"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600 }}>New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="form-input"
                                    placeholder="At least 6 characters"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600 }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="form-input"
                                    placeholder="Repeat new password"
                                />
                            </div>

                            <div style={{ marginTop: '8px' }}>
                                <button type="submit" className="btn btn-primary" disabled={loadingPassword} style={{ display: 'inline-flex', gap: '6px' }}>
                                    {loadingPassword ? 'Updating...' : <><FiLock /> Update Password</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Account Actions */}
                    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                            <FiLogOut /> Account Actions
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
                            Log out of your account on this device.
                        </p>
                        <button onClick={handleLogout} className="btn" style={{ background: '#fee2e2', color: '#dc2626', display: 'inline-flex', gap: '8px', fontWeight: 600 }}>
                            <FiLogOut /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
