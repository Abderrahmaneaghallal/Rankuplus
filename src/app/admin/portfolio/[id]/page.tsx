'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16 };
const labelStyle = { display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 };
const cardBox = { padding: 28, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', marginBottom: 24 };
const btnPrimary = { padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 as const };
const btnSecondary = { padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#888', cursor: 'pointer', fontSize: 13 };
const btnSmall = { padding: '8px 16px', borderRadius: 8, border: 'none', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', cursor: 'pointer', fontSize: 12, fontWeight: 500 as const };
const btnDanger = { padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 500 as const };
const btnPublish = { padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 as const };

interface PortfolioItem {
    slug: string; titleFr: string; titleEn: string; titleAr: string;
    excerptFr: string; excerptEn: string; excerptAr: string;
    clientName: string; industry: string; tags: string; results: string;
    galleryImages: string; featuredImage: string; imageAlt: string;
    metaTitleFr: string; metaTitleEn: string; metaTitleAr: string;
    metaDescFr: string; metaDescEn: string; metaDescAr: string;
    isFeatured: boolean; isPublished: boolean; sortOrder: number;
}

const empty: PortfolioItem = {
    slug: '', titleFr: '', titleEn: '', titleAr: '',
    excerptFr: '', excerptEn: '', excerptAr: '',
    clientName: '', industry: '', tags: '', results: '[]',
    galleryImages: '[]', featuredImage: '', imageAlt: '',
    metaTitleFr: '', metaTitleEn: '', metaTitleAr: '',
    metaDescFr: '', metaDescEn: '', metaDescAr: '',
    isFeatured: false, isPublished: false, sortOrder: 0,
};

// ─── Image Upload Helper ────────────────────────────────────────────────────
function ImageUpload({ value, onChange, label = 'Image', height = 140 }: { value: string; onChange: (url: string) => void; label?: string; height?: number }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const upload = async (file: File) => {
        setUploading(true);
        try {
            const fd = new FormData(); fd.append('file', file); fd.append('altText', file.name.replace(/\.[^.]+$/, ''));
            const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
            if (res.ok) { const m = await res.json(); onChange(m.url); }
        } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
    };
    return (
        <div style={{ marginBottom: 16 }}>
            <div
                onClick={() => fileRef.current?.click()}
                style={{ border: '2px dashed rgba(139,92,246,0.3)', borderRadius: 10, minHeight: height, cursor: 'pointer', background: 'rgba(139,92,246,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8, position: 'relative' }}
            >
                {value
                    ? <img src={value} alt="" style={{ width: '100%', height: height, objectFit: 'cover', borderRadius: 8 }} />
                    : <div style={{ textAlign: 'center', color: '#555', padding: 20 }}>{uploading ? '⏳ Uploading...' : `📷 Click to upload ${label}`}</div>
                }
                {value && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}><span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>📷 Change</span></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            <input value={value} onChange={e => onChange(e.target.value)} placeholder="Or paste image URL..." style={{ ...inputStyle, marginBottom: 0, fontSize: 12 }} />
        </div>
    );
}

// ─── Results Manager ────────────────────────────────────────────────────────
function ResultsManager({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [results, setResults] = useState<string[]>([]);
    const [newResult, setNewResult] = useState('');

    useEffect(() => {
        try { setResults(JSON.parse(value || '[]')); } catch { setResults([]); }
    }, [value]);

    const update = (arr: string[]) => { setResults(arr); onChange(JSON.stringify(arr)); };
    const add = () => { if (newResult.trim()) { update([...results, newResult.trim()]); setNewResult(''); } };
    const remove = (i: number) => update(results.filter((_, idx) => idx !== i));

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={newResult} onChange={e => setNewResult(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="e.g. +320% traffic, x2 revenue" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                <button onClick={add} style={btnSmall}>+ Add</button>
            </div>
            {results.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {results.map((r, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: 13 }}>
                            {r}
                            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Gallery Manager ────────────────────────────────────────────────────────
function GalleryManager({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        setUploading(true);
        try {
            const fd = new FormData(); fd.append('file', file); fd.append('altText', file.name.replace(/\.[^.]+$/, ''));
            const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
            if (res.ok) { const m = await res.json(); onChange([...images, m.url]); }
        } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
    };

    return (
        <div style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>📸 Result Screenshots ({images.length})</h3>
                <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ ...btnSmall, background: 'rgba(139,92,246,0.15)' }}>
                    {uploading ? '⏳ Uploading...' : '📷 Upload Screenshot'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            </div>
            {images.length === 0 && <p style={{ color: '#555', fontSize: 13, margin: 0 }}>No screenshots yet. Click Upload to add result images.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <img src={img} alt={`Screenshot ${i + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                        <button onClick={() => onChange(images.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.8)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Sub-item Manager with image upload ─────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SubItem { id: string; title: string; [key: string]: any; }

function SubItemManager({ portfolioId, type, label, icon }: {
    portfolioId: string;
    type: 'portfolio-websites' | 'portfolio-social-designs' | 'portfolio-videos';
    label: string; icon: string;
}) {
    const [items, setItems] = useState<SubItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [form, setForm] = useState<Record<string, any>>({});
    const [editId, setEditId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const imageKey = type === 'portfolio-websites' ? 'screenshotUrl' : type === 'portfolio-social-designs' ? 'imageUrl' : 'thumbnailUrl';

    const load = () => {
        fetch(`/api/admin/${type}?portfolioId=${portfolioId}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setItems(d); }).catch(() => { });
    };
    useEffect(() => { if (portfolioId) load(); }, [portfolioId]); // eslint-disable-line

    const save = async () => {
        const url = editId ? `/api/admin/${type}/${editId}` : `/api/admin/${type}`;
        const method = editId ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, portfolioId }) });
        if (res.ok) { setShowForm(false); setEditId(null); setForm({}); load(); }
    };

    const edit = async (id: string) => {
        const data = await (await fetch(`/api/admin/${type}/${id}`)).json();
        setForm(data); setEditId(id); setShowForm(true);
    };

    const remove = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;
        await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' }); load();
    };

    const uploadImage = async (file: File) => {
        setUploading(true);
        try {
            const fd = new FormData(); fd.append('file', file); fd.append('altText', file.name.replace(/\.[^.]+$/, ''));
            const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
            if (res.ok) { const m = await res.json(); setForm(prev => ({ ...prev, [imageKey]: m.url })); }
        } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
    };

    const defaultForm = type === 'portfolio-websites'
        ? { title: '', category: '', url: '', screenshotUrl: '', descriptionFr: '', descriptionEn: '', statTraffic: '', statConversion: '', statSpeed: '', accentColor: '#8b5cf6', isPublished: true }
        : type === 'portfolio-social-designs'
        ? { title: '', type: 'instagram', imageUrl: '', clientName: '', ratio: 'aspect-square', color: 'from-pink-500 to-purple-600', isPublished: true }
        : { title: '', platform: 'youtube', videoUrl: '', thumbnailUrl: '', clientName: '', category: '', isPublished: true };

    return (
        <div style={cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: 0 }}>{icon} {label} ({items.length})</h3>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm); }} style={btnSmall}>+ Add</button>
            </div>

            {showForm && (
                <div style={{ padding: 20, borderRadius: 12, border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.05)', marginBottom: 16 }}>
                    <h4 style={{ color: '#a78bfa', fontSize: 14, margin: '0 0 16px' }}>{editId ? '✏️ Edit' : '+ New'} {label.slice(0, -1)}</h4>

                    {type === 'portfolio-websites' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={labelStyle}>Title *</label><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Website name" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Category</label><input value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g., Tourism" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Website URL</label><input value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="example.com" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Accent Color</label><input value={form.accentColor || '#8b5cf6'} onChange={e => setForm({ ...form, accentColor: e.target.value })} placeholder="#8b5cf6" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Traffic Stat</label><input value={form.statTraffic || ''} onChange={e => setForm({ ...form, statTraffic: e.target.value })} placeholder="+320%" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Conversion</label><input value={form.statConversion || ''} onChange={e => setForm({ ...form, statConversion: e.target.value })} placeholder="4.2%" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Description (FR)</label><input value={form.descriptionFr || ''} onChange={e => setForm({ ...form, descriptionFr: e.target.value })} placeholder="French description" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Screenshot</label>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ ...btnSmall, padding: '6px 14px' }}>{uploading ? '⏳...' : '📷 Upload'}</button>
                                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                                </div>
                                <input value={form.screenshotUrl || ''} onChange={e => setForm({ ...form, screenshotUrl: e.target.value })} placeholder="or paste URL: /uploads/screenshot.jpg" style={{ ...inputStyle, marginBottom: 0 }} />
                                {form.screenshotUrl && <img src={form.screenshotUrl} alt="" style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
                            </div>
                        </div>
                    )}

                    {type === 'portfolio-social-designs' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={labelStyle}>Title *</label><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Design title" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Client</label><input value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Client name" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Platform</label>
                                <select value={form.type || 'instagram'} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, marginBottom: 0, cursor: 'pointer' }}>
                                    {['instagram', 'story', 'facebook', 'carousel', 'tiktok'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                </select>
                            </div>
                            <div><label style={labelStyle}>Ratio</label>
                                <select value={form.ratio || 'aspect-square'} onChange={e => setForm({ ...form, ratio: e.target.value })} style={{ ...inputStyle, marginBottom: 0, cursor: 'pointer' }}>
                                    <option value="aspect-square">Square (1:1)</option>
                                    <option value="aspect-[9/16]">Story (9:16)</option>
                                    <option value="aspect-video">Video (16:9)</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Design Image</label>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ ...btnSmall, padding: '6px 14px' }}>{uploading ? '⏳...' : '📷 Upload Design'}</button>
                                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                                </div>
                                <input value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="or paste URL" style={{ ...inputStyle, marginBottom: 0 }} />
                                {form.imageUrl && <img src={form.imageUrl} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
                            </div>
                        </div>
                    )}

                    {type === 'portfolio-videos' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div><label style={labelStyle}>Title *</label><input value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Video title" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Client</label><input value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Client name" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div><label style={labelStyle}>Platform</label>
                                <select value={form.platform || 'youtube'} onChange={e => setForm({ ...form, platform: e.target.value })} style={{ ...inputStyle, marginBottom: 0, cursor: 'pointer' }}>
                                    {['youtube', 'vimeo', 'tiktok', 'instagram'].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                </select>
                            </div>
                            <div><label style={labelStyle}>Category</label><input value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Promo" style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Video URL</label><input value={form.videoUrl || ''} onChange={e => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." style={{ ...inputStyle, marginBottom: 0 }} /></div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Thumbnail</label>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ ...btnSmall, padding: '6px 14px' }}>{uploading ? '⏳...' : '📷 Upload Thumbnail'}</button>
                                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                                </div>
                                <input value={form.thumbnailUrl || ''} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="or paste thumbnail URL" style={{ ...inputStyle, marginBottom: 0 }} />
                                {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="" style={{ width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                        <button onClick={() => { setShowForm(false); setEditId(null); setForm({}); }} style={btnSecondary}>Cancel</button>
                        <button onClick={save} style={btnPrimary}>{editId ? 'Update' : 'Create'}</button>
                    </div>
                </div>
            )}

            {items.length === 0 && !showForm && (
                <p style={{ color: '#555', fontSize: 13, margin: 0 }}>No items yet. Click &quot;+ Add&quot; to create one.</p>
            )}

            {items.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', marginBottom: i < items.length - 1 ? 8 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {(item.screenshotUrl || item.imageUrl || item.thumbnailUrl) && (
                            <img src={item.screenshotUrl || item.imageUrl || item.thumbnailUrl} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <div>
                            <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{item.title}</span>
                            {item.type && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', textTransform: 'uppercase' }}>{item.type}</span>}
                            {item.platform && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', textTransform: 'uppercase' }}>{item.platform}</span>}
                            {item.url && <span style={{ marginLeft: 8, fontSize: 11, color: '#06b6d4' }}>{item.url}</span>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => edit(item.id)} style={{ ...btnSmall, background: 'rgba(139,92,246,0.1)' }}>Edit</button>
                        <button onClick={() => remove(item.id, item.title)} style={btnDanger}>✕</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Edit Page ──────────────────────────────────────────────────────────
export default function EditPortfolio() {
    const params = useParams();
    const router = useRouter();
    const isNew = params.id === 'new';
    const [item, setItem] = useState<PortfolioItem>(empty);
    const [tab, setTab] = useState<'fr' | 'en' | 'ar'>('fr');
    const [activeSection, setActiveSection] = useState<'content' | 'media' | 'seo'>('content');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [savedId, setSavedId] = useState<string | null>(null);

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/admin/portfolio/${params.id}`)
                .then(r => r.json())
                .then(data => { setItem({ ...empty, ...data }); setSavedId(data.id); })
                .catch(() => setError('Failed to load portfolio item.'));
        }
    }, [isNew, params.id]);

    const doSave = async (publishedState?: boolean) => {
        if (!item.titleFr) { setError('French title is required.'); return; }
        if (!item.slug) { setError('URL slug is required.'); return; }
        setError(''); setSuccess(''); setSaving(true);
        try {
            const payload = publishedState !== undefined ? { ...item, isPublished: publishedState } : item;
            const url = isNew ? '/api/admin/portfolio' : `/api/admin/portfolio/${params.id}`;
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to save.');
            } else {
                const data = await res.json();
                if (publishedState !== undefined) setItem(prev => ({ ...prev, isPublished: publishedState }));
                if (isNew) {
                    router.push(`/admin/portfolio/${data.id}`);
                } else {
                    setSavedId(data.id);
                    setSuccess(publishedState === true ? '✅ Published! Visible on website.' : publishedState === false ? '⬇️ Unpublished.' : '✅ Saved successfully!');
                    setTimeout(() => setSuccess(''), 4000);
                }
            }
        } catch { setError('Network error.'); } finally { setSaving(false); }
    };

    const t = tab.charAt(0).toUpperCase() + tab.slice(1);
    let galleryImages: string[] = [];
    try { galleryImages = JSON.parse(item.galleryImages || '[]'); } catch { /* */ }
    const setGallery = (imgs: string[]) => setItem({ ...item, galleryImages: JSON.stringify(imgs) });

    const sections = [
        { key: 'content', label: '📝 Content' },
        { key: 'media', label: '🖼️ Media & Sub-items' },
        { key: 'seo', label: '🔍 SEO' },
    ];

    return (
        <div style={{ maxWidth: 1000 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>{isNew ? 'New Case Study' : 'Edit Case Study'}</h1>
                    {!isNew && (
                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.isPublished ? '#10b981' : '#666', display: 'inline-block' }} />
                            <span style={{ color: item.isPublished ? '#10b981' : '#666', fontSize: 13 }}>{item.isPublished ? 'Published — visible on website' : 'Draft — not visible on website'}</span>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => router.push('/admin/portfolio')} style={btnSecondary}>← Back</button>
                    <button onClick={() => doSave()} disabled={saving} style={{ ...btnSecondary, color: '#ccc' }}>{saving ? 'Saving...' : 'Save Draft'}</button>
                    {!isNew && item.isPublished && (
                        <button onClick={() => doSave(false)} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.4)', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>Unpublish</button>
                    )}
                    <button onClick={() => doSave(true)} disabled={saving} style={{ ...btnPublish, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : item.isPublished ? '✓ Update & Publish' : '🚀 Publish'}</button>
                </div>
            </div>

            {/* Feedback */}
            {error && <div style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14, marginBottom: 24 }}>{error}</div>}
            {success && <div style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: 14, marginBottom: 24 }}>{success}</div>}

            {/* Language Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['fr', 'en', 'ar'] as const).map(l => (
                    <button key={l} onClick={() => setTab(l)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid', borderColor: tab === l ? '#8b5cf6' : 'rgba(255,255,255,0.08)', background: tab === l ? 'rgba(139,92,246,0.15)' : 'transparent', color: tab === l ? '#8b5cf6' : '#888', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                        {l === 'fr' ? '🇫🇷 Français' : l === 'en' ? '🇬🇧 English' : '🇲🇦 العربية'}
                    </button>
                ))}
            </div>

            {/* Section Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                {sections.map(s => (
                    <button key={s.key} onClick={() => setActiveSection(s.key as typeof activeSection)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === s.key ? 600 : 400, background: activeSection === s.key ? 'rgba(139,92,246,0.15)' : 'transparent', color: activeSection === s.key ? '#8b5cf6' : '#888' }}>{s.label}</button>
                ))}
            </div>

            {/* ── CONTENT ── */}
            {activeSection === 'content' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
                    <div>
                        <div style={cardBox}>
                            <label style={labelStyle}>Title ({tab.toUpperCase()}) *</label>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <input value={(item as any)[`title${t}`] || ''} onChange={e => setItem({ ...item, [`title${t}`]: e.target.value })} placeholder="Project title" style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }} />
                            <label style={labelStyle}>Description ({tab.toUpperCase()})</label>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <textarea value={(item as any)[`excerpt${t}`] || ''} onChange={e => setItem({ ...item, [`excerpt${t}`]: e.target.value })} rows={5} placeholder="Describe the project..." style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>
                        <div style={cardBox}>
                            <label style={labelStyle}>Results Achieved</label>
                            <p style={{ color: '#555', fontSize: 12, marginBottom: 12 }}>Add key results (e.g. "+320% traffic", "×2 sales"). Each one shows as a badge on the website.</p>
                            <ResultsManager value={item.results} onChange={v => setItem({ ...item, results: v })} />
                        </div>
                    </div>
                    <div>
                        <div style={cardBox}>
                            <label style={labelStyle}>URL Slug *</label>
                            <input value={item.slug} onChange={e => setItem({ ...item, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} placeholder="case-study-slug" style={inputStyle} />
                            <label style={labelStyle}>Client Name</label>
                            <input value={item.clientName} onChange={e => setItem({ ...item, clientName: e.target.value })} placeholder="Client company" style={inputStyle} />
                            <label style={labelStyle}>Industry</label>
                            <input value={item.industry} onChange={e => setItem({ ...item, industry: e.target.value })} placeholder="e.g. E-commerce, Tourism" style={inputStyle} />
                            <label style={labelStyle}>Tags (comma-separated)</label>
                            <input value={item.tags} onChange={e => setItem({ ...item, tags: e.target.value })} placeholder="SEO, Google Ads, Branding" style={inputStyle} />
                            <label style={labelStyle}>Sort Order</label>
                            <input type="number" value={item.sortOrder} onChange={e => setItem({ ...item, sortOrder: parseInt(e.target.value) || 0 })} style={inputStyle} />
                        </div>
                        <div style={cardBox}>
                            <label style={{ ...labelStyle, marginBottom: 12 }}>Options</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ccc', fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>
                                <input type="checkbox" checked={item.isFeatured} onChange={e => setItem({ ...item, isFeatured: e.target.checked })} />
                                ⭐ Featured (shown first)
                            </label>
                            <div style={{ padding: '12px 16px', borderRadius: 10, background: item.isPublished ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${item.isPublished ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                                <div style={{ color: item.isPublished ? '#10b981' : '#888', fontSize: 13, fontWeight: 600 }}>
                                    {item.isPublished ? '✅ Published — visible on website' : '⬜ Draft — hidden from website'}
                                </div>
                                <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Use the Publish / Unpublish buttons above to change.</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MEDIA ── */}
            {activeSection === 'media' && (
                <div>
                    <div style={cardBox}>
                        <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 16 }}>🖼️ Featured Image</h3>
                        <ImageUpload value={item.featuredImage} onChange={url => setItem({ ...item, featuredImage: url })} label="featured image" height={180} />
                        <label style={labelStyle}>Image Alt Text (SEO)</label>
                        <input value={item.imageAlt} onChange={e => setItem({ ...item, imageAlt: e.target.value })} placeholder="Describe the image for SEO" style={{ ...inputStyle, marginBottom: 0 }} />
                    </div>

                    <GalleryManager images={galleryImages} onChange={setGallery} />

                    {savedId ? (
                        <>
                            <SubItemManager portfolioId={savedId} type="portfolio-websites" label="Website Showcases" icon="🌐" />
                            <SubItemManager portfolioId={savedId} type="portfolio-social-designs" label="Social Media Designs" icon="🎨" />
                            <SubItemManager portfolioId={savedId} type="portfolio-videos" label="Videos" icon="🎬" />
                        </>
                    ) : (
                        <div style={{ ...cardBox, textAlign: 'center', padding: 40 }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
                            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Save the case study first, then you can add websites, social designs, and videos linked to it.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── SEO ── */}
            {activeSection === 'seo' && (
                <div style={cardBox}>
                    <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 20 }}>🔍 SEO ({tab.toUpperCase()})</h3>
                    <label style={labelStyle}>Meta Title</label>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <input value={(item as any)[`metaTitle${t}`] || ''} onChange={e => setItem({ ...item, [`metaTitle${t}`]: e.target.value })} placeholder="SEO title — leave empty to use post title" style={inputStyle} />
                    <label style={labelStyle}>Meta Description</label>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <textarea value={(item as any)[`metaDesc${t}`] || ''} onChange={e => setItem({ ...item, [`metaDesc${t}`]: e.target.value })} rows={4} placeholder="SEO description — 150-160 characters recommended" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
            )}
        </div>
    );
}
