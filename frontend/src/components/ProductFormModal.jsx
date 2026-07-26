import { useState } from 'react';
import { api } from '../lib/api';

export default function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'skin');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
    files.forEach(f => formData.append('images', f));

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

        <div className="field">
          <label htmlFor="image">Product images {isEdit && '(leave empty to keep current)'}</label>
          <input
            id="image"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
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
        }
        .close {
          position: absolute;
          top: 14px;
          right: 16px;
          background: none;
          border: none;
          font-size: 26px;
          color: var(--ink-soft);
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
