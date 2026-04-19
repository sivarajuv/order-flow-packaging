import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getJobCards, getJobCard, updateJobCardStatus, addActivity } from '../api/client'
import { Badge, Modal, DetailRow, Pipeline, fmtN, Spinner, PrintIcon } from '../components/UI'
import { printJobCard } from '../components/PrintTemplates'
import { useAuth } from '../auth/AuthContext'

const ACTIVITY_TYPES = [
  { key: 'STEREO_AVAILABLE', label: 'Stereo available' },
  { key: 'MATERIAL',         label: 'Material issued' },
  { key: 'CUTTING',          label: 'Cutting' },
  { key: 'STITCHING',        label: 'Stitching' },
  { key: 'HANDLE',           label: 'Handle attachment' },
  { key: 'QC_CHECK_PACKING', label: 'QC check & packing' },
  { key: 'DELIVERY',         label: 'Delivery' },
]

// ── Operator Job Cards List ───────────────────────────────
export function OperatorJobCardsList() {
  const [jcs,     setJcs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('IN_PRODUCTION')
  const nav = useNavigate()
  const { user } = useAuth()

  useEffect(() => { getJobCards().then(setJcs).finally(() => setLoading(false)) }, [])

  if (loading) return <Spinner />

  const filtered = filter === 'ALL' ? jcs : jcs.filter(j => j.status === filter)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Job cards</h1>
        <div className="page-actions">
          <span style={{ fontSize: 11, color: 'var(--ink2)' }}>
            Logged in as <strong>{user?.name}</strong>
          </span>
        </div>
      </div>

      {/* Status filter chips */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { key: 'IN_PRODUCTION', label: 'In production' },
          { key: 'PENDING',       label: 'Pending' },
          { key: 'COMPLETED',     label: 'Completed' },
          { key: 'ALL',           label: 'All' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn btn-sm${filter === f.key ? ' btn-primary' : ''}`}
          >
            {f.label}
            <span style={{
              marginLeft: 4, background: filter === f.key ? 'rgba(255,255,255,.25)' : 'var(--surface2)',
              borderRadius: 10, padding: '0 5px', fontSize: 10, fontWeight: 700,
            }}>
              {f.key === 'ALL' ? jcs.length : jcs.filter(j => j.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {!filtered.length
        ? <div className="card"><div className="empty-state">No job cards in "{filter.replace(/_/g,' ').toLowerCase()}" status.</div></div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(jc => {
              const lastStage = jc.doneStages?.length ? jc.doneStages[jc.doneStages.length - 1] : null
              const doneCount = jc.doneStages?.length || 0
              return (
                <div
                  key={jc.id}
                  className="card"
                  style={{ cursor: 'pointer', transition: 'border .12s', border: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onClick={() => nav(`/jobcards/${jc.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className="mono fw-600" style={{ fontSize: 12 }}>{jc.jobCardNo}</span>
                        <Badge status={jc.status} />
                      </div>
                      <div style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{jc.productName}</span>
                        {jc.size && <span className="tag">{jc.size}</span>}
                        {jc.handle && jc.handle !== 'None' && <span className="tag">{jc.handle}</span>}
                      </div>
                      <div style={{ marginTop: 3, fontSize: 11, color: 'var(--ink2)' }}>
                        {jc.clientName} &nbsp;·&nbsp; {fmtN(jc.qty)} pcs &nbsp;·&nbsp; Due: <strong>{jc.dueDate}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{doneCount}/7 stages done</div>
                      {lastStage && (
                        <div style={{ marginTop: 3 }}>
                          <span style={{ fontSize: 10, color: 'var(--ink3)' }}>Last: </span>
                          <Badge status={lastStage} />
                        </div>
                      )}
                      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--ink2)' }}>
                        {jc.activities?.length || 0} activities logged
                      </div>
                    </div>
                  </div>
                  <Pipeline doneStages={jc.doneStages || []} />
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}

// ── Operator Job Card Detail ──────────────────────────────
// Shows product spec, stages, activity log — NO prices, rates, order amounts
export function OperatorJobCardDetail() {
  const { id }  = useParams()
  const nav     = useNavigate()
  const { user } = useAuth()
  const [jc,            setJc]            = useState(null)
  const [showActivity,  setShowActivity]  = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [actForm,       setActForm]       = useState({
    activityType: 'STEREO_AVAILABLE', description: '', performedBy: '', notes: '',
  })

  const load = () => getJobCard(id).then(setJc)
  useEffect(() => { load() }, [id])

  // Pre-fill performedBy with logged-in user name
  useEffect(() => {
    if (user) setActForm(f => ({ ...f, performedBy: user.name }))
  }, [user])

  const changeStatus = async val => {
    try {
      const u = await updateJobCardStatus(id, val)
      setJc(u); toast.success('Status updated')
    } catch { }
  }

  const saveActivity = async () => {
    if (!actForm.description.trim()) { toast.error('Description is required'); return }
    setSaving(true)
    try {
      const u = await addActivity(id, actForm)
      setJc(u)
      setShowActivity(false)
      setActForm(f => ({ ...f, activityType: 'STEREO_AVAILABLE', description: '', notes: '' }))
      toast.success('Activity logged')
    } catch { } finally { setSaving(false) }
  }

  if (!jc) return <Spinner />

  // Next recommended stage (first not yet done)
  const doneSet     = new Set(jc.doneStages || [])
  const nextStage   = ACTIVITY_TYPES.find(t => !doneSet.has(t.key))
  const allComplete = ACTIVITY_TYPES.every(t => doneSet.has(t.key))

  return (
    <div className="page">
      <div className="breadcrumb">
        <a onClick={() => nav('/jobcards')}>Job cards</a>
        <span>/</span>
        <span>{jc.jobCardNo}</span>
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
          <button className="btn btn-primary" onClick={() => setShowActivity(true)}>
            + Log activity
          </button>
          <button className="btn btn-icon" onClick={() => printJobCard(jc)} title="Print job card">
            <PrintIcon />
          </button>
        </div>
      </div>

      {/* Next stage prompt */}
      {!allComplete && nextStage && jc.status !== 'COMPLETED' && (
        <div style={{
          background: 'var(--blue-bg)', border: '1px solid var(--blue)', borderRadius: 'var(--r)',
          padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: 11, color: 'var(--blue-txt)', fontWeight: 600 }}>Next stage: </span>
            <Badge status={nextStage.key} />
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setActForm(f => ({ ...f, activityType: nextStage.key, description: nextStage.label + ' completed' }))
              setShowActivity(true)
            }}
          >
            Log "{nextStage.label}" →
          </button>
        </div>
      )}
      {allComplete && (
        <div style={{
          background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 'var(--r)',
          padding: '10px 14px', marginBottom: 14, fontSize: 12, color: 'var(--green-txt)', fontWeight: 600,
        }}>
          ✓ All production stages complete
        </div>
      )}

      {/* Pipeline */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>Production stages</div>
        <Pipeline doneStages={jc.doneStages || []} />
      </div>

      <div className="detail-grid">
        {/* Product spec — NO amounts/rates */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Product specification</div>
          <DetailRow label="Job card no." value={<span className="mono fw-600">{jc.jobCardNo}</span>} />
          <DetailRow label="Product" value={<strong>{jc.productName}</strong>} />
          <DetailRow label="SKU" value={<span className="mono">{jc.sku || '—'}</span>} />
          <DetailRow label="Size" value={jc.size || '—'} />
          <DetailRow label="Handle" value={<span className="tag">{jc.handle}</span>} />
          <DetailRow label="Quantity" value={
            <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtN(jc.qty)} pcs</span>
          } />
          {jc.spec && <DetailRow label="Spec" value={<span className="text-muted">{jc.spec}</span>} />}
          {jc.stereoRef && <DetailRow label="Stereo ref" value={<span className="mono">{jc.stereoRef}</span>} />}
          {/* NO unit price, NO line total */}
        </div>

        {/* Order & schedule — NO order value */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Schedule & client</div>
          <DetailRow label="Client" value={<strong>{jc.clientName}</strong>} />
          <DetailRow label="Order no." value={<span className="mono">{jc.orderNo}</span>} />
          <DetailRow label="Start date" value={jc.startDate} />
          <DetailRow label="Due date" value={
            <span style={{ fontWeight: 600, color: new Date(jc.dueDate) < new Date() ? 'var(--red)' : undefined }}>
              {jc.dueDate}
            </span>
          } />
          <DetailRow label="Status" value={<Badge status={jc.status} />} />
          <DetailRow label="Progress" value={
            <span style={{ fontWeight: 600 }}>{jc.doneStages?.length || 0} / 7 stages</span>
          } />
          {jc.instructions && (
            <DetailRow label="Instructions" value={
              <span className="text-muted" style={{ maxWidth: 200, wordBreak: 'break-word' }}>{jc.instructions}</span>
            } />
          )}
          {/* NO prices, no amounts, no invoices */}
        </div>
      </div>

      {/* Activity log */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <div className="card-title">Activity log ({jc.activities?.length || 0})</div>
          <button className="btn btn-sm btn-primary" onClick={() => setShowActivity(true)}>
            + Log activity
          </button>
        </div>
        {!jc.activities?.length
          ? <div className="empty-state">No activities logged yet. Log the first activity to begin tracking.</div>
          : [...jc.activities].reverse().map(a => (
            <div key={a.id} className="activity-item">
              <div className="activity-header">
                <Badge status={a.activityType} />
                {a.performedBy && <span style={{ fontSize: 11, fontWeight: 500 }}>{a.performedBy}</span>}
                <span className="activity-time">
                  {a.activityTime?.slice(0, 16).replace('T', ' ')}
                </span>
              </div>
              <div className="activity-desc">{a.description}</div>
              {a.notes && <div className="activity-notes">{a.notes}</div>}
            </div>
          ))
        }
      </div>

      {/* All activities table */}
      {(jc.activities?.length || 0) > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Full activity timeline</div>
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
                    <td className="mono text-muted" style={{ fontSize: 10 }}>
                      {a.activityTime?.slice(0, 16).replace('T', ' ') || '—'}
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

      {/* Log activity modal */}
      {showActivity && (
        <Modal title="Log production activity" onClose={() => setShowActivity(false)}>
          <div className="form-grid">
            <div className="field">
              <label>Activity type *</label>
              <select
                value={actForm.activityType}
                onChange={e => setActForm(f => ({ ...f, activityType: e.target.value }))}
              >
                {ACTIVITY_TYPES.map(t => (
                  <option key={t.key} value={t.key}>
                    {doneSet.has(t.key) ? '✓ ' : ''}{t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Performed by</label>
              <input
                value={actForm.performedBy}
                onChange={e => setActForm(f => ({ ...f, performedBy: e.target.value }))}
                placeholder="Your name / team"
              />
            </div>
            <div className="field field-full">
              <label>Description *</label>
              <input
                value={actForm.description}
                onChange={e => setActForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What was done? (e.g. Cutting complete 5000 pcs)"
                autoFocus
              />
            </div>
            <div className="field field-full">
              <label>Notes</label>
              <textarea
                value={actForm.notes}
                onChange={e => setActForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Any issues, observations, or additional notes"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setShowActivity(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveActivity} disabled={saving}>
              {saving ? 'Saving…' : 'Log activity'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
