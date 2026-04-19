import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct } from '../api/client'
import { Badge, Modal, fmt, Spinner } from '../components/UI'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  useEffect(() => { getProducts().then(setProducts).finally(() => setLoading(false)) }, [])

  const saved = (p) => {
    setProducts(prev => prev.find(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p])
    setModal(null)
    toast.success('Product saved')
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New product</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>SKU</th><th>Name</th><th>Category</th><th>Size</th><th>Handle</th><th>UOM</th><th>Base price</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="mono">{p.sku}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className="tag">{p.category}</span></td>
                  <td className="text-muted">{p.size}</td>
                  <td><span className="tag">{p.handle}</span></td>
                  <td className="text-muted">{p.uom}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>{fmt(p.basePrice)}</td>
                  <td><Badge status={p.status} /></td>
                  <td><button className="btn btn-sm" onClick={() => setModal(p)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && <ProductModal initial={modal === true ? null : modal} onSave={saved} onClose={() => setModal(null)} />}
    </div>
  )
}

function ProductModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    sku: '', name: '', category: '', size: '', handle: 'None', uom: 'Pcs', basePrice: '', status: 'ACTIVE',
    ...initial,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.sku || !form.name) { toast.error('SKU and name are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, basePrice: parseFloat(form.basePrice) || 0 }
      const result = initial?.id ? await updateProduct(initial.id, payload) : await createProduct(payload)
      onSave(result)
    } finally { setSaving(false) }
  }

  return (
    <Modal title={initial?.id ? 'Edit product' : 'New product'} onClose={onClose}>
      <div className="form-grid-3">
        <div className="field"><label>SKU *</label><input value={form.sku} onChange={e => set('sku', e.target.value)} /></div>
        <div className="field"><label>Product name *</label><input value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div className="field"><label>Category</label><input value={form.category || ''} onChange={e => set('category', e.target.value)} /></div>
        <div className="field"><label>Size</label><input value={form.size || ''} onChange={e => set('size', e.target.value)} placeholder="e.g. 12x15 inch" /></div>
        <div className="field"><label>Handle</label>
          <select value={form.handle} onChange={e => set('handle', e.target.value)}>
            <option>Loop</option><option>D-cut</option><option>None</option><option>Other</option>
          </select>
        </div>
        <div className="field"><label>UOM</label>
          <select value={form.uom} onChange={e => set('uom', e.target.value)}>
            <option>Pcs</option><option>Kg</option><option>Bundle</option>
          </select>
        </div>
        <div className="field"><label>Base price (₹)</label><input type="number" step="0.01" value={form.basePrice || ''} onChange={e => set('basePrice', e.target.value)} /></div>
        <div className="field"><label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : (initial?.id ? 'Update' : 'Save product')}</button>
      </div>
    </Modal>
  )
}
