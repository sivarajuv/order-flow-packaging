import { useEffect } from 'react'

export const fmt = n =>
  n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const today = () => new Date().toISOString().slice(0, 10)

export const formatDateDisplay = value => {
  if (!value) return '-'
  const parts = String(value).split('-')
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  return String(value)
}

export const splitGstPercent = pct => Number(pct || 0) / 2
export const splitGstLabel = pct => `CGST ${splitGstPercent(pct)}% + SGST ${splitGstPercent(pct)}%`
export const splitGstAmount = tax => Number(tax || 0) / 2

export function Badge({ status }) {
  return <span className="badge">{status}</span>
}

export function GstBadge({ pct }) {
  return <span className="badge">GST {pct}%</span>
}

export function Spinner() {
  return <div>Loading...</div>
}

export function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <b>{label}</b>
      <span>{value}</span>
    </div>
  )
}

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">x</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EditCell({ editing, value, onChange, children, type = 'text', width }) {
  if (editing) {
    return (
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ width }}
      />
    )
  }
  return <>{children}</>
}

export function RowActions({ editing, saving, onEdit, onSave, onCancel, onDelete }) {
  if (editing) {
    return (
      <>
        <button onClick={onSave} disabled={saving}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </>
    )
  }

  return (
    <>
      <button onClick={onEdit}>Edit</button>
      {onDelete && <button onClick={onDelete}>Delete</button>}
    </>
  )
}

export function Pipeline({ doneStages = [] }) {
  const stages = [
    'STEREO_AVAILABLE',
    'MATERIAL',
    'CUTTING',
    'PRINTING',
    'STITCHING',
    'HANDLE',
    'QC_CHECK_PACKING',
    'DELIVERY'
  ]

  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
      {stages.map(stage => {
        const done = doneStages.includes(stage)
        return (
          <div
            key={stage}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: done ? 'green' : '#ccc',
              color: '#fff',
              fontSize: 10
            }}
          >
            {stage.replace(/_/g, ' ')}
          </div>
        )
      })}
    </div>
  )
}

export function AmountSummary({
  subtotal,
  tax,
  total,
  paid,
  balance,
  gstPct,
  invoiceDiscount,
  taxMode,
  cgstAmount,
  sgstAmount,
  igstAmount,
  igstPct
}) {
  const halfTax = splitGstAmount(tax)
  const isInterState = taxMode === 'INTER_STATE'

  return (
    <div style={{ border: '1px solid #ddd', padding: 10, borderRadius: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Subtotal</span>
        <span>{subtotal != null ? fmt(subtotal) : '—'}</span>
      </div>

      {isInterState ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
          <span>IGST {igstPct ?? gstPct ?? ''}%</span>
          <span>{igstAmount != null ? fmt(igstAmount) : (tax != null ? fmt(tax) : '—')}</span>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
            <span>CGST {splitGstPercent(gstPct)}%</span>
            <span>{cgstAmount != null ? fmt(cgstAmount) : (tax != null ? fmt(halfTax) : '—')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
            <span>SGST {splitGstPercent(gstPct)}%</span>
            <span>{sgstAmount != null ? fmt(sgstAmount) : (tax != null ? fmt(halfTax) : '—')}</span>
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
        <span>Invoice discount</span>
        <span>{invoiceDiscount != null ? fmt(invoiceDiscount) : '—'}</span>
      </div>

      <hr />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Total</span>
        <span>{total != null ? fmt(total) : '—'}</span>
      </div>

      {paid != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span>Paid</span>
          <span>{fmt(paid)}</span>
        </div>
      )}

      {balance != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'red' }}>
          <span>Balance</span>
          <span>{fmt(balance)}</span>
        </div>
      )}
    </div>
  )
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function fmtN(n) {
  return Number(n || 0).toLocaleString('en-IN')
}

export function PrintIcon({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-sm btn-outline-primary"
      title="Print">
      🖨️
    </button>
  )
}
