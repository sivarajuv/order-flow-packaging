import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getOrders, getOrder, createOrder, updateOrder, updateOrderStatus,
  updateOrderLine, getClients, getClientProducts, createInvoice,
} from '../api/client'
import { Badge, GstBadge, Modal, DetailRow, fmt, fmtN, today, addDays, Spinner, PrintIcon } from '../components/UI'
import { printOrder } from '../components/PrintTemplates'

export function OrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    getOrders().then(o => setOrders([...o].reverse())).finally(() => setLoading(false))
  }, [])

  const created = o => {
    setOrders(p => [o, ...p])
    setShowCreate(false)
    toast.success(`${o.orderNo} created`)
    nav(`/orders/${o.id}`)
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Sales orders</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New order</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Order no.</th><th>Client</th><th>Salesperson</th><th>Order date</th><th>Delivery date</th><th>Lines</th><th>Total</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="clickable" onClick={() => nav(`/orders/${o.id}`)}>
                  <td className="mono fw-600">{o.orderNo}</td>
                  <td style={{ fontWeight: 500 }}>{o.clientName}</td>
                  <td className="text-muted">{o.salesperson}</td>
                  <td className="text-muted text-small">{o.orderDate}</td>
                  <td className="text-muted text-small">{o.deliveryDate || '-'}</td>
                  <td className="text-muted">{o.lines?.length ?? 0}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(o.subtotal)}</td>
                  <td><Badge status={o.status} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-primary" onClick={() => nav(`/orders/${o.id}`)} title="Edit order">
                        Edit
                      </button>
                      <button className="btn btn-sm btn-icon" onClick={() => printOrder(o)} title="Print">
                        <PrintIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showCreate && <CreateOrderModal onSave={created} onClose={() => setShowCreate(false)} />}
    </div>
  )
}

