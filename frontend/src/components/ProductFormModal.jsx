import { useState, useRef } from 'react';
import { api } from '../lib/api';

export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);

  // Parse existing images
  const existingImages = (() => {
    if (!isEdit) return [];
    try {
      const parsed = Array.isArray(product.images)
        ? product.images
        : JSON.parse(product.images || '[]');
      return parsed.length > 0 ? parsed : (product.image_url ? [product.image_url] : []);
    } catch {
      return product.image_url ? [product.image_url] : [];
    }
  })();

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'skin');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [keptImages, setKeptImages] = useState(existingImages); // existing images to keep
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  function handleNewFiles(e) {
    const files = Array.from(e.target.files).slice(0, 10);
    setNewFiles(files);
    setNewPreviews(files.map(f => URL.createObjectURL(f)));
  }

  function removeNewFile(i) {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i));
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i));
  }

  function removeExistingImage(i) {
    setKeptImages(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('featured', featured);

    if (newFiles.length > 0) {
      // New files uploaded — they replace existing
      newFiles.forEach(f => formData.append('images', f));
    } else if (isEdit) {
      // Pass the kept images so backend can filter out removed ones
      formData.append('keep_images', JSON.stringify(keptImages));
    }

    try {
      if (isEdit) {
        await api.updateProduct(product.id, formData);
      } else {
        await api.createProduct(formData);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        <h3 className="display">{isEdit ? 'Edit product' : 'Add a product'}</h3>

        {error && <p className="form-error">{error}</p>}

        <div className="field">
          <label htmlFor="name">Product name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="skin">Skincare</option>
              <option value="hair">Haircare</option>
              <option value="perfumes">Perfumes</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="price">Price (Rs)</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
          <div className="field checkbox-field">
            <label htmlFor="featured">Featured</label>
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Existing images (edit mode only) */}
        {isEdit && existingImages.length > 0 && (
          <div className="field">
            <label>Current images {keptImages.length === 0 ? '(all removed)' : `(${keptImages.length} kept)`}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {existingImages.map((src, i) => {
                const imgSrc = src.startsWith('http') ? src : `${api.base}${src}`;
                const kept = keptImages.includes(src);
                return (
                  <div key={i} style={{ position: 'relative', opacity: kept ? 1 : 0.35 }}>
                    <img src={imgSrc} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `2px solid ${kept ? 'var(--border)' : '#ef4444'}` }} />
                    <button
                      type="button"
                      onClick={() => kept ? removeExistingImage(existingImages.indexOf(src)) : setKeptImages(prev => [...prev, src])}
                      title={kept ? 'Remove this image' : 'Restore this image'}
                      style={{ position: 'absolute', top: -6, right: -6, background: kept ? '#ef4444' : '#16a34a', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >
                      {kept ? '✕' : '↩'}
                    </button>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '6px 0 0' }}>Click ✕ to remove an image. Upload new images below to replace all.</p>
          </div>
        )}

        {/* New image uploads */}
        <div className="field">
          <label>
            {isEdit ? 'Upload new images (replaces all existing)' : 'Product images'}
          </label>
          <button type="button" className="btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 13, marginBottom: newPreviews.length ? 8 : 0 }} onClick={() => fileRef.current?.click()}>
            📎 Choose images
          </button>
          <input ref={fileRef} id="image" type="file" accept="image/png, image/jpeg, image/webp" multiple style={{ display: 'none' }} onChange={handleNewFiles} />
          {newPreviews.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {newPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  <button type="button" onClick={() => removeNewFile(i)}
                    style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-primary submit-btn" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
        </button>
      </form>

      <style>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(30,23,48,0.45);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 20px;
          overflow-y: auto;
          z-index: 50;
        }
        .modal {
          background: #fff;
          border-radius: 20px;
          padding: 34px 30px;
          width: 100%;
          max-width: 460px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .close {
          position: absolute;
          top: 14px;
          right: 16px;
          background: none;
          border: none;
          font-size: 26px;
          color: var(--ink-soft);
          cursor: pointer;
        }
        .modal h3 { font-size: 22px; margin-bottom: 20px; }
        .form-error {
          background: #FBE7E9;
          color: #93303F;
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .checkbox-field { flex-direction: row; align-items: center; gap: 10px; }
        .checkbox-field input { width: 18px; height: 18px; }
        .submit-btn { width: 100%; margin-top: 6px; }
      `}</style>
    </div>
  );
}
