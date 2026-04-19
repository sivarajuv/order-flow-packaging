import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPayments, createPayment, getClients, getInvoices } from '../api/client'
import { Badge, Modal, fmt, today, Spinner, PrintIcon } from '../components/UI'
import { printPayments } from '../components/PrintTemplates'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    getPayments().then(setPayments).finally(() => setLoading(false))
    if (loc.state?.clientId) setShowModal(true)
  }, [])

  const saved = p => {
    setPayments(prev => [p, ...prev])
    setShowModal(false)
    toast.success(`Payment ${p.paymentRef} recorded`)
  }

  if (loading) return <Spinner />

  const totalReceived = payments.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <div className="page-actions">
          {payments.length > 0 && (
            <button className="btn" onClick={() => printPayments(payments)} title="Print all payments">
              <PrintIcon /> Print
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record payment</button>
        </div>
      </div>

      {payments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          <div className="metric-card">
            <div className="metric-label">Total payments</div>
            <div className="metric-value">{payments.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total received</div>
            <div className="metric-value" style={{ color: 'var(--green)' }}>{fmt(totalReceived)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Last payment</div>
            <div className="metric-value" style={{ fontSize: 14 }}>{payments[0]?.paymentDate || '—'}</div>
            <div className="metric-sub">{payments[0]?.clientName}</div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ref</th><th>Client</th><th>Date</th><th>Mode</th>
                <th>Amount</th><th>Allocated to</th><th>Bank ref</th><th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!payments.length
                ? <tr><td colSpan={9} className="empty-state">No payments recorded</td></tr>
                : payments.map(p => (
                  <tr key={p.id}>
                    <td className="mono fw-600">{p.paymentRef}</td>
                    <td style={{ fontWeight: 500 }}>{p.clientName}</td>
                    <td className="text-muted text-small">{p.paymentDate}</td>
                    <td><span className="badge badge-blue">{p.mode}</span></td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt(p.amount)}</td>
                    <td className="mono text-muted" style={{ fontSize: 11 }}>
                      {p.allocations?.map(a => a.invoiceNo).join(', ') || 'Unallocated'}
                    </td>
                    <td className="mono text-muted" style={{ fontSize: 11 }}>{p.bankRef || '—'}</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <button
                        className="btn btn-sm btn-icon"
                        onClick={() => printPayments([p])}
                        title="Print this payment"
                      >
                        <PrintIcon />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {payments.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px', borderTop: '1px solid var(--border)', gap: 24 }}>
            <span className="text-muted text-small">{payments.length} payment{payments.length !== 1 ? 's' : ''}</span>
            <span style={{ fontWeight: 700 }}>Total received: {fmt(totalReceived)}</span>
          </div>
        )}
      </div>

      {showModal && (
        <PaymentModal
          prefillClientId={loc.state?.clientId}
          prefillInvoiceId={loc.state?.invoiceId}
          onSave={saved}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function PaymentModal({ prefillClientId, prefillInvoiceId, onSave, onClose }) {
  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [form, setForm] = useState({ clientId: prefillClientId || '', paymentDate: today(), amount: '', mode: 'NEFT', bankRef: '', notes: '' })
  const [allocations, setAllocations] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getClients(), getInvoices()]).then(([c, inv]) => {
      setClients(c)
      if (!form.clientId && c.length) setForm(f => ({ ...f, clientId: c[0].id }))
      const unpaid = inv.filter(i => i.status !== 'PAID' && (i.balanceDue || 0) > 0)
      setInvoices(unpaid)
      if (prefillInvoiceId) {
        const t = unpaid.find(i => i.id === prefillInvoiceId)
        if (t) setAllocations({ [prefillInvoiceId]: t.balanceDue })
      }
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setAlloc = (iid, v) => setAllocations(a => ({ ...a, [iid]: v }))

  const save = async () => {
    if (!form.clientId || !form.amount) { toast.error('Client and amount required'); return }
    setSaving(true)
    try {
      const allocList = Object.entries(allocations)
        .filter(([, v]) => parseFloat(v) > 0)
        .map(([invoiceId, amount]) => ({ invoiceId: parseInt(invoiceId), amount: parseFloat(amount) }))
      const result = await createPayment({ ...form, clientId: parseInt(form.clientId), amount: parseFloat(form.amount), allocations: allocList })
      onSave(result)
    } catch { } finally { setSaving(false) }
  }

  const totalAlloc = Object.values(allocations).reduce((s, v) => s + (parseFloat(v) || 0), 0)
  const unalloc = (parseFloat(form.amount) || 0) - totalAlloc

  return (
    <Modal title="Record payment" onClose={onClose} wide>
      <div className="form-grid">
        <div className="field"><label>Client *</label>
          <select value={form.clientId} onChange={e => set('clientId', e.target.value)}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Payment date</label>
          <input type="date" value={form.paymentDate} onChange={e => set('paymentDate', e.target.value)} />
        </div>
        <div className="field"><label>Amount received (₹) *</label>
          <input type="number" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} />
        </div>
        <div className="field"><label>Mode</label>
          <select value={form.mode} onChange={e => set('mode', e.target.value)}>
            <option>NEFT</option><option>RTGS</option><option>Cheque</option><option>Cash</option><option>UPI</option>
          </select>
        </div>
        <div className="field"><label>Bank / UTR ref.</label>
          <input value={form.bankRef} onChange={e => set('bankRef', e.target.value)} />
        </div>
        <div className="field"><label>Notes</label>
          <input value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="section-divider">Allocate to invoices</div>
      <table className="line-table">
        <thead><tr><th>Invoice</th><th>Client</th><th>Total</th><th>Balance</th><th style={{ width: 110 }}>Allocate (₹)</th></tr></thead>
        <tbody>
          {invoices.filter(i => (i.balanceDue || 0) > 0).map(inv => (
            <tr key={inv.id}>
              <td className="mono">{inv.invoiceNo}</td>
              <td style={{ fontSize: 11 }}>{inv.clientName}</td>
              <td>{fmt(inv.total)}</td>
              <td style={{ color: 'var(--amber)' }}>{fmt(inv.balanceDue)}</td>
              <td><input type="number" step="0.01" value={allocations[inv.id] || ''} onChange={e => setAlloc(inv.id, e.target.value)} max={inv.balanceDue} /></td>
            </tr>
          ))}
          {!invoices.length && <tr><td colSpan={5} className="empty-state">No pending invoices</td></tr>}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, fontSize: 12, marginTop: 8 }}>
        <span className="text-muted">Payment: {fmt(parseFloat(form.amount) || 0)}</span>
        <span className="text-muted">Allocated: {fmt(totalAlloc)}</span>
        <span style={{ fontWeight: 600, color: unalloc < 0 ? 'var(--red)' : unalloc > 0 ? 'var(--amber)' : 'var(--green)' }}>
          Unallocated: {fmt(unalloc)}
        </span>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save payment'}</button>
      </div>
    </Modal>
  )
}
