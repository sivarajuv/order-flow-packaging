import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getInvoices, getInvoice, updateInvoice } from '../api/client'
import { Badge, GstBadge, DetailRow, AmountSummary, fmt, fmtN, Spinner, formatDateDisplay, splitGstLabel, splitGstPercent } from '../components/UI'
import { printDeliveryChallan, printInvoice } from '../components/PrintTemplates'

const PrintIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"/>
  </svg>
)

export function InvoicesList() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const nav = useNavigate()

  useEffect(() => { getInvoices().then(setInvoices).finally(() => setLoading(false)) }, [])

  if (loading) return <Spinner />

  const totalBalance = invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + (i.balanceDue || 0), 0)
  const filteredInvoices = invoices.filter(inv => {
    const text = query.trim().toLowerCase()
    const matchesQuery = !text || [inv.invoiceNo, inv.orderNo, inv.clientName]
      .some(value => String(value || '').toLowerCase().includes(text))
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        {totalBalance > 0 && (
          <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
            Total outstanding: {fmt(totalBalance)}
          </div>
        )}
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="form-grid">
          <div className="field">
            <label>Search</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Invoice no., order, client" />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially paid</option>
              <option value="PAID">Paid</option>
              <option value="VOID">Void</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice no.</th><th>Order</th><th>Client</th>
                <th>Date</th><th>Due date</th><th>GST</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {!filteredInvoices.length
                ? <tr><td colSpan="11" style={{ textAlign: 'center', padding: 24, color: 'var(--ink3)' }}>No invoices yet</td></tr>
                : filteredInvoices.map(inv => (
                  <tr key={inv.id} className="clickable" onClick={() => nav(`/invoices/${inv.id}`)}>
                    <td className="mono fw-600">{inv.invoiceNo}</td>
                    <td className="mono text-muted" style={{ fontSize: 11 }}>{inv.orderNo}</td>
                    <td style={{ fontWeight: 500 }}>{inv.clientName}</td>
                    <td className="text-muted text-small">{formatDateDisplay(inv.invoiceDate)}</td>
                    <td className="text-muted text-small">{formatDateDisplay(inv.dueDate)}</td>
                    <td><GstBadge pct={inv.gstPercent} /></td>
                    <td style={{ fontWeight: 600, textAlign: 'right' }}>{fmt(inv.total)}</td>
                    <td style={{ color: 'var(--green)', textAlign: 'right' }}>{fmt(inv.paidAmount)}</td>
                    <td style={{ fontWeight: 700, color: (inv.balanceDue || 0) > 0 ? 'var(--amber)' : 'var(--green)', textAlign: 'right' }}>{fmt(inv.balanceDue)}</td>
                    <td><Badge status={inv.status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm" onClick={() => printInvoice(inv)} title="Print invoice">
                          <PrintIcon />
                        </button>
                        <button className="btn btn-sm" onClick={() => printDeliveryChallan(inv)} title="Print delivery challan">
                          Challan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function InvoiceDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [inv, setInv] = useState(null)
  const [editingDiscount, setEditingDiscount] = useState(false)
  const [discountValue, setDiscountValue] = useState('')
  const [savingDiscount, setSavingDiscount] = useState(false)

  useEffect(() => {
    getInvoice(id).then(data => {
      setInv(data)
      setDiscountValue(String(data.invoiceDiscount ?? 0))
    })
  }, [id])

  if (!inv) return <Spinner />

  const isOverdue = inv.status !== 'PAID' && inv.dueDate && new Date(inv.dueDate) < new Date()
  const isInterState = inv.taxMode === 'INTER_STATE'

  const saveDiscount = async () => {
    setSavingDiscount(true)
    try {
      const updated = await updateInvoice(inv.id, {
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        gstPercent: inv.gstPercent,
        invoiceDiscount: parseFloat(discountValue || 0),
      })
      setInv(updated)
      setDiscountValue(String(updated.invoiceDiscount ?? 0))
      setEditingDiscount(false)
      toast.success('Invoice discount updated')
    } finally {
      setSavingDiscount(false)
    }
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <a onClick={() => nav('/invoices')}>Invoices</a><span>/</span><span>{inv.invoiceNo}</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">{inv.invoiceNo}</h1>
        <div className="page-actions">
          {isOverdue && <span className="badge badge-red" style={{ padding: '4px 10px' }}>Overdue</span>}
          <GstBadge pct={inv.gstPercent} />
          <Badge status={inv.status} />
          <button className="btn" onClick={() => printInvoice(inv)}><PrintIcon /> Print</button>
          <button className="btn" onClick={() => printDeliveryChallan(inv)}>Delivery challan</button>
          {(inv.balanceDue || 0) > 0 && (
            <button className="btn btn-primary" onClick={() => nav('/payments', { state: { clientId: inv.clientId, invoiceId: inv.id } })}>
              Record payment
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Invoice details</div>
          <DetailRow label="Invoice no." value={<span className="mono">{inv.invoiceNo}</span>} />
          <DetailRow
            label="Sales order"
            value={<a className="mono" style={{ color: 'var(--blue-txt)', cursor: 'pointer' }} onClick={() => nav(`/orders/${inv.orderId}`)}>{inv.orderNo}</a>}
          />
          <DetailRow label="Client" value={<strong>{inv.clientName}</strong>} />
          <DetailRow label="GST no." value={<span className="mono">{inv.clientGstNo || '-'}</span>} />
          <DetailRow label="Address" value={<span className="text-muted" style={{ textAlign: 'right', maxWidth: 260 }}>{inv.clientAddress || inv.clientBillingAddress || '-'}</span>} />
          <DetailRow label="Invoice date" value={formatDateDisplay(inv.invoiceDate)} />
          <DetailRow label="Invoice discount" value={
            editingDiscount ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  className="cell-input"
                  type="number"
                  min="0"
                  step="0.01"
                  style={{ width: 100, textAlign: 'right' }}
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                />
                <button className="btn btn-sm btn-primary" onClick={saveDiscount} disabled={savingDiscount}>
                  {savingDiscount ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setDiscountValue(String(inv.invoiceDiscount ?? 0))
                    setEditingDiscount(false)
                  }}
                  disabled={savingDiscount}
                >
                  Cancel
                </button>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{fmt(inv.invoiceDiscount || 0)}</span>
                <button className="btn btn-sm" onClick={() => setEditingDiscount(true)}>Edit</button>
              </span>
            )
          } />
          <DetailRow label="Total discount" value={fmt(inv.discountTotal || 0)} />
          <DetailRow
            label="Due date"
            value={<span style={{ color: isOverdue ? 'var(--red)' : undefined, fontWeight: isOverdue ? 600 : undefined }}>{formatDateDisplay(inv.dueDate)}{isOverdue ? ' !' : ''}</span>}
          />
          <DetailRow label="Place of supply" value={inv.placeOfSupply || '-'} />
          <DetailRow label="GST rate" value={<span>{isInterState ? `IGST ${inv.igstPercent}%` : splitGstLabel(inv.gstPercent)}</span>} />
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Payment summary</div>
          <AmountSummary
            subtotal={inv.subtotal}
            tax={inv.taxTotal}
            total={inv.total}
            gstPct={inv.gstPercent}
            invoiceDiscount={inv.invoiceDiscount}
            taxMode={inv.taxMode}
            cgstAmount={inv.cgstAmount}
            sgstAmount={inv.sgstAmount}
            igstAmount={inv.igstAmount}
            igstPct={inv.igstPercent}
            paid={inv.paidAmount}
            balance={inv.balanceDue}
          />
          {(inv.balanceDue || 0) > 0 && (
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={() => nav('/payments', { state: { clientId: inv.clientId, invoiceId: inv.id } })}>
              Record payment
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Invoice lines</div>
        <div className="table-wrap">
          <table className="data-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th>Product</th>
                <th>Size</th>
                <th>Handle</th>
                <th style={{ width: 80, textAlign: 'right' }}>Sales</th>
                <th style={{ width: 100, textAlign: 'right' }}>Unit price</th>
                <th style={{ width: 80, textAlign: 'right' }}>Discount</th>
                <th style={{ width: 65, textAlign: 'center' }}>GST %</th>
                <th style={{ width: 100, textAlign: 'right' }}>Tax amount</th>
                <th style={{ width: 120, textAlign: 'right' }}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {(inv.lines || []).map((l, i) => (
                <tr key={l.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{l.productName}</td>
                  <td className="text-muted">{l.size}</td>
                  <td><span className="tag">{l.handle}</span></td>
                  <td style={{ textAlign: 'right' }}>{fmtN(l.salesQty ?? l.qty)}</td>
                  <td style={{ textAlign: 'right' }} className="mono">{fmt(l.unitPrice)}</td>
                  <td style={{ textAlign: 'right' }}>{Number(l.discount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}%</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${l.taxPercent === 0 ? 'badge-gray' : l.taxPercent === 5 ? 'badge-blue' : 'badge-amber'}`}>{isInterState ? `${l.taxPercent}% IGST` : `${splitGstPercent(l.taxPercent)}% + ${splitGstPercent(l.taxPercent)}%`}</span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--ink2)' }}>{fmt(l.taxAmount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(l.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, marginTop: 12, paddingTop: 10, borderTop: '2px solid var(--border)' }}>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div className="text-muted">Invoice discount</div>
            <div style={{ fontWeight: 600 }}>{fmt(inv.invoiceDiscount || 0)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div className="text-muted">Total discount</div>
            <div style={{ fontWeight: 600 }}>{fmt(inv.discountTotal)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div className="text-muted">Subtotal</div>
            <div style={{ fontWeight: 600 }}>{fmt(inv.subtotal)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div className="text-muted">{isInterState ? `IGST ${inv.igstPercent}%` : `CGST ${splitGstPercent(inv.gstPercent)}%`}</div>
            <div style={{ fontWeight: 600 }}>{fmt(isInterState ? inv.igstAmount : inv.cgstAmount)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div className="text-muted">{isInterState ? 'IGST Total' : `SGST ${splitGstPercent(inv.gstPercent)}%`}</div>
            <div style={{ fontWeight: 600 }}>{fmt(isInterState ? inv.igstAmount : inv.sgstAmount)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 14 }}>
            <div className="text-muted" style={{ fontSize: 11 }}>Invoice total</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{fmt(inv.total)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 14 }}>
            <div className="text-muted" style={{ fontSize: 11 }}>Balance due</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: (inv.balanceDue || 0) > 0 ? 'var(--amber)' : 'var(--green)' }}>{fmt(inv.balanceDue)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
