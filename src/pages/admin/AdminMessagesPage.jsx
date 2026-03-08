import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiPlus, FiTrash2, FiX, FiSend, FiInbox,
    FiChevronRight, FiCheckCircle, FiMail,
} from 'react-icons/fi';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/ToastProvider';
import { api } from '../../lib/api';
import { useAdmin } from '../../hooks/useAdmin';

function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

export default function AdminMessagesPage() {
    const { state } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const admin = useAdmin();
    const token = admin.getToken();

    const [messages, setMessages] = useState([]);
    const [dealerships, setDealerships] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [composeForm, setComposeForm] = useState({ fromDealershipId: '', fromDealershipName: '', toDealershipId: '', toDealershipName: 'All Dealerships', subject: '', body: '' });
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState('all');
    const bodyRef = useRef(null);

    useEffect(() => {
        if (!state.isAdminLoggedIn) navigate('/admin/login');
    }, [state.isAdminLoggedIn]);

    const loadMessages = useCallback(async () => {
        try {
            const data = await api.messages.getAll(token);
            setMessages(data);
        } catch {
            addToast('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadMessages();
        api.dealerships.getAll().then(setDealerships).catch(() => { });
    }, [loadMessages]);


    // Mark selected message as read when opened
    const openMessage = async (msg) => {
        setSelected(msg);
        if (!msg.isRead) {
            try {
                await api.messages.markRead(msg.id, token);
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
            } catch { /* silent */ }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.messages.markAllRead(token);
            setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            addToast('All messages marked as read', 'success');
        } catch { addToast('Failed', 'error'); }
    };

    const handleDelete = async (id) => {
        try {
            await api.messages.remove(id, token);
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selected?.id === id) setSelected(null);
            addToast('Message deleted', 'success');
        } catch { addToast('Failed to delete', 'error'); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!composeForm.subject.trim() || !composeForm.body.trim()) return addToast('Subject and body are required', 'error');
        setSending(true);
        try {
            const fromDealer = dealerships.find(d => d.id === composeForm.fromDealershipId);
            const toDealer = dealerships.find(d => d.id === composeForm.toDealershipId);
            const payload = {
                fromDealershipId: composeForm.fromDealershipId || null,
                fromDealershipName: fromDealer?.name || 'Platform',
                toDealershipId: composeForm.toDealershipId || null,
                toDealershipName: toDealer?.name || 'All Dealerships',
                subject: composeForm.subject,
                body: composeForm.body,
            };
            const newMsg = await api.messages.send(payload, token);
            setMessages(prev => [newMsg, ...prev]);
            setComposing(false);
            setComposeForm({ fromDealershipId: '', fromDealershipName: '', toDealershipId: '', toDealershipName: 'All Dealerships', subject: '', body: '' });
            addToast('Message sent!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSending(false);
        }
    };

    const unreadCount = messages.filter(m => !m.isRead).length;
    const displayedMessages = filter === 'unread' ? messages.filter(m => !m.isRead) : messages;

    const panelStyle = { background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)', overflow: 'hidden' };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div className="container" style={{ maxWidth: 1100 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <Link to="/admin/dashboard" className="btn btn-outline btn-sm"><FiArrowLeft size={14} /></Link>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Dealership Messages</h1>
                            {unreadCount > 0 && (
                                <span style={{ background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '0.72rem', padding: '2px 9px', borderRadius: 99 }}>
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>Internal communication between Drive Prime and partner dealerships</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm">
                                <FiCheckCircle size={13} /> Mark all read
                            </button>
                        )}
                        <button onClick={() => setComposing(true)} className="btn btn-primary">
                            <FiPlus size={15} /> Compose
                        </button>
                    </div>
                </div>

                {/* Main Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'flex-start' }}>

                    {/* LEFT — Message List */}
                    <div style={panelStyle}>
                        {/* Filter bar */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 4 }}>
                            {[['all', 'All'], ['unread', `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`]].map(([val, label]) => (
                                <button key={val} onClick={() => setFilter(val)} style={{
                                    flex: 1, padding: '5px 10px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
                                    fontWeight: 700, fontSize: '0.78rem',
                                    background: filter === val ? 'var(--primary)' : 'transparent',
                                    color: filter === val ? '#fff' : 'var(--text-muted)',
                                }}>{label}</button>
                            ))}
                        </div>

                        {loading ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
                        ) : displayedMessages.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                                <FiInbox size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                <p style={{ fontSize: '0.875rem' }}>No messages</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                                {displayedMessages.map(msg => (
                                    <div key={msg.id} onClick={() => openMessage(msg)} style={{
                                        padding: '14px 16px', borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer', transition: 'background 0.1s',
                                        background: selected?.id === msg.id ? '#fff7ed' : msg.isRead ? '#fff' : '#fef9f5',
                                        borderLeft: `3px solid ${selected?.id === msg.id ? 'var(--primary)' : msg.isRead ? 'transparent' : 'var(--primary)'}`,
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = selected?.id === msg.id ? '#fff7ed' : '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = selected?.id === msg.id ? '#fff7ed' : msg.isRead ? '#fff' : '#fef9f5'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <div style={{ marginTop: 2, flexShrink: 0 }}>
                                                {msg.isRead
                                                    ? <FiMail size={14} style={{ color: 'var(--text-muted)', opacity: 0.45 }} />
                                                    : <FiMail size={14} style={{ color: 'var(--primary)' }} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
                                                    <span style={{ fontWeight: msg.isRead ? 500 : 800, fontSize: '0.82rem', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                        {msg.toDealershipName}
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(msg.createdAt)}</span>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: 2 }}>{msg.subject}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                    {msg.fromDealershipName} · {msg.senderName}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT — Message Detail */}
                    {selected ? (
                        <div style={panelStyle}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)', gap: 12 }}>
                                <div>
                                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 6 }}>{selected.subject}</h2>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                                        <span><strong>From:</strong> {selected.fromDealershipName} ({selected.senderName})</span>
                                        <span><strong>To:</strong> {selected.toDealershipName}</span>
                                        <span>{new Date(selected.createdAt).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => handleDelete(selected.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 'var(--radius)', padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <FiTrash2 size={13} /> Delete
                                    </button>
                                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}><FiX size={18} /></button>
                                </div>
                            </div>
                            <div style={{ padding: '24px', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.9rem', minHeight: 200 }}>
                                {selected.body}
                            </div>
                            {/* Quick Reply */}
                            <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>QUICK REPLY</p>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const body = bodyRef.current?.value;
                                    if (!body?.trim()) return;
                                    setSending(true);
                                    try {
                                        const newMsg = await api.messages.send({
                                            fromDealershipId: selected.toDealershipId,
                                            fromDealershipName: selected.toDealershipName,
                                            toDealershipId: selected.fromDealershipId,
                                            toDealershipName: selected.fromDealershipName,
                                            subject: `Re: ${selected.subject}`,
                                            body,
                                        }, token);
                                        setMessages(prev => [newMsg, ...prev]);
                                        if (bodyRef.current) bodyRef.current.value = '';
                                        addToast('Reply sent!', 'success');
                                    } catch (err) { addToast(err.message, 'error'); }
                                    finally { setSending(false); }
                                }}>
                                    <textarea ref={bodyRef} className="form-textarea" placeholder="Type your reply here…" style={{ minHeight: 80, resize: 'vertical', marginBottom: 10 }} />
                                    <button type="submit" disabled={sending} className="btn btn-primary btn-sm">
                                        <FiSend size={13} /> {sending ? 'Sending…' : 'Send Reply'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div style={{ ...panelStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', color: 'var(--text-muted)', gap: 12 }}>
                            <FiInbox size={40} style={{ opacity: 0.2 }} />
                            <p style={{ fontWeight: 600 }}>Select a message to view</p>
                            <button onClick={() => setComposing(true)} className="btn btn-outline btn-sm"><FiPlus size={13} /> Compose New</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            {composing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '92vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 0' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>Compose Message</h2>
                            <button onClick={() => setComposing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiX size={20} /></button>
                        </div>
                        <form onSubmit={handleSend} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* From */}
                            <div className="form-group">
                                <label className="form-label">From (Dealership)</label>
                                <select value={composeForm.fromDealershipId} onChange={e => setComposeForm(f => ({ ...f, fromDealershipId: e.target.value }))} className="form-select">
                                    <option value="">Platform / Admin</option>
                                    {dealerships.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            {/* To */}
                            <div className="form-group">
                                <label className="form-label">To (Recipient)</label>
                                <select value={composeForm.toDealershipId} onChange={e => setComposeForm(f => ({ ...f, toDealershipId: e.target.value, toDealershipName: e.target.options[e.target.selectedIndex].text }))} className="form-select">
                                    <option value="">📢 All Dealerships (Broadcast)</option>
                                    {dealerships.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            {/* Subject */}
                            <div className="form-group">
                                <label className="form-label">Subject *</label>
                                <input value={composeForm.subject} onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))} className="form-input" placeholder="Message subject" required />
                            </div>
                            {/* Body */}
                            <div className="form-group">
                                <label className="form-label">Message *</label>
                                <textarea value={composeForm.body} onChange={e => setComposeForm(f => ({ ...f, body: e.target.value }))} className="form-textarea" placeholder="Write your message here…" style={{ minHeight: 140 }} required />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setComposing(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" disabled={sending} className="btn btn-primary" style={{ flex: 2 }}>
                                    <FiSend size={15} /> {sending ? 'Sending…' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
