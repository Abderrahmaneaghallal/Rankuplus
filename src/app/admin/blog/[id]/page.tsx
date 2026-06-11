'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16 };
const labelStyle = { display: 'block', fontSize: 12, color: '#888', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 };

// ─── Rich Text Editor ────────────────────────────────────────────────────────
function RichEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState('');
    const isInitialized = useRef(false);

    // Set initial content only once
    useEffect(() => {
        if (editorRef.current && !isInitialized.current) {
            editorRef.current.innerHTML = value || '';
            isInitialized.current = true;
        }
    }, [value]);

    // Reset when tab (language) changes — detected by value changing to a different string
    const prevValue = useRef(value);
    useEffect(() => {
        if (prevValue.current !== value && editorRef.current) {
            // Only reset if the editor content is different from the new value
            const currentHtml = editorRef.current.innerHTML;
            if (currentHtml !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
        prevValue.current = value;
    }, [value]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const exec = (cmd: string, val?: string) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    const insertHtml = (html: string) => {
        editorRef.current?.focus();
        document.execCommand('insertHTML', false, html);
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('altText', file.name.replace(/\.[^.]+$/, ''));
            const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const media = await res.json();
            insertHtml(`<img src="${media.url}" alt="${media.altText}" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;" />`);
            showToast('✅ Image inserted!');
        } catch {
            showToast('❌ Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) handleImageUpload(file);
                return;
            }
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) handleImageUpload(file);
    }, []);

    const toolBtn = (label: string, action: () => void, title?: string) => (
        <button
            type="button"
            title={title || label}
            onClick={action}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#ccc', cursor: 'pointer', fontSize: 13, fontWeight: 500, lineHeight: 1 }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ position: 'relative' }}>
            {toast && (
                <div style={{ position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 10, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, zIndex: 9999 }}>
                    {toast}
                </div>
            )}

            {/* Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '10px 12px', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', background: 'rgba(255,255,255,0.02)' }}>
                {toolBtn('H1', () => exec('formatBlock', 'h1'), 'Heading 1')}
                {toolBtn('H2', () => exec('formatBlock', 'h2'), 'Heading 2')}
                {toolBtn('H3', () => exec('formatBlock', 'h3'), 'Heading 3')}
                {toolBtn('P', () => exec('formatBlock', 'p'), 'Paragraph')}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                {toolBtn('B', () => exec('bold'), 'Bold')}
                {toolBtn('I', () => exec('italic'), 'Italic')}
                {toolBtn('U', () => exec('underline'), 'Underline')}
                {toolBtn('S', () => exec('strikeThrough'), 'Strikethrough')}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                {toolBtn('• List', () => exec('insertUnorderedList'), 'Bullet List')}
                {toolBtn('1. List', () => exec('insertOrderedList'), 'Numbered List')}
                {toolBtn('❝ Quote', () => exec('formatBlock', 'blockquote'), 'Blockquote')}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                {toolBtn('🔗 Link', () => {
                    const url = prompt('Enter URL:');
                    if (url) exec('createLink', url);
                }, 'Insert Link')}
                {toolBtn('— HR', () => insertHtml('<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />'), 'Horizontal Rule')}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                {/* Image Upload Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload Image"
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.4)', background: uploading ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.15)', color: '#a78bfa', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                    {uploading ? '⏳ Uploading...' : '📷 Add Image'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                />
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                data-placeholder={placeholder}
                style={{
                    minHeight: 400,
                    padding: '20px',
                    borderRadius: '0 0 12px 12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    fontSize: 14,
                    lineHeight: 1.8,
                    outline: 'none',
                    overflowY: 'auto',
                }}
            />

            <style>{`
                [contenteditable]:empty:before { content: attr(data-placeholder); color: #555; pointer-events: none; }
                [contenteditable] h1 { font-size: 2em; font-weight: 700; margin: 0.5em 0; color: #fff; }
                [contenteditable] h2 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; color: #fff; }
                [contenteditable] h3 { font-size: 1.2em; font-weight: 600; margin: 0.5em 0; color: #e5e7eb; }
                [contenteditable] p { margin: 0.5em 0; }
                [contenteditable] ul { padding-left: 1.5em; list-style: disc; }
                [contenteditable] ol { padding-left: 1.5em; list-style: decimal; }
                [contenteditable] blockquote { border-left: 3px solid #8b5cf6; padding-left: 1em; margin: 1em 0; color: #aaa; font-style: italic; }
                [contenteditable] a { color: #8b5cf6; text-decoration: underline; }
                [contenteditable] hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0; }
                [contenteditable] img { max-width: 100%; border-radius: 8px; margin: 12px 0; cursor: pointer; }
                [contenteditable] img:hover { outline: 2px solid #8b5cf6; }
            `}</style>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function EditPost() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const isNew = params.id === 'new';
    const [categories, setCategories] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'fr' | 'en' | 'ar'>('fr');
    const [post, setPost] = useState<any>({
        slug: '', titleFr: '', titleEn: '', titleAr: '', excerptFr: '', excerptEn: '', excerptAr: '',
        contentFr: '', contentEn: '', contentAr: '', tags: '', status: 'DRAFT', readTime: 5,
        categoryId: '', metaTitleFr: '', metaTitleEn: '', metaTitleAr: '', metaDescFr: '', metaDescEn: '', metaDescAr: '',
        featuredImage: '', imageAlt: '',
    });

    useEffect(() => {
        fetch('/api/admin/categories').then(r => r.json()).then(setCategories);
        if (!isNew) fetch(`/api/admin/posts/${params.id}`).then(r => r.json()).then(setPost);
    }, [isNew, params.id]);

    const save = async (status?: string) => {
        setError('');
        setSaving(true);
        try {
            const data = { ...post, authorId: (session?.user as any)?.id, ...(status ? { status } : {}) };
            const url = isNew ? '/api/admin/posts' : `/api/admin/posts/${params.id}`;
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            if (res.ok) {
                router.push('/admin/blog');
            } else {
                const body = await res.json();
                setError(body.error || 'Failed to save. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const t = tab.charAt(0).toUpperCase() + tab.slice(1);

    return (
        <div style={{ maxWidth: 980 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>{isNew ? 'New Post' : 'Edit Post'}</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => router.push('/admin/blog')} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#888', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                    {post.slug && !isNew && (
                        <a href={`/${tab}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: 'pointer', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>👁 Preview</a>
                    )}
                    <button onClick={() => save('DRAFT')} disabled={saving} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#ccc', cursor: 'pointer', fontSize: 13 }}>Save Draft</button>
                    <button onClick={() => save('PUBLISHED')} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Publish'}</button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14, marginBottom: 24 }}>
                    {error}
                </div>
            )}

            {/* Language Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {(['fr', 'en', 'ar'] as const).map(l => (
                    <button key={l} onClick={() => setTab(l)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid', borderColor: tab === l ? '#8b5cf6' : 'rgba(255,255,255,0.08)', background: tab === l ? 'rgba(139,92,246,0.15)' : 'transparent', color: tab === l ? '#8b5cf6' : '#888', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                        {l === 'fr' ? '🇫🇷 Français' : l === 'en' ? '🇬🇧 English' : '🇲🇦 العربية'}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
                {/* Main Content */}
                <div>
                    <div style={{ padding: 28, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', marginBottom: 24 }}>
                        <label style={labelStyle}>Title ({tab.toUpperCase()})</label>
                        <input value={post[`title${t}`] || ''} onChange={e => setPost({ ...post, [`title${t}`]: e.target.value })} placeholder="Post title" style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }} />

                        <label style={labelStyle}>Excerpt ({tab.toUpperCase()})</label>
                        <textarea value={post[`excerpt${t}`] || ''} onChange={e => setPost({ ...post, [`excerpt${t}`]: e.target.value })} placeholder="Short summary..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />

                        <label style={{ ...labelStyle, marginBottom: 0 }}>Content ({tab.toUpperCase()})</label>
                        <p style={{ color: '#555', fontSize: 11, marginBottom: 10 }}>Use the toolbar to format text. Click 📷 Add Image to upload images directly into the post.</p>
                        <RichEditor
                            key={tab}
                            value={post[`content${t}`] || ''}
                            onChange={v => setPost((p: any) => ({ ...p, [`content${t}`]: v }))}
                            placeholder={`Write your ${tab.toUpperCase()} content here... You can paste images too!`}
                        />
                    </div>

                    {/* SEO */}
                    <div style={{ padding: 28, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 20 }}>🔍 SEO Settings</h3>
                        <label style={labelStyle}>Meta Title ({tab.toUpperCase()})</label>
                        <input value={post[`metaTitle${t}`] || ''} onChange={e => setPost({ ...post, [`metaTitle${t}`]: e.target.value })} placeholder="SEO title" style={inputStyle} />
                        <label style={labelStyle}>Meta Description ({tab.toUpperCase()})</label>
                        <textarea value={post[`metaDesc${t}`] || ''} onChange={e => setPost({ ...post, [`metaDesc${t}`]: e.target.value })} placeholder="SEO description" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <div style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', marginBottom: 20 }}>
                        <label style={labelStyle}>URL Slug</label>
                        <input value={post.slug} onChange={e => setPost({ ...post, slug: e.target.value })} placeholder="post-url-slug" style={inputStyle} />

                        <label style={labelStyle}>Category</label>
                        <select value={post.categoryId || ''} onChange={e => setPost({ ...post, categoryId: e.target.value || null })} style={{ ...inputStyle, appearance: 'none' }}>
                            <option value="">No category</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nameFr}</option>)}
                        </select>

                        <label style={labelStyle}>Tags (comma-separated)</label>
                        <input value={post.tags} onChange={e => setPost({ ...post, tags: e.target.value })} placeholder="seo, marketing, digital" style={inputStyle} />

                        <label style={labelStyle}>Read Time (min)</label>
                        <input type="number" value={post.readTime} onChange={e => setPost({ ...post, readTime: parseInt(e.target.value) || 5 })} style={inputStyle} />
                    </div>

                    <div style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', marginBottom: 20 }}>
                        <label style={labelStyle}>Featured Image</label>
                        <p style={{ color: '#555', fontSize: 11, marginBottom: 8 }}>Upload or paste a URL</p>
                        <FeaturedImageUpload
                            value={post.featuredImage || ''}
                            onChange={url => setPost({ ...post, featuredImage: url })}
                        />
                        <label style={{ ...labelStyle, marginTop: 12 }}>Image Alt Text</label>
                        <input value={post.imageAlt || ''} onChange={e => setPost({ ...post, imageAlt: e.target.value })} placeholder="Describe the image" style={inputStyle} />
                    </div>

                    <div style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                        <label style={labelStyle}>Status</label>
                        <select value={post.status} onChange={e => setPost({ ...post, status: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Featured Image Upload ───────────────────────────────────────────────────
function FeaturedImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('altText', file.name.replace(/\.[^.]+$/, ''));
            const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
            if (res.ok) { const m = await res.json(); onChange(m.url); }
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div>
            <div
                onClick={() => fileRef.current?.click()}
                style={{ border: '2px dashed rgba(139,92,246,0.3)', borderRadius: 10, padding: 16, cursor: 'pointer', textAlign: 'center', background: 'rgba(139,92,246,0.03)', marginBottom: 8 }}
            >
                {value
                    ? <img src={value} alt="" style={{ width: '100%', borderRadius: 8, maxHeight: 140, objectFit: 'cover' }} />
                    : <div style={{ color: '#666', fontSize: 12 }}>{uploading ? '⏳ Uploading...' : '📷 Click to upload featured image'}</div>
                }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
            <input value={value} onChange={e => onChange(e.target.value)} placeholder="Or paste image URL..." style={{ ...inputStyle, marginBottom: 0, fontSize: 12 }} />
        </div>
    );
}
