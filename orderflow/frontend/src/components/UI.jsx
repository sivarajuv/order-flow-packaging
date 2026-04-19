import { useEffect } from 'react'

// ── Format helpers ─────────────────────────────
export const fmt = n =>
  n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const today = () => new Date().toISOString().slice(0, 10)

// ── Badge ─────────────────────────────────────
export function Badge({ status }) {
  return <span className="badge">{status}</span>
}

export function GstBadge({ pct }) {
  return <span className="badge">GST {pct}%</span>
}

// ── Spinner ───────────────────────────────────
export function Spinner() {
  return <div>Loading...</div>
}

// ── Detail Row ────────────────────────────────
export function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <b>{label}</b>
      <span>{value}</span>
    </div>
  )
}

// ── Modal ─────────────────────────────────────
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const esc = e => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{title}</h3>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ── EditCell ──────────────────────────────────
export function EditCell({ editing, value, onChange, children, type = "text", width }) {
  if (editing) {
    return (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ width }}
      />
    )
  }
  return <>{children}</>
}

// ── RowActions ────────────────────────────────
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

// ── ✅ Pipeline (FIXED) ───────────────────────
export function Pipeline({ doneStages = [] }) {
  const stages = [
    'STEREO_AVAILABLE',
    'MATERIAL',
    'CUTTING',
    'STITCHING',
    'HANDLE',
    'QC_CHECK_PACKING',
    'DELIVERY'
  ]

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      {stages.map((stage) => {
        const done = doneStages.includes(stage)
        return (
          <div
            key={stage}
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              background: done ? "green" : "#ccc",
              color: "#fff",
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
export function AmountSummary({ subtotal, tax, total, paid, balance, gstPct }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 10, borderRadius: 6 }}>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span>
        <span>{subtotal != null ? subtotal : "—"}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", color: "#888" }}>
        <span>GST {gstPct || ""}%</span>
        <span>{tax != null ? tax : "—"}</span>
      </div>

      <hr />

      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>Total</span>
        <span>{total != null ? total : "—"}</span>
      </div>

      {paid != null && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span>Paid</span>
          <span>{paid}</span>
        </div>
      )}

      {balance != null && (
        <div style={{ display: "flex", justifyContent: "space-between", color: "red" }}>
          <span>Balance</span>
          <span>{balance}</span>
        </div>
      )}

    </div>
  );
}
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
export function fmtN(n) {
  return Number(n || 0).toLocaleString('en-IN');
}
export function PrintIcon({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-sm btn-outline-primary"
      title="Print">
      🖨️
    </button>
  );
}