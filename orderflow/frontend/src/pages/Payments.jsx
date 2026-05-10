import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPayments, createPayment, getClients } from '../api/client'
import { Badge, Modal, fmt, today, Spinner, PrintIcon } from '../components/UI'
import { printPayments } from '../components/PrintTemplates'

const sortClientsByName = list => [...list].sort((a, b) =>
  String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' })
)

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [query, setQuery] = useState('')
  const [modeFilter, setModeFilter] = useState('ALL')
  const loc = useLocation()

  useEffect(() => {
    Promise.all([getPayments(), getClients()])
      .then(([paymentList, clientList]) => {
        setPayments(paymentList)
        setClients(sortClientsByName(clientList.filter(c => c.status === 'ACTIVE')))
        if (loc.state?.clientId) setSelectedClientId(String(loc.state.clientId))
      })
      .finally(() => setLoading(false))
    if (loc.state?.clientId) setShowModal(true)
  }, [loc.state])

  const saved = p => {
    setPayments(prev => [p, ...prev])
    setShowModal(false)
    toast.success(`Payment ${p.paymentRef} recorded`)
  }

  if (loading) return <Spinner />

  const hasClientSelection = Boolean(selectedClientId)
  const filteredPayments = payments.filter(p => {
    if (!hasClientSelection || String(p.clientId) !== String(selectedClientId)) return false
    const text = query.trim().toLowerCase()
    const matchesQuery = !text || [p.paymentRef, p.clientName, p.bankRef]
      .some(value => String(value || '').toLowerCase().includes(text))
    const matchesMode = modeFilter === 'ALL' || p.mode === modeFilter
    return matchesQuery && matchesMode
  })
  const totalReceived = filteredPayments.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <div className="page-actions">
          {filteredPayments.length > 0 && (
            <button className="btn" onClick={() => printPayments(filteredPayments)} title="Print all payments">
              <PrintIcon /> Print
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Record payment</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="form-grid">
          <div className="field">
            <label>Client</label>
            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
              <option value="">Select client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div className="field">
            <label>Search</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Payment ref, client, bank ref" disabled={!hasClientSelection} />
          </div>
          <div className="field">
            <label>Mode</label>
            <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} disabled={!hasClientSelection}>
              <option value="ALL">All</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>
      </div>

      {filteredPayments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          <div className="metric-card">
            <div className="metric-label">Total payments</div>
            <div className="metric-value">{filteredPayments.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total received</div>
            <div className="metric-value" style={{ color: 'var(--green)' }}>{fmt(totalReceived)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Last payment</div>
            <div className="metric-value" style={{ fontSize: 14 }}>{filteredPayments[0]?.paymentDate || '-'}</div>
            <div className="metric-sub">{filteredPayments[0]?.clientName}</div>
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
              {!hasClientSelection
                ? <tr><td colSpan={9} className="empty-state">Select a client to view payments.</td></tr>
                : !filteredPayments.length
                ? <tr><td colSpan={9} className="empty-state">No payments recorded for this client</td></tr>
                : filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td className="mono fw-600">{p.paymentRef}</td>
                    <td style={{ fontWeight: 500 }}>{p.clientName}</td>
                    <td className="text-muted text-small">{p.paymentDate}</td>
                    <td><span className="badge badge-blue">{p.mode}</span></td>
                    <td style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt(p.amount)}</td>
                    <td className="mono text-muted" style={{ fontSize: 11 }}>
                      {p.allocations?.map(a => a.invoiceNo).join(', ') || 'Unallocated'}
                    </td>
                    <td className="mono text-muted" style={{ fontSize: 11 }}>{p.bankRef || '-'}</td>
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
        {filteredPayments.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px', borderTop: '1px solid var(--border)', gap: 24 }}>
            <span className="text-muted text-small">{filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}</span>
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
  const [form, setForm] = useState({ clientId: prefillClientId || '', paymentDate: today(), amount: '', mode: 'NEFT', bankRef: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getClients().then(c => {
      const activeClients = sortClientsByName(c.filter(client => client.status === 'ACTIVE'))
      setClients(activeClients)
      if (!form.clientId && activeClients.length) setForm(f => ({ ...f, clientId: activeClients[0].id }))
    })
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.clientId || !form.amount) { toast.error('Client and amount required'); return }
    setSaving(true)
    try {
      const result = await createPayment({ ...form, clientId: parseInt(form.clientId), amount: parseFloat(form.amount), allocations: [] })
      onSave(result)
    } catch { } finally { setSaving(false) }
  }

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
        <div className="field"><label>Amount received (Rs) *</label>
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
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save payment'}</button>
      </div>
    </Modal>
  )
}