export function OrderDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [order, setOrder] = useState(null)
  const [editHeader, setEditHeader] = useState(false)
  const [headerForm, setHeaderForm] = useState({})
  const [editLineId, setEditLineId] = useState(null)
  const [lineForm, setLineForm] = useState({})
  const [showInvoice, setShowInvoice] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => getOrder(id).then(o => {
    setOrder(o)
    setHeaderForm({ orderDate: o.orderDate || '', deliveryDate: o.deliveryDate || '', notes: o.notes || '' })
  })

  useEffect(() => { load() }, [id])

  const saveHeader = async () => {
    setSaving(true)
    try {
      const u = await updateOrder(id, headerForm)
      setOrder(u)
      setEditHeader(false)
      toast.success('Saved')
    } finally {
      setSaving(false)
    }
  }

  const startEditLine = l => {
    setEditLineId(l.id)
    setLineForm({
      qty: l.orderedQty ?? l.qty,
      salesQty: l.salesQty ?? l.qty,
      unitPrice: l.unitPrice,
      discount: l.discount ?? 0,
      spec: l.spec || '',
    })
  }

  const cancelEditLine = () => {
    setEditLineId(null)
    setLineForm({})
  }

  const saveLine = async lineId => {
    setSaving(true)
    try {
      const u = await updateOrderLine(id, lineId, {
        qty: parseInt(lineForm.qty),
        salesQty: parseInt(lineForm.salesQty),
        unitPrice: parseFloat(lineForm.unitPrice),
        discount: parseFloat(lineForm.discount || 0),
        spec: lineForm.spec,
      })
      setOrder(u)
      setEditLineId(null)
      toast.success('Line updated')
    } finally {
      setSaving(false)
    }
  }

  const startProduction = async () => {
    const u = await updateOrderStatus(id, 'IN_PRODUCTION')
    setOrder(u)
    toast.success('Job cards activated')
  }

  const invoiceCreated = inv => {
    toast.success(`Invoice ${inv.invoiceNo} created`)
    setShowInvoice(false)
    load()
    nav(`/invoices/${inv.id}`)
  }

  if (!order) return <Spinner />

  const total = order.subtotal || 0
  const canEdit = ['NEW', 'IN_PRODUCTION'].includes(order.status)

  return (
    <div className="page">
      <div className="breadcrumb"><a onClick={() => nav('/orders')}>Sales orders</a><span>/</span><span>{order.orderNo}</span></div>
      <div className="page-header">
        <h1 className="page-title">{order.orderNo}</h1>
        <div className="page-actions">
          {!editHeader && canEdit && <button className="btn" onClick={() => setEditHeader(true)}>Edit header</button>}
          {editHeader && <>
            <button className="btn btn-primary" onClick={saveHeader} disabled={saving}>{saving ? 'Saving...' : 'Save header'}</button>
            <button className="btn" onClick={() => setEditHeader(false)}>Cancel</button>
          </>}
          <button className="btn btn-icon" onClick={() => printOrder(order)} title="Print order"><PrintIcon /></button>
          {order.status === 'NEW' && !editHeader && <button className="btn" onClick={startProduction}>Start production</button>}
          {order.status === 'IN_PRODUCTION' && !editHeader && <button className="btn btn-primary" onClick={() => setShowInvoice(true)}>Create invoice</button>}
          <Badge status={order.status} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Order info</div>
          <DetailRow label="Order no." value={<span className="mono">{order.orderNo}</span>} />
          <DetailRow label="Client" value={<strong>{order.clientName}</strong>} />
          <DetailRow label="Salesperson" value={order.salesperson} />
          <DetailRow label="GST rate" value={<GstBadge pct={order.clientGstPercent} />} />
          <DetailRow label="Order date" value={
            editHeader
              ? <input className="cell-input" type="date" style={{ width: 140 }} value={headerForm.orderDate} onChange={e => setHeaderForm(f => ({ ...f, orderDate: e.target.value }))} />
              : order.orderDate
          } />
          <DetailRow label="Delivery date" value={
            editHeader
              ? <input className="cell-input" type="date" style={{ width: 140 }} value={headerForm.deliveryDate} onChange={e => setHeaderForm(f => ({ ...f, deliveryDate: e.target.value }))} />
              : order.deliveryDate || '-'
          } />
          <DetailRow label="Notes" value={
            editHeader
              ? <input className="cell-input" style={{ width: 200 }} value={headerForm.notes} onChange={e => setHeaderForm(f => ({ ...f, notes: e.target.value }))} />
              : <span className="text-muted">{order.notes || '-'}</span>
          } />
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Summary</div>
          <div className="amount-summary">
            <div className="amount-row"><span>Order value (excl. GST)</span><span style={{ fontWeight: 700, fontSize: 15 }}>{fmt(total)}</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            {[['Lines', (order.lines?.length ?? 0)], ['Job cards', (order.lines?.filter(l => l.jobCardId).length ?? 0)], ['Status', <Badge status={order.status} />]].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 'var(--r)', padding: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title">Order lines & job cards</div>
          {canEdit && <span style={{ fontSize: 11, color: 'var(--ink3)' }}>Edit ordered qty, sales qty, discount, price, and spec.</span>}
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Product</th>
                <th>Size</th>
                <th>Handle</th>
                <th>Stereo ref</th>
                <th>Spec / notes</th>
                <th style={{ width: 90 }} className="r">Ordered qty</th>
                <th style={{ width: 90 }} className="r">Sales qty</th>
                <th style={{ width: 105 }} className="r">Unit price</th>
                <th style={{ width: 90 }} className="r">Discount %</th>
                <th style={{ width: 110 }} className="r">Line total</th>
                <th>Job card</th>
                {canEdit && <th style={{ width: 80 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(order.lines || []).map((l, i) => {
                const isEditing = editLineId === l.id
                return (
                  <tr key={l.id} className={isEditing ? 'row-edit-active' : ''}>
                    <td className="text-muted">{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{l.productName}</td>
                    <td className="text-muted">{l.size}</td>
                    <td><span className="tag">{l.handle}</span></td>
                    <td className="mono text-muted" style={{ fontSize: 11 }}>{l.stereoRef || '-'}</td>
                    <td>
                      {isEditing
                        ? <input className="cell-input" value={lineForm.spec} onChange={e => setLineForm(f => ({ ...f, spec: e.target.value }))} style={{ minWidth: 140 }} />
                        : <span className="text-muted">{l.spec || '-'}</span>}
                    </td>
                    <td className="r">
                      {isEditing
                        ? <input className="cell-input" type="number" min="1" value={lineForm.qty} onChange={e => setLineForm(f => ({ ...f, qty: e.target.value }))} style={{ width: 75, textAlign: 'right' }} />
                        : <span style={{ fontWeight: 500 }}>{fmtN(l.orderedQty ?? l.qty)}</span>}
                    </td>
                    <td className="r">
                      {isEditing
                        ? <input className="cell-input" type="number" min="1" value={lineForm.salesQty} onChange={e => setLineForm(f => ({ ...f, salesQty: e.target.value }))} style={{ width: 75, textAlign: 'right' }} />
                        : <span style={{ fontWeight: 500 }}>{fmtN(l.salesQty ?? l.qty)}</span>}
                    </td>
                    <td className="r">
                      {isEditing
                        ? <input className="cell-input" type="number" step="0.01" value={lineForm.unitPrice} onChange={e => setLineForm(f => ({ ...f, unitPrice: e.target.value }))} style={{ width: 90, textAlign: 'right' }} />
                        : <span className="mono">{fmt(l.unitPrice)}</span>}
                    </td>
                    <td className="r">
                      {isEditing
                        ? <input className="cell-input" type="number" min="0" max="100" step="0.01" value={lineForm.discount} onChange={e => setLineForm(f => ({ ...f, discount: e.target.value }))} style={{ width: 80, textAlign: 'right' }} />
                        : <span>{Number(l.discount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}%</span>}
                    </td>
                    <td className="r fw-700">
                      {isEditing
                        ? fmt(((parseInt(lineForm.salesQty) || 0) * (parseFloat(lineForm.unitPrice) || 0)) * (1 - ((parseFloat(lineForm.discount) || 0) / 100)))
                        : fmt(l.lineTotal)}
                    </td>
                    <td>
                      {l.jobCardId
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <a className="mono" style={{ color: 'var(--blue-txt)', cursor: 'pointer', fontSize: 11 }} onClick={() => nav(`/jobcards/${l.jobCardId}`)}>{l.jobCardNo}</a>
                            {l.jobCardStatus && <Badge status={l.jobCardStatus} />}
                          </span>
                        : <span className="text-muted">-</span>}
                    </td>
                    {canEdit && (
                      <td>
                        {isEditing
                          ? <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-sm btn-success" onClick={() => saveLine(l.id)} disabled={saving}>{saving ? '...' : 'Save'}</button>
                              <button className="btn btn-sm" onClick={cancelEditLine}>Cancel</button>
                            </div>
                          : <button className="btn btn-sm" onClick={() => startEditLine(l)} title="Edit line">Edit</button>}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Order total (excl. GST): <span style={{ marginLeft: 8 }}>{fmt(total)}</span></div>
        </div>
      </div>

      {showInvoice && <CreateInvoiceModal order={order} onSave={invoiceCreated} onClose={() => setShowInvoice(false)} />}
    </div>
  )
}

function CreateOrderModal({ onSave, onClose }) {
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')
  const [cps, setCps] = useState([])
  const [form, setForm] = useState({ orderDate: today(), deliveryDate: '', notes: '' })
  const [lines, setLines] = useState([{ _id: 1, cpId: '', qty: 1000, salesQty: 1000, unitPrice: '', discount: 0, spec: '' }])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getClients().then(c => {
      const a = c.filter(x => x.status === 'ACTIVE')
      setClients(a)
      if (a.length) setClientId(String(a[0].id))
    })
  }, [])

  useEffect(() => {
    if (!clientId) return
    getClientProducts(clientId).then(p => {
      setCps(p)
      setLines([{ _id: 1, cpId: String(p[0]?.id || ''), qty: 1000, salesQty: 1000, unitPrice: p[0]?.agreedPrice || '', discount: 0, spec: '' }])
    })
  }, [clientId])

  const addLine = () => setLines(l => [...l, { _id: Date.now(), cpId: String(cps[0]?.id || ''), qty: 1000, salesQty: 1000, unitPrice: cps[0]?.agreedPrice || '', discount: 0, spec: '' }])
  const removeLine = _id => setLines(l => l.filter(x => x._id !== _id))
  const updateLine = (_id, k, v) => setLines(l => l.map(x => {
    if (x._id !== _id) return x
    const u = { ...x, [k]: v }
    if (k === 'cpId') {
      const cp = cps.find(c => String(c.id) === String(v))
      if (cp) u.unitPrice = cp.agreedPrice
    }
    return u
  }))

  const lineTotal = lines.reduce((s, l) => {
    const gross = (parseFloat(l.salesQty) || 0) * (parseFloat(l.unitPrice) || 0)
    return s + gross * (1 - ((parseFloat(l.discount) || 0) / 100))
  }, 0)

  const save = async () => {
    if (!clientId) { toast.error('Select a client'); return }
    const valid = lines.filter(l => l.cpId && parseInt(l.qty) > 0 && parseInt(l.salesQty) > 0 && parseFloat(l.unitPrice) >= 0)
    if (!valid.length) { toast.error('Add at least one line item'); return }
    setSaving(true)
    try {
      const result = await createOrder({
        clientId: parseInt(clientId),
        orderDate: form.orderDate,
        deliveryDate: form.deliveryDate || null,
        notes: form.notes,
        lines: valid.map(l => ({
          clientProductId: parseInt(l.cpId),
          qty: parseInt(l.qty),
          salesQty: parseInt(l.salesQty),
          unitPrice: parseFloat(l.unitPrice),
          discount: parseFloat(l.discount || 0),
          spec: l.spec || '',
        })),
      })
      onSave(result)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="New sales order" onClose={onClose} wide>
      <div className="form-grid">
        <div className="field"><label>Client *</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
          </select>
        </div>
        <div className="field"><label>Order date</label><input type="date" value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} /></div>
        <div className="field"><label>Delivery date</label><input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
        <div className="field"><label>Notes</label><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
      </div>
      <div className="section-divider">Order lines</div>
      {!cps.length && clientId && (
        <div style={{ background: 'var(--amber-bg)', color: 'var(--amber-txt)', padding: '8px 12px', borderRadius: 'var(--r)', marginBottom: 10, fontSize: 12 }}>
          No products mapped to this client. Add products from the client page first.
        </div>
      )}
      <table className="line-table">
        <thead>
          <tr><th style={{ width: 30 }}>#</th><th>Product</th><th>Spec / notes</th><th style={{ width: 90 }}>Ordered qty</th><th style={{ width: 90 }}>Sales qty</th><th style={{ width: 110 }}>Unit price (Rs)</th><th style={{ width: 90 }}>Discount %</th><th style={{ width: 105 }}>Total</th><th style={{ width: 36 }}></th></tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={l._id}>
              <td style={{ color: 'var(--ink3)' }}>{i + 1}</td>
              <td>
                <select value={l.cpId} onChange={e => updateLine(l._id, 'cpId', e.target.value)}>
                  {!cps.length && <option value="">- no products -</option>}
                  {cps.map(cp => <option key={cp.id} value={cp.id}>{cp.productName} - {cp.size} - {cp.handle} @ {fmt(cp.agreedPrice)}</option>)}
                </select>
              </td>
              <td><input value={l.spec} onChange={e => updateLine(l._id, 'spec', e.target.value)} placeholder="Spec / notes" /></td>
              <td><input type="number" min="1" value={l.qty} onChange={e => updateLine(l._id, 'qty', e.target.value)} /></td>
              <td><input type="number" min="1" value={l.salesQty} onChange={e => updateLine(l._id, 'salesQty', e.target.value)} /></td>
              <td><input type="number" step="0.01" value={l.unitPrice} onChange={e => updateLine(l._id, 'unitPrice', e.target.value)} /></td>
              <td><input type="number" min="0" max="100" step="0.01" value={l.discount} onChange={e => updateLine(l._id, 'discount', e.target.value)} /></td>
              <td style={{ fontWeight: 600, fontSize: 12 }}>{l.salesQty && l.unitPrice ? fmt((parseFloat(l.salesQty) * parseFloat(l.unitPrice)) * (1 - ((parseFloat(l.discount) || 0) / 100))) : '-'}</td>
              <td>{lines.length > 1 && <button className="btn btn-sm btn-danger" onClick={() => removeLine(l._id)}>X</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="add-line-btn" onClick={addLine}>+ Add line</div>
      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        Order total (excl. GST): {fmt(lineTotal)}
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving || !cps.length}>{saving ? 'Creating...' : 'Create order & job cards'}</button>
      </div>
    </Modal>
  )
}

function CreateInvoiceModal({ order, onSave, onClose }) {
  const [form, setForm] = useState({ invoiceDate: today(), dueDate: addDays(today(), 30), gstOverride: '' })
  const [saving, setSaving] = useState(false)
  const effectiveGst = form.gstOverride !== '' ? parseInt(form.gstOverride) : (order.clientGstPercent || 0)
  const lines = order.lines || []
  const discountTotal = lines.reduce((s, l) => s + (l.discountAmount || 0), 0)
  const subtotal = lines.reduce((s, l) => s + (l.taxableAmount || 0), 0)
  const tax = subtotal * effectiveGst / 100
  const total = subtotal + tax

  const save = async () => {
    setSaving(true)
    try {
      const inv = await createInvoice({
        orderId: order.id,
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate,
        gstOverride: form.gstOverride !== '' ? parseInt(form.gstOverride) : null,
      })
      onSave(inv)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`Create invoice - ${order.orderNo}`} onClose={onClose}>
      <p style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 14 }}>Client: <strong>{order.clientName}</strong> | Default GST: <strong>{order.clientGstPercent}%</strong></p>
      <div className="form-grid">
        <div className="field"><label>Invoice date</label><input type="date" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} /></div>
        <div className="field"><label>Due date</label><input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
        <div className="field field-full"><label>GST rate override</label>
          <select value={form.gstOverride} onChange={e => setForm(f => ({ ...f, gstOverride: e.target.value }))}>
            <option value="">Use client default ({order.clientGstPercent}%)</option>
            <option value="0">0% - GST exempt</option>
            <option value="5">5%</option>
            <option value="18">18%</option>
          </select>
        </div>
      </div>
      <div className="section-divider" style={{ marginTop: 10 }}>Preview</div>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
          <th style={{ textAlign: 'left', padding: '4px 0', color: 'var(--ink2)', fontSize: 10, fontWeight: 600 }}>Product</th>
          <th style={{ textAlign: 'right', padding: '4px 0', color: 'var(--ink2)', fontSize: 10, fontWeight: 600 }}>Ordered</th>
          <th style={{ textAlign: 'right', padding: '4px 0', color: 'var(--ink2)', fontSize: 10, fontWeight: 600 }}>Sales</th>
          <th style={{ textAlign: 'right', padding: '4px 0', color: 'var(--ink2)', fontSize: 10, fontWeight: 600 }}>Rate</th>
          <th style={{ textAlign: 'right', padding: '4px 0', color: 'var(--ink2)', fontSize: 10, fontWeight: 600 }}>Discount</th>
          <th style={{ textAlign: 'right', padding: '4px 0', color: 'var(--ink2)', fontSize: 10, fontWeight: 600 }}>Amount</th>
        </tr></thead>
        <tbody>
          {lines.map(l => <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '5px 0' }}>{l.productName}</td>
            <td style={{ textAlign: 'right', padding: '5px 0', color: 'var(--ink2)' }}>{fmtN(l.orderedQty ?? l.qty)}</td>
            <td style={{ textAlign: 'right', padding: '5px 0', color: 'var(--ink2)' }}>{fmtN(l.salesQty ?? l.qty)}</td>
            <td style={{ textAlign: 'right', padding: '5px 0', color: 'var(--ink2)' }}>{fmt(l.unitPrice)}</td>
            <td style={{ textAlign: 'right', padding: '5px 0', color: 'var(--ink2)' }}>{Number(l.discount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}%</td>
            <td style={{ textAlign: 'right', padding: '5px 0', fontWeight: 600 }}>{fmt(l.taxableAmount)}</td>
          </tr>)}
        </tbody>
      </table>
      <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '10px 12px', marginTop: 8, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span className="text-muted">Discount</span><span>{fmt(discountTotal)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span className="text-muted">Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span className="text-muted">GST {effectiveGst}%</span><span>{fmt(tax)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, borderTop: '1px solid var(--border)', marginTop: 5, paddingTop: 6 }}><span>Total</span><span>{fmt(total)}</span></div>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Creating...' : 'Create invoice'}</button>
      </div>
    </Modal>
  )
}
