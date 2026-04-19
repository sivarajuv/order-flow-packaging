// PrintTemplates.js — print Order, Job Card, Invoice in styled A4 window

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'IBM Plex Sans',sans-serif;font-size:11.5px;color:#1C1B18;padding:28px 36px}
.mono{font-family:'IBM Plex Mono',monospace;font-size:11px}
/* Header */
.doc-header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:2.5px solid #1C1B18;margin-bottom:20px}
.brand{font-size:22px;font-weight:600;letter-spacing:-.4px}
.brand-sub{font-size:11px;color:#6A6760;margin-top:2px}
.doc-no{font-size:20px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:#1D4ED8;text-align:right}
.doc-meta{font-size:11px;color:#6A6760;text-align:right;margin-top:3px;line-height:1.6}
/* Info grid */
.info-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
.info-box{border:1px solid #E2DFD8;border-radius:8px;padding:11px 13px}
.info-box h3{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#A09C97;margin-bottom:8px}
.info-line{display:flex;justify-content:space-between;padding:2.5px 0;border-bottom:1px solid #F4F3EE;font-size:11px}
.info-line:last-child{border-bottom:none}
.il{color:#6A6760}
.iv{font-weight:500;text-align:right}
/* Table */
table{width:100%;border-collapse:collapse;margin-bottom:14px}
th{background:#F4F3EE;padding:6px 9px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6A6760;border-bottom:2px solid #E2DFD8}
th.r{text-align:right}th.c{text-align:center}
td{padding:7px 9px;border-bottom:1px solid #F4F3EE;font-size:11px;vertical-align:middle}
td.r{text-align:right}td.c{text-align:center}td.b{font-weight:700}
/* Totals */
.totals-wrap{display:flex;justify-content:flex-end;margin-top:8px}
.totals-box{width:260px;border:1px solid #E2DFD8;border-radius:8px;padding:11px 13px}
.t-row{display:flex;justify-content:space-between;padding:3.5px 0;font-size:11.5px}
.t-row.mut span:first-child{color:#6A6760}
.t-row.big{font-weight:700;font-size:14px;border-top:2px solid #1C1B18;margin-top:5px;padding-top:7px}
.t-row.grn span:last-child{color:#15803D;font-weight:600}
.t-row.amb span:last-child{color:#B45309;font-weight:700}
/* Pipeline */
.pipe-wrap{display:flex;align-items:flex-start;margin:12px 0 18px;gap:0}
.p-step{flex:1;display:flex;flex-direction:column;align-items:center;position:relative}
.p-dot{width:22px;height:22px;border-radius:50%;border:2px solid #C9C6BC;background:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#6A6760;z-index:1}
.p-dot.done{background:#15803D;border-color:#15803D;color:#fff}
.p-dot.act{background:#1D4ED8;border-color:#1D4ED8;color:#fff}
.p-line{position:absolute;top:10px;left:calc(50% + 11px);right:calc(-50% + 11px);height:2px;background:#C9C6BC}
.p-line.done{background:#15803D}
.p-label{font-size:7.5px;font-weight:600;margin-top:4px;text-align:center;color:#A09C97}
.p-step.done .p-label{color:#15803D}.p-step.act .p-label{color:#1D4ED8}
/* Badges */
.bdg{display:inline-flex;padding:2px 6px;border-radius:20px;font-size:9.5px;font-weight:600}
.b-blue{background:#EFF6FF;color:#1E40AF}.b-green{background:#F0FDF4;color:#166534}
.b-amber{background:#FFFBEB;color:#92400E}.b-gray{background:#F4F3EE;color:#6A6760}
/* Footer */
.doc-footer{margin-top:28px;padding-top:12px;border-top:1px solid #E2DFD8;display:flex;justify-content:space-between;align-items:flex-end}
.foot-note{font-size:9.5px;color:#A09C97;line-height:1.5}
.sign-area{display:flex;gap:16px}
.sign-box{border:1px solid #E2DFD8;border-radius:6px;padding:6px 14px;min-width:130px;text-align:center}
.sign-line{height:1px;background:#E2DFD8;margin-bottom:4px;margin-top:20px}
.sign-lbl{font-size:8.5px;color:#A09C97}
@media print{body{padding:12px 16px}@page{margin:.8cm;size:A4}}
`

const open = html => {
  const w = window.open('', '_blank', 'width=960,height=720')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${CSS}</style></head><body>${html}</body></html>`)
  w.document.close()
  setTimeout(() => { w.focus(); w.print() }, 700)
}

const fmt = n => n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtN = n => Number(n || 0).toLocaleString('en-IN')
const stamp = () => new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })
const statusBadge = s => {
  const m = { NEW:'b-blue', IN_PRODUCTION:'b-amber', INVOICED:'b-green', COMPLETED:'b-green', UNPAID:'b-amber', PARTIALLY_PAID:'b-blue', PAID:'b-green', PENDING:'b-gray', IN_PRODUCTION:'b-amber', COMPLETED:'b-green' }
  return `<span class="bdg ${m[s]||'b-gray'}">${(s||'').replace(/_/g,' ')}</span>`
}

// ── Print Sales Order ─────────────────────────────────────
export function printOrder(order) {
  const lines = order.lines || []
  const total = lines.reduce((s, l) => s + (l.qty||0)*(l.unitPrice||0), 0)
  const rows = lines.map((l,i) => `<tr>
    <td>${i+1}</td>
    <td><strong>${l.productName||''}</strong><br/><span style="color:#6A6760;font-size:10px">${l.size||''} — ${l.handle||''}</span></td>
    <td class="mono">${l.stereoRef||'—'}</td>
    <td>${l.spec||'—'}</td>
    <td class="r">${fmtN(l.qty)}</td>
    <td class="r mono">${fmt(l.unitPrice)}</td>
    <td class="r b">${fmt((l.qty||0)*(l.unitPrice||0))}</td>
  </tr>`).join('')
  open(`
    <div class="doc-header">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Sales Order</div></div>
      <div>
        <div class="doc-no">${order.orderNo}</div>
        <div class="doc-meta">Order date: ${order.orderDate||'—'}<br>Delivery: ${order.deliveryDate||'—'}<br>Status: ${(order.status||'').replace(/_/g,' ')}</div>
      </div>
    </div>
    <div class="info-row">
      <div class="info-box"><h3>Client</h3>
        <div class="info-line"><span class="il">Name</span><span class="iv">${order.clientName||''}</span></div>
        <div class="info-line"><span class="il">Salesperson</span><span class="iv">${order.salesperson||'—'}</span></div>
        <div class="info-line"><span class="il">GST rate</span><span class="iv">${order.clientGstPercent}%</span></div>
        ${order.notes?`<div class="info-line"><span class="il">Notes</span><span class="iv">${order.notes}</span></div>`:''}
      </div>
      <div class="info-box"><h3>Order details</h3>
        <div class="info-line"><span class="il">Order no.</span><span class="iv mono">${order.orderNo}</span></div>
        <div class="info-line"><span class="il">Order date</span><span class="iv">${order.orderDate||''}</span></div>
        <div class="info-line"><span class="il">Delivery date</span><span class="iv">${order.deliveryDate||'—'}</span></div>
        <div class="info-line"><span class="il">No. of lines</span><span class="iv">${lines.length}</span></div>
        <div class="info-line"><span class="il">Total qty</span><span class="iv">${fmtN(lines.reduce((s,l)=>s+(l.qty||0),0))} pcs</span></div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>Stereo ref</th><th>Spec / notes</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Line total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals-wrap"><div class="totals-box">
      <div class="t-row mut"><span>Subtotal (excl. GST)</span><span>${fmt(total)}</span></div>
      <div class="t-row mut"><span>GST — computed at invoice</span><span>—</span></div>
      <div class="t-row big"><span>Order value</span><span>${fmt(total)}</span></div>
    </div></div>
    <div class="doc-footer">
      <div class="foot-note">Generated by OrderFlow &nbsp;|&nbsp; ${stamp()}</div>
      <div class="sign-area">
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">Prepared by</div></div>
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">Authorised by</div></div>
      </div>
    </div>`)
}

// ── Print Job Card ────────────────────────────────────────
const STAGE_KEYS   = ['STEREO_AVAILABLE','MATERIAL','CUTTING','STITCHING','HANDLE','QC_CHECK_PACKING','DELIVERY']
const STAGE_LABELS = { STEREO_AVAILABLE:'Stereo', MATERIAL:'Material', CUTTING:'Cutting', STITCHING:'Stitching', HANDLE:'Handle', QC_CHECK_PACKING:'QC & Pack', DELIVERY:'Delivery' }

export function printJobCard(jc) {
  const doneSet = new Set(jc.doneStages || [])
  const firstPend = STAGE_KEYS.findIndex(s => !doneSet.has(s))

  const pipeHtml = STAGE_KEYS.map((s, i) => {
    const done = doneSet.has(s)
    const act  = !done && i === firstPend && doneSet.size > 0
    const cls  = done ? 'done' : act ? 'act' : ''
    const prevDone = i > 0 && doneSet.has(STAGE_KEYS[i-1])
    return `<div class="p-step ${cls}">
      ${i < STAGE_KEYS.length-1 ? `<div class="p-line ${prevDone||done?'done':''}"></div>` : ''}
      <div class="p-dot ${cls}">${done ? '✓' : i+1}</div>
      <div class="p-label">${STAGE_LABELS[s]}</div>
    </div>`
  }).join('')

  const actRows = (jc.activities || []).map((a, i) => `<tr>
    <td>${i+1}</td>
    <td class="mono">${a.activityTime ? a.activityTime.slice(0,16).replace('T',' ') : '—'}</td>
    <td><span class="bdg b-blue" style="font-size:9px">${(a.activityType||'').replace(/_/g,' ')}</span></td>
    <td><strong>${a.description||''}</strong></td>
    <td>${a.performedBy||'—'}</td>
    <td>${a.notes||'—'}</td>
  </tr>`).join('')

  open(`
    <div class="doc-header">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Job Card</div></div>
      <div>
        <div class="doc-no">${jc.jobCardNo}</div>
        <div class="doc-meta">Order: ${jc.orderNo||''}<br>Due: <strong>${jc.dueDate||'—'}</strong><br>${statusBadge(jc.status)}</div>
      </div>
    </div>
    <div class="info-row">
      <div class="info-box"><h3>Product specification</h3>
        <div class="info-line"><span class="il">Product</span><span class="iv"><strong>${jc.productName||''}</strong></span></div>
        <div class="info-line"><span class="il">SKU</span><span class="iv mono">${jc.sku||''}</span></div>
        <div class="info-line"><span class="il">Size</span><span class="iv">${jc.size||''}</span></div>
        <div class="info-line"><span class="il">Handle</span><span class="iv">${jc.handle||''}</span></div>
        <div class="info-line"><span class="il">Quantity</span><span class="iv"><strong>${fmtN(jc.qty)} pcs</strong></span></div>
        ${jc.spec?`<div class="info-line"><span class="il">Spec</span><span class="iv">${jc.spec}</span></div>`:''}
        ${jc.stereoRef?`<div class="info-line"><span class="il">Stereo ref</span><span class="iv mono">${jc.stereoRef}</span></div>`:''}
      </div>
      <div class="info-box"><h3>Order & client</h3>
        <div class="info-line"><span class="il">Client</span><span class="iv"><strong>${jc.clientName||''}</strong></span></div>
        <div class="info-line"><span class="il">Salesperson</span><span class="iv">${jc.salesperson||'—'}</span></div>
        <div class="info-line"><span class="il">Order no.</span><span class="iv mono">${jc.orderNo||''}</span></div>
        <div class="info-line"><span class="il">Start date</span><span class="iv">${jc.startDate||''}</span></div>
        <div class="info-line"><span class="il">Due date</span><span class="iv"><strong>${jc.dueDate||''}</strong></span></div>
        ${jc.instructions?`<div class="info-line"><span class="il">Instructions</span><span class="iv">${jc.instructions}</span></div>`:''}
      </div>
    </div>
    <h3 style="font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#A09C97;margin-bottom:6px">Production pipeline</h3>
    <div class="pipe-wrap">${pipeHtml}</div>
    <table>
      <thead><tr><th>#</th><th>Date / time</th><th>Stage</th><th>Description</th><th>Performed by</th><th>Notes</th></tr></thead>
      <tbody>${actRows || '<tr><td colspan="6" style="text-align:center;color:#A09C97;padding:12px">No activities logged yet</td></tr>'}</tbody>
    </table>
    <div class="doc-footer">
      <div class="foot-note">Generated by OrderFlow &nbsp;|&nbsp; ${stamp()}</div>
      <div class="sign-area">
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">Floor supervisor</div></div>
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">QC sign-off</div></div>
      </div>
    </div>`)
}

// ── Print Invoice ─────────────────────────────────────────
export function printInvoice(inv) {
  const lines = inv.lines || []
  const rows = lines.map((l,i) => `<tr>
    <td>${i+1}</td>
    <td><strong>${l.productName||''}</strong><br/><span style="color:#6A6760;font-size:10px">${l.size||''} — ${l.handle||''}</span></td>
    <td class="r">${fmtN(l.qty)}</td>
    <td class="r mono">${fmt(l.unitPrice)}</td>
    <td class="c">${l.taxPercent}%</td>
    <td class="r">${fmt(l.taxAmount)}</td>
    <td class="r b">${fmt(l.lineTotal)}</td>
  </tr>`).join('')

  const paid = inv.paidAmount || 0
  const balance = inv.balanceDue || 0
  const stBadge = inv.status === 'PAID' ? '<span class="bdg b-green">PAID</span>'
    : inv.status === 'PARTIALLY_PAID' ? '<span class="bdg b-blue">PARTIALLY PAID</span>'
    : '<span class="bdg b-amber">UNPAID</span>'

  open(`
    <div class="doc-header">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Tax Invoice</div></div>
      <div>
        <div class="doc-no">${inv.invoiceNo}</div>
        <div class="doc-meta">${stBadge}<br>Date: ${inv.invoiceDate||''}<br>Due: <strong>${inv.dueDate||''}</strong></div>
      </div>
    </div>
    <div class="info-row">
      <div class="info-box"><h3>Bill to</h3>
        <div class="info-line"><span class="il">Client</span><span class="iv"><strong>${inv.clientName||''}</strong></span></div>
        ${inv.clientGstNo?`<div class="info-line"><span class="il">GSTIN</span><span class="iv mono">${inv.clientGstNo}</span></div>`:''}
      </div>
      <div class="info-box"><h3>Invoice details</h3>
        <div class="info-line"><span class="il">Invoice no.</span><span class="iv mono">${inv.invoiceNo}</span></div>
        <div class="info-line"><span class="il">Order ref</span><span class="iv mono">${inv.orderNo||''}</span></div>
        <div class="info-line"><span class="il">Invoice date</span><span class="iv">${inv.invoiceDate||''}</span></div>
        <div class="info-line"><span class="il">Due date</span><span class="iv"><strong>${inv.dueDate||''}</strong></span></div>
        <div class="info-line"><span class="il">GST rate</span><span class="iv">${inv.gstPercent}%</span></div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th class="r">Qty</th><th class="r">Rate</th><th class="c">GST%</th><th class="r">Tax amt</th><th class="r">Line total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals-wrap"><div class="totals-box">
      <div class="t-row mut"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
      <div class="t-row mut"><span>GST ${inv.gstPercent}%</span><span>${fmt(inv.taxTotal)}</span></div>
      <div class="t-row big"><span>Invoice total</span><span>${fmt(inv.total)}</span></div>
      ${paid > 0 ? `<div class="t-row grn"><span>Amount paid</span><span>${fmt(paid)}</span></div>` : ''}
      <div class="t-row amb"><span>Balance due</span><span>${fmt(balance)}</span></div>
    </div></div>
    <div class="doc-footer">
      <div class="foot-note">This is a computer-generated document.<br>Generated by OrderFlow &nbsp;|&nbsp; ${stamp()}</div>
      <div class="sign-area">
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">Authorised signatory</div></div>
      </div>
    </div>`)
}

// ── Print Payments ────────────────────────────────────────
export function printPayments(payments) {
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const rows = payments.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="mono b">${p.paymentRef}</td>
      <td><strong>${p.clientName || ''}</strong></td>
      <td>${p.paymentDate || ''}</td>
      <td><span style="background:#EFF6FF;color:#1E40AF;padding:2px 6px;border-radius:20px;font-size:9px;font-weight:700">${p.mode || ''}</span></td>
      <td style="color:#15803D;font-weight:700" class="r">${fmt(p.amount)}</td>
      <td class="mono" style="font-size:9px">${(p.allocations || []).map(a => a.invoiceNo).join(', ') || 'Unallocated'}</td>
      <td class="mono" style="font-size:9px">${p.bankRef || '—'}</td>
      <td><span style="background:#F0FDF4;color:#166534;padding:2px 6px;border-radius:20px;font-size:9px;font-weight:700">${p.status || ''}</span></td>
    </tr>`).join('')
  open(`
    <div class="hdr">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Payment Statement</div></div>
      <div>
        <div class="dno" style="font-size:14px">All Payments</div>
        <div class="dmeta">Printed: ${stamp()}<br>Total records: ${payments.length}</div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Payment ref</th><th>Client</th><th>Date</th><th>Mode</th><th class="r">Amount</th><th>Allocated to</th><th>Bank ref</th><th>Status</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="9" style="text-align:center;color:#A09C97;padding:12px">No payments</td></tr>'}</tbody>
    </table>
    <div class="twrap"><div class="tbox">
      <div class="tr mut"><span>No. of payments</span><span>${payments.length}</span></div>
      <div class="tr big"><span>Total received</span><span style="color:#15803D">${fmt(total)}</span></div>
    </div></div>
    <div class="foot"><div class="fn">Generated by OrderFlow | ${stamp()}</div>
      <div class="sarea"><div class="sbox"><div class="sline"></div><div class="slbl">Accounts</div></div></div>
    </div>`)
}

// ── Print Reports ─────────────────────────────────────────
export function printReports(data) {
  const { clients = [], orders = [], invoices = [], payments = [] } = data
  const totalCY = clients.reduce((s, c) => s + (c.cyOutstanding || 0), 0)
  const totalPY = clients.reduce((s, c) => s + (c.pyOutstanding || 0), 0)
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalOrderVal = orders.reduce((s, o) => s + (o.subtotal || 0), 0)

  const orderRows = ['NEW','IN_PRODUCTION','INVOICED','COMPLETED','CANCELLED'].map(st => {
    const g = orders.filter(o => o.status === st)
    const stLabels = { NEW:'New', IN_PRODUCTION:'In production', INVOICED:'Invoiced', COMPLETED:'Completed', CANCELLED:'Cancelled' }
    const stColors = { NEW:'#1E40AF', IN_PRODUCTION:'#92400E', INVOICED:'#166534', COMPLETED:'#166534', CANCELLED:'#991B1B' }
    const stBgs = { NEW:'#EFF6FF', IN_PRODUCTION:'#FFFBEB', INVOICED:'#F0FDF4', COMPLETED:'#F0FDF4', CANCELLED:'#FEF2F2' }
    return `<tr><td><span style="background:${stBgs[st]};color:${stColors[st]};padding:2px 6px;border-radius:20px;font-size:9px;font-weight:700">${stLabels[st]}</span></td><td class="r b">${g.length}</td><td class="r b">${fmt(g.reduce((s, o) => s + (o.subtotal || 0), 0))}</td></tr>`
  }).join('')

  const invRows = ['UNPAID','PARTIALLY_PAID','PAID'].map(st => {
    const g = invoices.filter(i => i.status === st)
    const stLabels = { UNPAID:'Unpaid', PARTIALLY_PAID:'Partially paid', PAID:'Paid' }
    const stColors = { UNPAID:'#92400E', PARTIALLY_PAID:'#1E40AF', PAID:'#166534' }
    const stBgs = { UNPAID:'#FFFBEB', PARTIALLY_PAID:'#EFF6FF', PAID:'#F0FDF4' }
    return `<tr><td><span style="background:${stBgs[st]};color:${stColors[st]};padding:2px 6px;border-radius:20px;font-size:9px;font-weight:700">${stLabels[st]}</span></td><td class="r b">${g.length}</td><td class="r b">${fmt(g.reduce((s, i) => s + (i.balanceDue || 0), 0))}</td></tr>`
  }).join('')

  const clientRows = clients.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.salesperson || ''}</td>
      <td>${c.gstPercent || 0}%</td>
      <td class="r">${fmt(c.creditLimit)}</td>
      <td class="r">${fmt(c.pyOutstanding)}</td>
      <td class="r" style="color:#B45309;font-weight:600">${fmt(c.cyOutstanding)}</td>
      <td class="r b">${fmt((c.pyOutstanding || 0) + (c.cyOutstanding || 0))}</td>
      <td><span style="background:${c.status==='ACTIVE'?'#F0FDF4':c.status==='ON_HOLD'?'#FFFBEB':'#F4F3EE'};color:${c.status==='ACTIVE'?'#166534':c.status==='ON_HOLD'?'#92400E':'#6A6760'};padding:2px 6px;border-radius:20px;font-size:9px;font-weight:700">${c.status}</span></td>
    </tr>`).join('')

  open(`
    <div class="hdr">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Business Report</div></div>
      <div><div class="dno" style="font-size:14px">Summary Report</div><div class="dmeta">Printed: ${stamp()}</div></div>
    </div>
    <!-- Metrics -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">
      ${[
        ['Total order value', fmt(totalOrderVal), '#1C1B18'],
        ['Payments received', fmt(totalPaid), '#15803D'],
        ['PY outstanding', fmt(totalPY), '#1C1B18'],
        ['CY outstanding', fmt(totalCY), '#B45309'],
      ].map(([l, v, col]) => `<div style="border:1px solid #E2DFD8;border-radius:7px;padding:10px 12px"><div style="font-size:8px;font-weight:700;color:#A09C97;letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px">${l}</div><div style="font-size:18px;font-weight:700;color:${col}">${v}</div></div>`).join('')}
    </div>
    <!-- Order & Invoice status -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
      <div>
        <h3 style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#A09C97;margin-bottom:8px">Order status summary</h3>
        <table><thead><tr><th>Status</th><th class="r">Count</th><th class="r">Value</th></tr></thead><tbody>${orderRows}</tbody></table>
      </div>
      <div>
        <h3 style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#A09C97;margin-bottom:8px">Invoice status summary</h3>
        <table><thead><tr><th>Status</th><th class="r">Count</th><th class="r">Balance due</th></tr></thead><tbody>${invRows}</tbody></table>
      </div>
    </div>
    <!-- Client ageing -->
    <h3 style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#A09C97;margin-bottom:8px">Client outstanding ageing</h3>
    <table>
      <thead><tr><th>Client</th><th>Salesperson</th><th>GST%</th><th class="r">Credit limit</th><th class="r">PY o/s</th><th class="r">CY o/s</th><th class="r">Total</th><th>Status</th></tr></thead>
      <tbody>
        ${clientRows}
        <tr style="background:#F4F3EE;font-weight:700">
          <td colspan="4">Total</td>
          <td class="r">${fmt(totalPY)}</td>
          <td class="r" style="color:#B45309">${fmt(totalCY)}</td>
          <td class="r">${fmt(totalPY + totalCY)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <div class="foot"><div class="fn">Generated by OrderFlow | ${stamp()}</div></div>`)
}

// ── Print Clients List ────────────────────────────────────
export function printClients(clients) {
  const totalCY = clients.reduce((s, c) => s + (c.cyOutstanding || 0), 0)
  const totalPY = clients.reduce((s, c) => s + (c.pyOutstanding || 0), 0)
  const rows = clients.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="mono">${c.code}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.salesperson || ''}</td>
      <td class="mono" style="font-size:9px">${c.gstNo || '—'}</td>
      <td>${c.phone || ''}</td>
      <td>${c.gstPercent || 0}%</td>
      <td class="r">${fmt(c.creditLimit)}</td>
      <td>${c.paymentTerms || ''}</td>
      <td class="r">${fmt(c.pyOutstanding)}</td>
      <td class="r" style="color:#B45309;font-weight:600">${fmt(c.cyOutstanding)}</td>
      <td class="r b">${fmt((c.pyOutstanding || 0) + (c.cyOutstanding || 0))}</td>
      <td><span style="background:${c.status==='ACTIVE'?'#F0FDF4':c.status==='ON_HOLD'?'#FFFBEB':'#F4F3EE'};color:${c.status==='ACTIVE'?'#166534':c.status==='ON_HOLD'?'#92400E':'#6A6760'};padding:2px 6px;border-radius:20px;font-size:9px;font-weight:700">${c.status}</span></td>
    </tr>`).join('')
  open(`
    <div class="hdr">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Client Directory</div></div>
      <div>
        <div class="dno" style="font-size:14px">All Clients</div>
        <div class="dmeta">Printed: ${stamp()}<br>${clients.length} clients</div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Code</th><th>Name</th><th>Salesperson</th><th>GST no.</th><th>Phone</th><th>GST%</th><th class="r">Credit limit</th><th>Terms</th><th class="r">PY o/s</th><th class="r">CY o/s</th><th class="r">Total o/s</th><th>Status</th></tr></thead>
      <tbody>
        ${rows}
        <tr style="background:#F4F3EE;font-weight:700">
          <td colspan="9">Total</td>
          <td class="r">${fmt(totalPY)}</td>
          <td class="r" style="color:#B45309">${fmt(totalCY)}</td>
          <td class="r">${fmt(totalPY + totalCY)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <div class="foot"><div class="fn">Generated by OrderFlow | ${stamp()}</div></div>`)
}

// ── Print Client Detail ───────────────────────────────────
export function printClientDetail(client, clientProducts) {
  const cps = clientProducts || []
  const cpRows = cps.map((cp, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="mono">${cp.productSku || ''}</td>
      <td><strong>${cp.productName || ''}</strong></td>
      <td>${cp.size || ''}</td>
      <td>${cp.handle || ''}</td>
      <td class="r" style="text-decoration:line-through;color:#A09C97">${fmt(cp.basePrice)}</td>
      <td class="r b" style="color:#1E40AF">${fmt(cp.agreedPrice)}</td>
      <td class="mono" style="font-size:9px">${cp.stereoRef || '—'}</td>
      <td style="font-size:9px">${cp.specialSpec || '—'}</td>
    </tr>`).join('')
  open(`
    <div class="hdr">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Client Profile</div></div>
      <div>
        <div class="dno">${client.code || ''}</div>
        <div class="dmeta">${client.name || ''}<br>Printed: ${stamp()}</div>
      </div>
    </div>
    <div class="igrid">
      <div class="ibox"><h3>Client information</h3>
        <div class="iline"><span class="il">Client name</span><span class="iv"><strong>${client.name || ''}</strong></span></div>
        <div class="iline"><span class="il">Code</span><span class="iv mono">${client.code || ''}</span></div>
        <div class="iline"><span class="il">GST no.</span><span class="iv mono">${client.gstNo || '—'}</span></div>
        <div class="iline"><span class="il">Phone</span><span class="iv">${client.phone || ''}</span></div>
        <div class="iline"><span class="il">Email</span><span class="iv">${client.email || ''}</span></div>
        <div class="iline"><span class="il">Salesperson</span><span class="iv">${client.salesperson || ''}</span></div>
        <div class="iline"><span class="il">Payment terms</span><span class="iv">${client.paymentTerms || ''}</span></div>
        <div class="iline"><span class="il">GST rate</span><span class="iv">${client.gstPercent || 0}%</span></div>
        <div class="iline"><span class="il">Credit limit</span><span class="iv"><strong>${fmt(client.creditLimit)}</strong></span></div>
        <div class="iline"><span class="il">Status</span><span class="iv">${client.status || ''}</span></div>
        ${client.billingAddress ? `<div class="iline"><span class="il">Billing address</span><span class="iv">${client.billingAddress}</span></div>` : ''}
      </div>
      <div class="ibox"><h3>Outstanding balance</h3>
        <div class="iline"><span class="il">PY outstanding</span><span class="iv">${fmt(client.pyOutstanding)}</span></div>
        <div class="iline"><span class="il">CY outstanding</span><span class="iv" style="color:#B45309;font-weight:700">${fmt(client.cyOutstanding)}</span></div>
        <div class="iline" style="font-weight:700;font-size:12px"><span class="il">Total outstanding</span><span class="iv">${fmt((client.pyOutstanding || 0) + (client.cyOutstanding || 0))}</span></div>
        <div style="margin-top:10px"><h3 style="margin-bottom:6px">Products mapped: ${cps.length}</h3>
        ${cps.length > 0 ? `<div style="font-size:9px;color:#6A6760">${cps.map(cp => cp.productName).join(', ')}</div>` : '<div style="font-size:9px;color:#A09C97">No products mapped</div>'}</div>
      </div>
    </div>
    ${cps.length > 0 ? `
    <h3 style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#A09C97;margin-bottom:8px">Client-specific products & agreed rates</h3>
    <table>
      <thead><tr><th>#</th><th>SKU</th><th>Product</th><th>Size</th><th>Handle</th><th class="r">Base price</th><th class="r">Agreed price</th><th>Stereo ref</th><th>Spec</th></tr></thead>
      <tbody>${cpRows}</tbody>
    </table>` : ''}
    <div class="foot"><div class="fn">Generated by OrderFlow | ${stamp()}</div>
      <div class="sarea"><div class="sbox"><div class="sline"></div><div class="slbl">Authorised</div></div></div>
    </div>`)
}

// ── Print Client Ledger ───────────────────────────────────
export function printClientLedger(client, ledger, totalDebits, totalCredits, closingBalance) {
  const rows = ledger.map((row, i) => {
    const isOpening = row.type === 'opening'
    const isInvoice = row.type === 'invoice'
    const isPayment = row.type === 'payment'
    const bgStyle   = isOpening ? 'background:#F4F3EE' : ''
    const refStyle  = isInvoice ? 'color:#1E40AF;font-weight:700' : isPayment ? 'color:#15803D;font-weight:700' : 'color:#6A6760;font-style:italic'
    const balColor  = (row.balance || 0) > 0 ? '#B45309' : '#15803D'
    return `
      <tr style="${bgStyle}">
        <td style="color:#6A6760">${row.date || ''}</td>
        <td><span class="mono" style="${refStyle};font-size:9px">${isOpening ? 'Opening' : (row.ref || '')}</span></td>
        <td>${row.desc || ''}</td>
        <td class="r" style="color:${row.debit > 0 ? '#B91C1C' : '#A09C97'};font-weight:${row.debit > 0 ? 600 : 400}">
          ${row.debit > 0 ? fmt(row.debit) : '—'}
        </td>
        <td class="r" style="color:${row.credit > 0 ? '#15803D' : '#A09C97'};font-weight:${row.credit > 0 ? 600 : 400}">
          ${row.credit > 0 ? fmt(row.credit) : '—'}
        </td>
        <td class="r b" style="color:${balColor}">${fmt(row.balance)}</td>
        <td>${row.status
            ? `<span style="background:${row.status==='PAID'?'#F0FDF4':row.status==='PARTIALLY_PAID'?'#EFF6FF':row.status==='CONFIRMED'?'#F0FDF4':'#FFFBEB'};color:${row.status==='PAID'?'#166534':row.status==='PARTIALLY_PAID'?'#1E40AF':row.status==='CONFIRMED'?'#166534':'#92400E'};padding:2px 5px;border-radius:10px;font-size:8px;font-weight:700">${row.status.replace(/_/g,' ')}</span>`
            : ''}
        </td>
      </tr>`
  }).join('')

  open(`
    <div class="hdr">
      <div><div class="brand">OrderFlow</div><div class="brand-sub">Client Account Ledger</div></div>
      <div>
        <div class="dno">${client.code || ''}</div>
        <div class="dmeta"><strong>${client.name || ''}</strong><br>Printed: ${stamp()}</div>
      </div>
    </div>

    <div class="igrid" style="margin-bottom:16px">
      <div class="ibox"><h3>Client information</h3>
        <div class="iline"><span class="il">Name</span><span class="iv"><strong>${client.name || ''}</strong></span></div>
        <div class="iline"><span class="il">Code</span><span class="iv mono">${client.code || ''}</span></div>
        ${client.areaCode ? `<div class="iline"><span class="il">Area code</span><span class="iv">${client.areaCode}</span></div>` : ''}
        <div class="iline"><span class="il">GST no.</span><span class="iv mono">${client.gstNo || '—'}</span></div>
        <div class="iline"><span class="il">Salesperson</span><span class="iv">${client.salesperson || ''}</span></div>
        <div class="iline"><span class="il">Payment terms</span><span class="iv">${client.paymentTerms || ''}</span></div>
        <div class="iline"><span class="il">GST rate</span><span class="iv">${client.gstPercent || 0}%</span></div>
        <div class="iline"><span class="il">Credit limit</span><span class="iv"><strong>${fmt(client.creditLimit)}</strong></span></div>
      </div>
      <div class="ibox"><h3>Account summary</h3>
        <div class="iline"><span class="il">Opening balance (PY)</span><span class="iv">${fmt(client.pyOutstanding)}</span></div>
        <div class="iline"><span class="il">Total invoiced (debit)</span><span class="iv" style="color:#B91C1C;font-weight:600">${fmt(totalDebits)}</span></div>
        <div class="iline"><span class="il">Total received (credit)</span><span class="iv" style="color:#15803D;font-weight:600">${fmt(totalCredits)}</span></div>
        <div class="iline" style="font-weight:700;font-size:12px">
          <span class="il">Closing balance</span>
          <span class="iv" style="color:${closingBalance > 0 ? '#B45309' : '#15803D'};font-size:13px">${fmt(closingBalance)}</span>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:85px">Date</th>
          <th style="width:110px">Reference</th>
          <th>Description</th>
          <th class="r" style="width:110px">Debit (invoice)</th>
          <th class="r" style="width:110px">Credit (payment)</th>
          <th class="r" style="width:115px">Balance</th>
          <th style="width:95px">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background:#F4F3EE;font-weight:700;border-top:2px solid #1C1B18">
          <td colspan="3" style="padding:7px 8px">Total</td>
          <td class="r" style="padding:7px 8px;color:#B91C1C">${fmt(totalDebits)}</td>
          <td class="r" style="padding:7px 8px;color:#15803D">${fmt(totalCredits)}</td>
          <td class="r" style="padding:7px 8px;font-size:13px;color:${closingBalance > 0 ? '#B45309' : '#15803D'}">${fmt(closingBalance)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="foot">
      <div class="fn">This is a computer-generated statement.<br>Generated by OrderFlow | ${stamp()}</div>
      <div class="sarea">
        <div class="sbox"><div class="sline"></div><div class="slbl">Authorised signatory</div></div>
      </div>
    </div>`)
}
