import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getJobCards, getJobCard, updateJobCardStatus, addActivity } from '../api/client'
import { Badge, Modal, DetailRow, Pipeline, fmt, fmtN, Spinner } from '../components/UI'
import { printJobCard } from '../components/PrintTemplates'

const ACTIVITY_TYPES = [
  { key: 'STEREO_AVAILABLE', label: 'Stereo available' },
  { key: 'MATERIAL',         label: 'Material issued' },
  { key: 'CUTTING',          label: 'Cutting' },
  { key: 'PRINTING',         label: 'Printing' },
  { key: 'STITCHING',        label: 'Stitching' },
  { key: 'HANDLE',           label: 'Handle attachment' },
  { key: 'QC_CHECK_PACKING', label: 'QC check & packing' },
  { key: 'DELIVERY',         label: 'Delivery' },
]

const PrintIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"/>
  </svg>
)

// ── Job Cards List ────────────────────────────────────────
export function JobCardsList() {
  const [jcs, setJcs] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => { getJobCards().then(setJcs).finally(() => setLoading(false)) }, [])

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Job cards</h1></div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job card no.</th><th>Order</th><th>Client</th>
                <th>Product</th><th>Size</th><th>Handle</th><th>Qty</th>
                <th>Current stage</th><th>Due date</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {!jcs.length
                ? <tr><td colSpan="11" style={{ textAlign: 'center', padding: 24, color: 'var(--ink3)' }}>No job cards found</td></tr>
                : jcs.map(jc => {
                  const lastStage = jc.doneStages?.length ? jc.doneStages[jc.doneStages.length - 1] : null
                  return (
                    <tr key={jc.id} className="clickable" onClick={() => nav(`/jobcards/${jc.id}`)}>
                      <td className="mono fw-600">{jc.jobCardNo}</td>
                      <td className="mono text-muted" style={{ fontSize: 11 }}>{jc.orderNo}</td>
                      <td style={{ fontWeight: 500 }}>{jc.clientName}</td>
                      <td>{jc.productName}</td>
                      <td className="text-muted">{jc.size}</td>
                      <td><span className="tag">{jc.handle}</span></td>
                      <td>{fmtN(jc.qty)}</td>
                      <td>{lastStage ? <Badge status={lastStage} /> : <span className="text-muted text-small">Not started</span>}</td>
                      <td className="text-muted text-small">{jc.dueDate}</td>
                      <td><Badge status={jc.status} /></td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm" onClick={() => printJobCard(jc)} title="Print job card">
                          <PrintIcon />
                        </button>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Job Card Detail ───────────────────────────────────────
export function JobCardDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [jc, setJc] = useState(null)
  const [showActivity, setShowActivity] = useState(false)

  const load = () => getJobCard(id).then(setJc)
  useEffect(() => { load() }, [id])

  const changeStatus = async (status) => {
    try {
      const updated = await updateJobCardStatus(id, status)
      setJc(updated)
      toast.success(`Status updated to ${status.replace(/_/g, ' ').toLowerCase()}`)
    } catch { }
  }

  const activitySaved = (updated) => {
    setJc(updated)
    setShowActivity(false)
    toast.success('Activity logged')
  }

  if (!jc) return <Spinner />

  return (
    <div className="page">
      <div className="breadcrumb">
        <a onClick={() => nav('/jobcards')}>Job cards</a><span>/</span><span>{jc.jobCardNo}</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">{jc.jobCardNo}</h1>
        <div className="page-actions">
          <select
            className="status-select"
            value={jc.status}
            onChange={e => changeStatus(e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PRODUCTION">In production</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowActivity(true)}>+ Log activity</button>
          <button className="btn" onClick={() => printJobCard(jc)}><PrintIcon /> Print</button>
        </div>
      </div>

      {/* Pipeline — full width */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Production stages</div>
        <Pipeline doneStages={jc.doneStages || []} />
      </div>

      {/* Two-column detail */}
      <div className="detail-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Product & order spec</div>
          <DetailRow label="Order no."
            value={
              <a className="mono" style={{ color: 'var(--blue-txt)', cursor: 'pointer' }}
                onClick={() => nav(`/orders/${jc.orderId}`)}>
                {jc.orderNo}
              </a>
            }
          />
          <DetailRow label="Client" value={<strong>{jc.clientName}</strong>} />
          <DetailRow label="Salesperson" value={jc.salesperson} />
          <DetailRow label="Product" value={<strong>{jc.productName}</strong>} />
          <DetailRow label="SKU" value={<span className="mono">{jc.sku}</span>} />
          <DetailRow label="Size" value={jc.size} />
          <DetailRow label="Handle" value={<span className="tag">{jc.handle}</span>} />
          <DetailRow label="Quantity" value={<span style={{ fontWeight: 700 }}>{fmtN(jc.qty)} pcs</span>} />
          {jc.spec && <DetailRow label="Spec" value={<span className="text-muted">{jc.spec}</span>} />}
          {jc.stereoRef && <DetailRow label="Stereo ref" value={<span className="mono">{jc.stereoRef}</span>} />}
          <DetailRow label="Start date" value={jc.startDate} />
          <DetailRow label="Due date" value={<span style={{ fontWeight: 500 }}>{jc.dueDate}</span>} />
          {jc.instructions && (
            <DetailRow label="Instructions" value={<span className="text-muted">{jc.instructions}</span>} />
          )}
        </div>

        {/* Activity log */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Activity log ({jc.activities?.length || 0})</div>
            <button className="btn btn-sm btn-primary" onClick={() => setShowActivity(true)}>+ Log activity</button>
          </div>
          {!jc.activities?.length
            ? (
              <div className="empty-state">
                No activities logged yet.<br />
                <span className="text-small text-muted">Log the first activity to start tracking production.</span>
              </div>
            )
            : [...jc.activities].reverse().map(a => (
              <div key={a.id} className="activity-item">
                <div className="activity-header">
                  <Badge status={a.activityType} />
                  {a.performedBy && <span className="activity-by">{a.performedBy}</span>}
                  <span className="activity-time">
                    {a.activityTime ? a.activityTime.slice(0, 16).replace('T', ' ') : ''}
                  </span>
                </div>
                <div className="activity-desc">{a.description}</div>
                {a.notes && <div className="activity-notes">{a.notes}</div>}
              </div>
            ))
          }
        </div>
      </div>

      {/* Full activity table */}
      {jc.activities?.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-header">
            <div className="card-title">All activities — timeline</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Date / time</th><th>Stage</th>
                  <th>Description</th><th>Performed by</th><th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {jc.activities.map((a, i) => (
                  <tr key={a.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td className="mono text-muted" style={{ fontSize: 11 }}>
                      {a.activityTime ? a.activityTime.slice(0, 16).replace('T', ' ') : '—'}
                    </td>
                    <td><Badge status={a.activityType} /></td>
                    <td style={{ fontWeight: 500 }}>{a.description}</td>
                    <td className="text-muted">{a.performedBy || '—'}</td>
                    <td className="text-muted">{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showActivity && (
        <ActivityModal jcId={id} onSave={activitySaved} onClose={() => setShowActivity(false)} />
      )}
    </div>
  )
}

// ── Log Activity Modal ────────────────────────────────────
function ActivityModal({ jcId, onSave, onClose }) {
  const [form, setForm] = useState({
    activityType: 'STEREO_AVAILABLE',
    description: '',
    performedBy: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.description.trim()) { toast.error('Description is required'); return }
    setSaving(true)
    try {
      const updated = await addActivity(jcId, form)
      onSave(updated)
    } catch { }
    finally { setSaving(false) }
  }

  return (
    <Modal title="Log production activity" onClose={onClose}>
      <div className="form-grid">
        <div className="field">
          <label>Activity type *</label>
          <select value={form.activityType} onChange={e => set('activityType', e.target.value)}>
            {ACTIVITY_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Performed by</label>
          <input
            value={form.performedBy}
            onChange={e => set('performedBy', e.target.value)}
            placeholder="Person or team (e.g. Floor B)"
          />
        </div>
        <div className="field field-full">
          <label>Description *</label>
          <input
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What was done? (e.g. Cutting completed 5000 pcs)"
            autoFocus
          />
        </div>
        <div className="field field-full">
          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="Any additional notes, issues, or observations"
          />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Log activity'}
        </button>
      </div>
    </Modal>
  )
}
