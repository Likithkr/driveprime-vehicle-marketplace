import { useRef, useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';

export default function ImageUploader({ images = [], onChange }) {
    const inputRef = useRef();
    const [dragging, setDragging] = useState(false);

    const processFiles = (files) => {
        const newImages = [];
        [...files].forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                newImages.push(e.target.result);
                if (newImages.length === files.length) {
                    onChange([...images, ...newImages]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFiles = (e) => processFiles(e.target.files);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const removeImage = (idx) => {
        const updated = images.filter((_, i) => i !== idx);
        onChange(updated);
    };

    return (
        <div>
            {/* Drop zone */}
            <div
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragging ? 'rgba(249,115,22,0.05)' : '#fafafa',
                    transition: 'var(--transition)',
                }}
            >
                <FiUpload size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Drop images here or click to upload</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP — multiple allowed</p>
                <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleFiles} style={{ display: 'none' }} />
            </div>

            {/* Preview grid */}
            {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
                    {images.map((src, i) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius)', overflow: 'hidden', border: i === 0 ? '2px solid var(--primary)' : '2px solid var(--border)' }}>
                            <img src={src} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {i === 0 && (
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(249,115,22,0.85)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', padding: '3px' }}>
                                    Cover
                                </div>
                            )}
                            <button onClick={() => removeImage(i)}
                                style={{
                                    position: 'absolute', top: '6px', right: '6px',
                                    background: 'rgba(220,38,38,0.9)', color: '#fff',
                                    borderRadius: '50%', width: '22px', height: '22px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', border: 'none',
                                }}>
                                <FiX size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
