import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClients, getOrders, getInvoices, getPayments } from '../api/client'
import { Badge, GstBadge, fmt, Spinner, PrintIcon } from '../components/UI'
import { printReports, printClientLedger, downloadClientLedgerPdf, shareClientLedgerOnWhatsApp } from '../components/PrintTemplates'

export default function Reports() {
  const [data,     setData]     = useState(null)
  const [tab,      setTab]      = useState('summary')   // 'summary' | 'ledger'
  const [ledgerId, setLedgerId] = useState(null)        // selected client for ledger
  const nav = useNavigate()

  useEffect(() => {
    Promise.all([getClients(), getOrders(), getInvoices(), getPayments()])
      .then(([clients, orders, invoices, payments]) =>
        setData({ clients, orders, invoices, payments })
      )
  }, [])

  if (!data) return <Spinner />

  const { clients, orders, invoices, payments } = data
  const totalCY      = clients.reduce((s,c) => s + (c.cyOutstanding||0), 0)
  const totalPY      = clients.reduce((s,c) => s + (c.pyOutstanding||0), 0)
  const totalPaid    = payments.reduce((s,p) => s + (p.amount||0), 0)
  const totalInvoiceVal= invoices.reduce((s,i)   => s + (i.total||0), 0)
  const invoiceAmountByOrderId = invoices.reduce((acc, inv) => {
    if (inv.orderId == null) return acc
    acc[inv.orderId] = (acc[inv.orderId] || 0) + (inv.total || 0)
    return acc
  }, {})

  /* ── ledger helpers ─────────────────────────────────── */
  const ledgerClient = ledgerId ? clients.find(c => c.id === ledgerId) : null

  // Build ledger rows for a client: merge invoices + payments chronologically
  function buildLedger(clientId) {
    const clientInvoices = invoices.filter(i => i.clientId === clientId)
    const clientPayments = payments.filter(p => p.clientId === clientId)

    const rows = []

    clientInvoices.forEach(inv => {
      rows.push({
        date: inv.invoiceDate,
        type: 'invoice',
        ref:  inv.invoiceNo,
        desc: `Invoice — Order ${inv.orderNo || ''}`,
        debit:  inv.total  || 0,
        credit: 0,
        status: inv.status,
        id:     inv.id,
      })
    })

    clientPayments.forEach(pay => {
      const allocated = (pay.allocations || []).map(a => a.invoiceNo).filter(Boolean).join(', ')
      rows.push({
        date:  pay.paymentDate,
        type:  'payment',
        ref:   pay.paymentRef,
        desc:  `Payment received — ${pay.mode}${pay.bankRef ? ' (' + pay.bankRef + ')' : ''}${allocated ? ' | ' + allocated : ''}`,
        debit:  0,
        credit: pay.amount || 0,
        status: pay.status,
        id:     pay.id,
      })
    })

    // sort by date
    rows.sort((a, b) => (a.date || '').localeCompare(b.date || ''))

    // running balance
    const client = clients.find(c => c.id === clientId) || {}
    let balance = (client.pyOutstanding || 0)   // opening balance = PY outstanding
    const ledger = []

    // opening row
    ledger.push({ date:'', type:'opening', ref:'', desc:'Opening balance (PY outstanding)', debit: client.pyOutstanding||0, credit:0, balance: client.pyOutstanding||0 })

    rows.forEach(r => {
      balance = balance + r.debit - r.credit
      ledger.push({ ...r, balance })
    })

    return ledger
  }

  const currentLedger = ledgerId ? buildLedger(ledgerId) : []
  const closingBalance = currentLedger.length ? currentLedger[currentLedger.length - 1].balance : 0
  const totalDebits    = currentLedger.reduce((s, r) => s + (r.debit  || 0), 0)
  const totalCredits   = currentLedger.reduce((s, r) => s + (r.credit || 0), 0)

  const TAB_STYLE = active => ({
    padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
    color: active ? 'var(--blue-txt)' : 'var(--ink2)',
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <div className="page-actions">
          {tab === 'summary' && (
            <button className="btn" onClick={() => printReports(data)}>
              <PrintIcon /> Print report
            </button>
          )}
          {tab === 'ledger' && ledgerClient && (
            <>
              <button className="btn" onClick={() => downloadClientLedgerPdf(ledgerClient, currentLedger, totalDebits, totalCredits, closingBalance)}>
                Download PDF
              </button>
              <button className="btn" onClick={() => shareClientLedgerOnWhatsApp(ledgerClient, currentLedger, totalDebits, totalCredits, closingBalance)}>
                Share WhatsApp
              </button>
              <button className="btn" onClick={() => printClientLedger(ledgerClient, currentLedger, totalDebits, totalCredits, closingBalance)}>
                <PrintIcon /> Print ledger
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:16 }}>
        <button style={TAB_STYLE(tab==='summary')} onClick={() => setTab('summary')}>Summary report</button>
        <button style={TAB_STYLE(tab==='ledger')}  onClick={() => setTab('ledger')}>Client ledger</button>
      </div>

      {/* ── SUMMARY TAB ─────────────────────────────────── */}
      {tab === 'summary' && (
        <>
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-label">Total invoice value</div>
              <div className="metric-value">{fmt(totalInvoiceVal)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Payments received</div>
              <div className="metric-value" style={{color:'var(--green)'}}>{fmt(totalPaid)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">PY outstanding</div>
              <div className="metric-value">{fmt(totalPY)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">CY outstanding</div>
              <div className="metric-value" style={{color:'var(--amber)'}}>{fmt(totalCY)}</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div className="card">
              <div className="card-title" style={{marginBottom:10}}>Order status summary</div>
              <table className="data-table">
                <thead><tr><th>Status</th><th>Count</th><th>Invoice amount</th></tr></thead>
                <tbody>
                  {['NEW','IN_PRODUCTION','INVOICED','COMPLETED','CANCELLED'].map(st => {
                    const g = orders.filter(o => o.status === st)
                    return (
                      <tr key={st}>
                        <td><Badge status={st}/></td>
                        <td style={{fontWeight:600}}>{g.length}</td>
                        <td style={{fontWeight:600}}>{fmt(g.reduce((s,o)=>s+(invoiceAmountByOrderId[o.id]||0),0))}</td>
                      </tr>
                    )
                  })}
                  <tr style={{background:'var(--bg)',fontWeight:700}}>
                    <td>Total</td><td>{orders.length}</td><td>{fmt(totalInvoiceVal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-title" style={{marginBottom:10}}>Invoice status summary</div>
              <table className="data-table">
                <thead><tr><th>Status</th><th>Count</th><th>Balance due</th></tr></thead>
                <tbody>
                  {['UNPAID','PARTIALLY_PAID','PAID'].map(st => {
                    const g = invoices.filter(i => i.status === st)
                    return (
                      <tr key={st}>
                        <td><Badge status={st}/></td>
                        <td style={{fontWeight:600}}>{g.length}</td>
                        <td style={{fontWeight:600}}>{fmt(g.reduce((s,i)=>s+(i.balanceDue||0),0))}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Client outstanding ageing</div>
              <button className="btn btn-sm" onClick={() => printReports(data)}>
                <PrintIcon /> Print
              </button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th><th>Area code</th><th>Salesperson</th><th>GST rate</th>
                    <th>Credit limit</th><th>PY o/s</th><th>CY o/s</th>
                    <th style={{textAlign:'right'}}>Total o/s</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id}>
                      <td style={{fontWeight:500}}>{c.name}</td>
                      <td>{c.areaCode ? <span className="tag">{c.areaCode}</span> : <span className="text-muted">—</span>}</td>
                      <td className="text-muted">{c.salesperson}</td>
                      <td><GstBadge pct={c.gstPercent}/></td>
                      <td>{fmt(c.creditLimit)}</td>
                      <td>{fmt(c.pyOutstanding)}</td>
                      <td style={{color:'var(--amber)'}}>{fmt(c.cyOutstanding)}</td>
                      <td style={{fontWeight:700,textAlign:'right'}}>{fmt((c.pyOutstanding||0)+(c.cyOutstanding||0))}</td>
                      <td><Badge status={c.status}/></td>
                      <td>
                        <button className="btn btn-sm" onClick={() => { setLedgerId(c.id); setTab('ledger') }}>
                          Ledger →
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{background:'var(--bg)',fontWeight:700}}>
                    <td colSpan={5}>Total</td>
                    <td>{fmt(totalPY)}</td>
                    <td style={{color:'var(--amber)'}}>{fmt(totalCY)}</td>
                    <td style={{textAlign:'right'}}>{fmt(totalPY+totalCY)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── LEDGER TAB ──────────────────────────────────── */}
      {tab === 'ledger' && (
        <>
          {/* Client selector */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--ink2)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                Select client
              </label>
              <select
                className="status-select"
                style={{ minWidth: 220 }}
                value={ledgerId || ''}
                onChange={e => setLedgerId(parseInt(e.target.value) || null)}
              >
                <option value="">— choose a client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
              {ledgerClient && (
                <span style={{ fontSize:12, color:'var(--ink2)' }}>
                  {ledgerClient.areaCode && <span className="tag" style={{marginRight:6}}>{ledgerClient.areaCode}</span>}
                  <GstBadge pct={ledgerClient.gstPercent} />
                  <span style={{ marginLeft:8 }}>Salesperson: <strong>{ledgerClient.salesperson}</strong></span>
                </span>
              )}
              {ledgerClient && (
                <div style={{ marginLeft:'auto', display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => downloadClientLedgerPdf(ledgerClient, currentLedger, totalDebits, totalCredits, closingBalance)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => shareClientLedgerOnWhatsApp(ledgerClient, currentLedger, totalDebits, totalCredits, closingBalance)}
                  >
                    Share WhatsApp
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => printClientLedger(ledgerClient, currentLedger, totalDebits, totalCredits, closingBalance)}
                  >
                    <PrintIcon /> Print ledger
                  </button>
                </div>
              )}
            </div>
          </div>

          {!ledgerId && (
            <div className="card">
              <div className="empty-state">Select a client above to view their full ledger with all invoices and payments.</div>
            </div>
          )}

          {ledgerId && ledgerClient && (
            <>
              {/* Client summary strip */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
                <div className="metric-card">
                  <div className="metric-label">PY outstanding (opening)</div>
                  <div className="metric-value">{fmt(ledgerClient.pyOutstanding)}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Total invoiced (CY)</div>
                  <div className="metric-value">{fmt(totalDebits - (ledgerClient.pyOutstanding||0))}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Total payments received</div>
                  <div className="metric-value" style={{color:'var(--green)'}}>{fmt(totalCredits)}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Closing balance</div>
                  <div className="metric-value" style={{color: closingBalance > 0 ? 'var(--amber)' : 'var(--green)'}}>
                    {fmt(closingBalance)}
                  </div>
                </div>
              </div>

              {/* Ledger table */}
              <div className="card" style={{ padding:0 }}>
                <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <span style={{ fontWeight:600, fontSize:13 }}>{ledgerClient.name}</span>
                    <span className="text-muted text-small" style={{ marginLeft:10 }}>Account ledger</span>
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:12 }}>
                    <span>Credit limit: <strong>{fmt(ledgerClient.creditLimit)}</strong></span>
                    <span>Terms: <strong>{ledgerClient.paymentTerms}</strong></span>
                  </div>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{width:95}}>Date</th>
                        <th>Ref</th>
                        <th>Description</th>
                        <th style={{width:115, textAlign:'right'}}>Debit (invoice)</th>
                        <th style={{width:115, textAlign:'right'}}>Credit (payment)</th>
                        <th style={{width:120, textAlign:'right'}}>Running balance</th>
                        <th style={{width:100}}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLedger.map((row, i) => (
                        <tr
                          key={i}
                          className={row.type === 'invoice' || row.type === 'payment' ? 'clickable' : ''}
                          style={{ background: row.type==='opening' ? 'var(--bg)' : undefined }}
                          onClick={() => {
                            if (row.type === 'invoice')  nav(`/invoices/${row.id}`)
                            if (row.type === 'payment')  nav('/payments')
                          }}
                        >
                          <td className="text-muted text-small">{row.date || ''}</td>
                          <td>
                            {row.type === 'opening'
                              ? <span className="text-muted text-small" style={{fontStyle:'italic'}}>Opening</span>
                              : <span className="mono fw-600" style={{fontSize:11, color: row.type==='invoice'?'var(--blue-txt)':'var(--green)'}}>{row.ref}</span>}
                          </td>
                          <td style={{ fontSize:12 }}>{row.desc}</td>
                          <td style={{ textAlign:'right', color:'var(--red)', fontWeight: row.debit>0?600:400 }}>
                            {row.debit > 0 ? fmt(row.debit) : '—'}
                          </td>
                          <td style={{ textAlign:'right', color:'var(--green)', fontWeight: row.credit>0?600:400 }}>
                            {row.credit > 0 ? fmt(row.credit) : '—'}
                          </td>
                          <td style={{ textAlign:'right', fontWeight:700, color: row.balance>0?'var(--amber)':'var(--green)' }}>
                            {fmt(row.balance)}
                          </td>
                          <td>
                            {row.status
                              ? <Badge status={row.status} />
                              : row.type === 'opening'
                              ? <span className="badge badge-gray">Opening</span>
                              : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:'var(--bg)', fontWeight:700, borderTop:'2px solid var(--border)' }}>
                        <td colSpan={3} style={{ padding:'8px 9px', fontSize:12 }}>Totals</td>
                        <td style={{ textAlign:'right', padding:'8px 9px', color:'var(--red)' }}>{fmt(totalDebits)}</td>
                        <td style={{ textAlign:'right', padding:'8px 9px', color:'var(--green)' }}>{fmt(totalCredits)}</td>
                        <td style={{ textAlign:'right', padding:'8px 9px', fontSize:13, color: closingBalance>0?'var(--amber)':'var(--green)' }}>
                          {fmt(closingBalance)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
