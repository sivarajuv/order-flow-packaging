const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'IBM Plex Sans',sans-serif;font-size:11.5px;color:#1C1B18;padding:24px 30px}
.mono{font-family:'IBM Plex Mono',monospace}
.doc-header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;padding-bottom:14px;border-bottom:2px solid #1C1B18;margin-bottom:18px}
.brand{font-size:26px;font-weight:700;letter-spacing:.02em;color:#8F2020}
.brand-sub{font-size:11px;color:#5F5A52;margin-top:4px}
.brand-meta{font-size:10px;color:#5F5A52;line-height:1.45;margin-top:8px;max-width:420px}
.doc-no{font-size:20px;font-weight:700;color:#1D4ED8;text-align:right}
.doc-meta{font-size:11px;color:#5F5A52;line-height:1.6;text-align:right}
.info-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
.info-box{border:1px solid #D8D2C7;border-radius:8px;padding:11px 13px}
.info-box h3{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#8A847A;margin-bottom:8px}
.info-line{display:flex;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px solid #F1EEE8}
.info-line:last-child{border-bottom:none}
.il{color:#6A6760}
.iv{text-align:right;font-weight:500}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
th{background:#F4F1EA;padding:7px 8px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6A6760;border-bottom:2px solid #D8D2C7}
td{padding:7px 8px;border-bottom:1px solid #F1EEE8;vertical-align:top}
th.r,td.r{text-align:right}
th.c,td.c{text-align:center}
.totals-wrap{display:flex;justify-content:flex-end}
.totals-box{width:310px;border:1px solid #D8D2C7;border-radius:8px;padding:10px 12px}
.t-row{display:flex;justify-content:space-between;padding:3px 0}
.t-row.mut span:first-child{color:#6A6760}
.t-row.big{border-top:2px solid #1C1B18;margin-top:5px;padding-top:7px;font-weight:700;font-size:14px}
.doc-footer{margin-top:24px;padding-top:12px;border-top:1px solid #D8D2C7;display:flex;justify-content:space-between;gap:16px}
.foot-note{font-size:9.5px;color:#8A847A;line-height:1.5}
.sign-area{display:flex;gap:14px}
.sign-box{border:1px solid #D8D2C7;border-radius:6px;padding:6px 12px;min-width:140px;text-align:center}
.sign-line{height:1px;background:#D8D2C7;margin-top:18px;margin-bottom:4px}
.sign-lbl{font-size:8.5px;color:#8A847A}
.challan-shell{border:2px solid #857748;padding:10px;background:#F5E96C}
.challan-head{border:2px solid #857748;padding:10px 12px;margin-bottom:10px}
.challan-title{font-size:16px;font-weight:700;color:#8F2020;text-align:right}
.challan-grid{display:grid;grid-template-columns:1.6fr .9fr;gap:8px;margin-bottom:8px}
.challan-box{border:2px solid #857748;min-height:90px;padding:8px 10px;background:rgba(255,255,255,.12)}
.challan-table{width:100%;border-collapse:collapse}
.challan-table th,.challan-table td{border:2px solid #857748;padding:8px;background:transparent}
.challan-table th{font-size:10px;background:rgba(255,255,255,.18);color:#3B372B}
.challan-total{font-size:16px;font-weight:700;text-align:right;margin-top:10px}
@media print{body{padding:12px 14px}@page{margin:.7cm;size:A4}}
`

const COMPANY = {
  name: 'ABHISHEK POLYPLAST',
  subtitle: 'Mfg. of Paper Bags, HM, LD, PP & Multicolour Flexo and Rotoprinted Carry Bags',
  address: 'Sr. No. 40/4B/2A/12, Kondhwa Budruk, Behind Brown Bakery, Yewalewadi, Pune - 411048.',
  contact: 'Mob.: +91 7757006547, 7030599200    Email: abhishek.packaging@outlook.com',
  gst: '27BUUPS6703H1ZZ',
}

const open = html => {
  const w = window.open('', '_blank', 'width=980,height=760')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${CSS}</style></head><body>${html}</body></html>`)
  w.document.close()
  setTimeout(() => { w.focus(); w.print() }, 500)
}

const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const fmt = n => n == null ? '-' : 'Rs ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtN = n => Number(n || 0).toLocaleString('en-IN')
const stamp = () => fmtDate(new Date().toISOString().slice(0, 10))
const pct = v => `${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const fmtDate = value => {
  if (!value) return '-'
  const parts = String(value).split('-')
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  return esc(value)
}
const splitGstPercent = pct => Number(pct || 0) / 2
const splitGstAmount = tax => Number(tax || 0) / 2
const printDiscount = value => Number(value || 0) > 0 ? pct(value) : '-'
const slug = value => String(value || 'document').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'document'
const discountPctOnInvoiceAmount = inv => {
  const subtotal = Number(inv?.subtotal || 0)
  const taxTotal = Number(inv?.taxTotal || 0)
  const invoiceDiscount = Number(inv?.invoiceDiscount || 0)
  const grossInvoiceAmount = subtotal + taxTotal
  if (grossInvoiceAmount <= 0 || invoiceDiscount <= 0) return '0%'
  return `${((invoiceDiscount / grossInvoiceAmount) * 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

const companyHeader = title => `
  <div class="doc-header">
    <div>
      <div class="brand">${COMPANY.name}</div>
      <div class="brand-sub">${title}</div>
      <div class="brand-meta">${COMPANY.subtitle}<br>${COMPANY.address}<br>${COMPANY.contact}<br>GSTIN: ${COMPANY.gst}</div>
    </div>
    <div class="doc-meta">Printed: ${stamp()}</div>
  </div>
`

const pdfEscape = value => String(value ?? '')
  .replaceAll('\\', '\\\\')
  .replaceAll('(', '\\(')
  .replaceAll(')', '\\)')

const wrapText = (text, maxChars = 78) => {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines = []
  let current = words[0]
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`
    if (next.length <= maxChars) current = next
    else {
      lines.push(current)
      current = words[i]
    }
  }
  lines.push(current)
  return lines
}

const buildSimplePdf = pages => {
  const objects = []
  const addObject = value => {
    objects.push(value)
    return objects.length
  }

  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')

  const pageIds = []
  const contentIds = []

  pages.forEach(lines => {
    const streamLines = ['BT']
    lines.forEach(line => {
      if (line.font === 'bold') streamLines.push('/F2 11 Tf')
      else streamLines.push('/F1 10 Tf')
      streamLines.push(`1 0 0 1 ${line.x} ${line.y} Tm (${pdfEscape(line.text)}) Tj`)
    })
    streamLines.push('ET')
    const content = streamLines.join('\n')
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    contentIds.push(contentId)
    pageIds.push(addObject(''))
  })

  const pagesId = addObject('')

  pageIds.forEach((pageId, index) => {
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`
  })

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((obj, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}

const ledgerPdfPages = (client, ledger, totalDebits, totalCredits, closingBalance) => {
  const lines = []
  const push = (text, x, y, font = 'normal') => lines.push({ text, x, y, font })
  const startY = 800
  const lineStep = 14
  let y = startY

  push(COMPANY.name, 40, y, 'bold'); y -= 18
  push('Client Ledger', 40, y, 'bold'); y -= 20
  push(`Printed: ${stamp()}`, 420, 800)
  push(`Client: ${client.name}`, 40, y); y -= lineStep
  push(`Code: ${client.code || '-'}`, 40, y)
  push(`GST No: ${client.gstNo || '-'}`, 220, y)
  push(`Closing Balance: ${fmt(closingBalance)}`, 390, y)
  y -= 24

  const headerY = y
  push('Date', 40, headerY, 'bold')
  push('Reference', 105, headerY, 'bold')
  push('Description', 200, headerY, 'bold')
  push('Debit', 420, headerY, 'bold')
  push('Credit', 485, headerY, 'bold')
  push('Balance', 540, headerY, 'bold')
  y -= 16

  const pages = []
  const flushPage = () => {
    pages.push([...lines])
    lines.length = 0
    y = startY
    push(COMPANY.name, 40, y, 'bold'); y -= 18
    push('Client Ledger', 40, y, 'bold'); y -= 20
    push(`Client: ${client.name}`, 40, y)
    push(`Printed: ${stamp()}`, 420, y)
    y -= 24
    push('Date', 40, y, 'bold')
    push('Reference', 105, y, 'bold')
    push('Description', 200, y, 'bold')
    push('Debit', 420, y, 'bold')
    push('Credit', 485, y, 'bold')
    push('Balance', 540, y, 'bold')
    y -= 16
  }

  ;(ledger || []).forEach(row => {
    const wrappedDesc = wrapText(row.desc || '-', 38)
    const blockHeight = wrappedDesc.length * lineStep + 4
    if (y - blockHeight < 70) flushPage()
    push(row.date || '-', 40, y)
    push(row.ref || '-', 105, y)
    wrappedDesc.forEach((part, idx) => push(part, 200, y - (idx * lineStep)))
    push(row.debit ? fmt(row.debit) : '-', 420, y)
    push(row.credit ? fmt(row.credit) : '-', 485, y)
    push(fmt(row.balance), 540, y)
    y -= blockHeight
  })

  if (y < 90) flushPage()
  push(`Total Debits: ${fmt(totalDebits)}`, 40, y, 'bold'); y -= lineStep
  push(`Total Credits: ${fmt(totalCredits)}`, 40, y, 'bold'); y -= lineStep
  push(`Closing Balance: ${fmt(closingBalance)}`, 40, y, 'bold')

  pages.push([...lines])
  return pages
}

const orderLineAmount = l => Number(l.lineTotal ?? (((l.salesQty ?? l.qty ?? 0) * (l.unitPrice ?? 0)) * (1 - ((l.discount ?? 0) / 100))))

export function printOrder(order) {
  const lines = order.lines || []
  const rows = lines.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${esc(l.productName)}</strong><br><span style="color:#6A6760;font-size:10px">${esc(l.size)} | ${esc(l.handle)}</span></td>
      <td class="mono">${esc(l.stereoRef || '-')}</td>
      <td>${esc(l.spec || '-')}</td>
      <td class="r">${fmtN(l.orderedQty ?? l.qty)}</td>
      <td class="r">${fmtN(l.salesQty ?? l.qty)}</td>
      <td class="r">${pct(l.discount)}</td>
      <td class="r mono">${fmt(l.unitPrice)}</td>
      <td class="r"><strong>${fmt(orderLineAmount(l))}</strong></td>
    </tr>
  `).join('')

  const orderedQty = lines.reduce((s, l) => s + Number(l.orderedQty ?? l.qty ?? 0), 0)
  const salesQty = lines.reduce((s, l) => s + Number(l.salesQty ?? l.qty ?? 0), 0)
  const subtotal = lines.reduce((s, l) => s + orderLineAmount(l), 0)

  open(`
    ${companyHeader('Sales Order')}
    <div class="info-row">
      <div class="info-box">
        <h3>Client</h3>
        <div class="info-line"><span class="il">Name</span><span class="iv">${esc(order.clientName)}</span></div>
        <div class="info-line"><span class="il">Salesperson</span><span class="iv">${esc(order.salesperson || '-')}</span></div>
        <div class="info-line"><span class="il">GST rate</span><span class="iv">${esc(order.clientGstPercent)}%</span></div>
        <div class="info-line"><span class="il">Notes</span><span class="iv">${esc(order.notes || '-')}</span></div>
      </div>
      <div class="info-box">
        <h3>Order details</h3>
        <div class="info-line"><span class="il">Order no.</span><span class="iv mono">${esc(order.orderNo)}</span></div>
        <div class="info-line"><span class="il">Order date</span><span class="iv">${fmtDate(order.orderDate)}</span></div>
        <div class="info-line"><span class="il">Delivery date</span><span class="iv">${fmtDate(order.deliveryDate)}</span></div>
        <div class="info-line"><span class="il">Ordered qty</span><span class="iv">${fmtN(orderedQty)}</span></div>
        <div class="info-line"><span class="il">Sales qty</span><span class="iv">${fmtN(salesQty)}</span></div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>Stereo ref</th><th>Spec / notes</th><th class="r">Ordered</th><th class="r">Sales</th><th class="r">Discount</th><th class="r">Rate</th><th class="r">Line total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals-wrap"><div class="totals-box">
      <div class="t-row mut"><span>Subtotal (excl. GST)</span><span>${fmt(subtotal)}</span></div>
      <div class="t-row mut"><span>GST</span><span>Computed at invoice</span></div>
      <div class="t-row big"><span>Order value</span><span>${fmt(subtotal)}</span></div>
    </div></div>
    <div class="doc-footer">
      <div class="foot-note">Generated from OrderFlow.<br>Sales qty will be used for invoice creation.</div>
      <div class="sign-area">
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">Prepared by</div></div>
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">Authorised signatory</div></div>
      </div>
    </div>
  `)
}

const STAGE_KEYS = ['STEREO_AVAILABLE', 'MATERIAL', 'CUTTING', 'STITCHING', 'HANDLE', 'QC_CHECK_PACKING', 'DELIVERY']
const STAGE_LABELS = { STEREO_AVAILABLE: 'Stereo', MATERIAL: 'Material', CUTTING: 'Cutting', STITCHING: 'Stitching', HANDLE: 'Handle', QC_CHECK_PACKING: 'QC & Pack', DELIVERY: 'Delivery' }

export function printJobCard(jc) {
  const doneSet = new Set(jc.doneStages || [])
  const pipeline = STAGE_KEYS.map(s => `<span style="display:inline-block;padding:4px 8px;margin:0 6px 6px 0;border-radius:16px;background:${doneSet.has(s) ? '#DCFCE7' : '#F3F4F6'};color:${doneSet.has(s) ? '#166534' : '#6B7280'};font-size:10px;font-weight:600">${STAGE_LABELS[s]}</span>`).join('')
  const rows = (jc.activities || []).map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(a.activityTime ? a.activityTime.slice(0, 16).replace('T', ' ') : '-')}</td>
      <td>${esc((a.activityType || '').replaceAll('_', ' '))}</td>
      <td>${esc(a.description || '')}</td>
      <td>${esc(a.performedBy || '-')}</td>
      <td>${esc(a.notes || '-')}</td>
    </tr>
  `).join('')

  open(`
    ${companyHeader('Job Card')}
    <div class="info-row">
      <div class="info-box">
        <h3>Product</h3>
        <div class="info-line"><span class="il">Job card</span><span class="iv mono">${esc(jc.jobCardNo)}</span></div>
        <div class="info-line"><span class="il">Product</span><span class="iv">${esc(jc.productName)}</span></div>
        <div class="info-line"><span class="il">Size</span><span class="iv">${esc(jc.size || '-')}</span></div>
        <div class="info-line"><span class="il">Handle</span><span class="iv">${esc(jc.handle || '-')}</span></div>
        <div class="info-line"><span class="il">Wt (g)</span><span class="iv">${fmtN(jc.weightGrams || 0)}</span></div>
        <div class="info-line"><span class="il">Qty</span><span class="iv">${fmtN(jc.qty)}</span></div>
        <div class="info-line"><span class="il">Material req.</span><span class="iv">${Number(jc.materialRequiredKg || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 })} kg</span></div>
      </div>
      <div class="info-box">
        <h3>Order</h3>
        <div class="info-line"><span class="il">Order no.</span><span class="iv mono">${esc(jc.orderNo)}</span></div>
        <div class="info-line"><span class="il">Client</span><span class="iv">${esc(jc.clientName)}</span></div>
        <div class="info-line"><span class="il">Start date</span><span class="iv">${esc(jc.startDate || '-')}</span></div>
        <div class="info-line"><span class="il">Due date</span><span class="iv">${esc(jc.dueDate || '-')}</span></div>
        <div class="info-line"><span class="il">Instructions</span><span class="iv">${esc(jc.instructions || '-')}</span></div>
      </div>
    </div>
    <div style="margin-bottom:12px">${pipeline}</div>
    <table>
      <thead><tr><th>#</th><th>Date / time</th><th>Stage</th><th>Description</th><th>Performed by</th><th>Notes</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="6" class="c">No activities logged yet</td></tr>'}</tbody>
    </table>
    <div class="doc-footer">
      <div class="foot-note">Production tracking document.</div>
      <div class="sign-area">
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">Supervisor</div></div>
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">QC sign-off</div></div>
      </div>
    </div>
  `)
}

export function printInvoice(inv) {
  const lines = inv.lines || []
  const invoiceDiscountPct = discountPctOnInvoiceAmount(inv)
  const isInterState = inv.taxMode === 'INTER_STATE'
  const rows = lines.map((l, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${esc(l.productName)}</strong><br><span style="color:#6A6760;font-size:10px">HSN: ${esc(l.hsnCode || '-')} | ${esc(l.size)} | ${esc(l.handle)}</span></td>
      <td class="r">${fmtN(l.salesQty ?? l.qty)}</td>
      <td class="r mono">${fmt(l.unitPrice)}</td>
      <td class="r">${printDiscount(l.discount)}</td>
      <td class="c">${isInterState ? `${l.taxPercent}% IGST` : `${splitGstPercent(l.taxPercent)}% + ${splitGstPercent(l.taxPercent)}%`}</td>
      <td class="r">${fmt(l.taxAmount)}</td>
      <td class="r"><strong>${fmt(l.lineTotal)}</strong></td>
    </tr>
  `).join('')

  open(`
    ${companyHeader('Sales Invoice')}
    <div class="info-row">
      <div class="info-box">
        <h3>Bill to</h3>
        <div class="info-line"><span class="il">Client</span><span class="iv">${esc(inv.clientName)}</span></div>
        <div class="info-line"><span class="il">GSTIN</span><span class="iv mono">${esc(inv.clientGstNo || '-')}</span></div>
        <div class="info-line"><span class="il">Address</span><span class="iv">${esc(inv.clientAddress || inv.clientBillingAddress || '-')}</span></div>
      </div>
      <div class="info-box">
        <h3>Invoice details</h3>
        <div class="info-line"><span class="il">Invoice no.</span><span class="iv mono">${esc(inv.invoiceNo)}</span></div>
        <div class="info-line"><span class="il">Order ref</span><span class="iv mono">${esc(inv.orderNo || '-')}</span></div>
        <div class="info-line"><span class="il">Invoice date</span><span class="iv">${fmtDate(inv.invoiceDate)}</span></div>
        <div class="info-line"><span class="il">Due date</span><span class="iv">${fmtDate(inv.dueDate)}</span></div>
        <div class="info-line"><span class="il">Place of supply</span><span class="iv">${esc(inv.placeOfSupply || '-')}</span></div>
        <div class="info-line"><span class="il">GST rate</span><span class="iv">${isInterState ? `IGST ${esc(inv.igstPercent)}%` : `CGST ${splitGstPercent(inv.gstPercent)}% + SGST ${splitGstPercent(inv.gstPercent)}%`}</span></div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th class="r">Sales</th><th class="r">Rate</th><th class="r">Discount</th><th class="c">GST%</th><th class="r">Tax amt</th><th class="r">Line total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals-wrap"><div class="totals-box">
      <div class="t-row mut"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
      ${isInterState
        ? `<div class="t-row mut"><span>IGST ${esc(inv.igstPercent)}%</span><span>${fmt(inv.igstAmount)}</span></div>`
        : `<div class="t-row mut"><span>CGST ${splitGstPercent(inv.gstPercent)}%</span><span>${fmt(inv.cgstAmount)}</span></div>
      <div class="t-row mut"><span>SGST ${splitGstPercent(inv.gstPercent)}%</span><span>${fmt(inv.sgstAmount)}</span></div>`}
      <div class="t-row mut"><span>Invoice discount (${invoiceDiscountPct})</span><span>${fmt(inv.invoiceDiscount || 0)}</span></div>
      <div class="t-row big"><span>Invoice total</span><span>${fmt(inv.total)}</span></div>
      <div class="t-row mut"><span>Paid</span><span>${fmt(inv.paidAmount)}</span></div>
      <div class="t-row"><span>Balance due</span><span><strong>${fmt(inv.balanceDue)}</strong></span></div>
    </div></div>
    <div class="doc-footer">
      <div class="foot-note">This is a computer-generated sales invoice.</div>
      <div class="sign-area">
        <div class="sign-box"><div class="sign-line"></div><div class="sign-lbl">For ${COMPANY.name}</div></div>
      </div>
    </div>
  `)
}

export function printDeliveryChallan(inv) {
  const lines = inv.lines || []
  const subtotal = Number(inv.subtotal || 0)
  const taxTotal = Number(inv.taxTotal || 0)
  const invoiceDiscount = Number(inv.invoiceDiscount || 0)
  const grandTotal = Number(inv.total || 0)
  const isInterState = inv.taxMode === 'INTER_STATE'
  const rows = lines.map((l, i) => `
    <tr>
      <td class="c">${i + 1}</td>
      <td>${esc(l.productName)}<br><span style="font-size:10px;color:#4B5563">HSN: ${esc(l.hsnCode || '-')} | ${esc(l.size)} | ${esc(l.handle)}</span></td>
      <td class="r">${fmtN(l.salesQty ?? l.qty)}</td>
      <td class="r mono">${fmt(l.unitPrice)}</td>
      <td class="r">${fmt((Number(l.salesQty ?? l.qty ?? 0) * Number(l.unitPrice ?? 0)))}</td>
    </tr>
  `).join('')

  const totalQty = lines.reduce((s, l) => s + Number(l.salesQty ?? l.qty ?? 0), 0)

  open(`
    <div class="challan-shell">
      <div class="challan-head">
        <div class="brand" style="text-align:center">${COMPANY.name}</div>
        <div class="brand-sub" style="text-align:center;color:#2F3B52;font-weight:600">${COMPANY.subtitle}</div>
        <div class="brand-meta" style="text-align:center;max-width:none">${COMPANY.address}<br>${COMPANY.contact}</div>
      </div>
      <div class="challan-grid">
        <div class="challan-box">
          <div style="font-weight:700;margin-bottom:6px">M/s.</div>
          <div style="font-size:14px;font-weight:600;margin-bottom:6px">${esc(inv.clientName)}</div>
          <div style="font-size:11px;color:#3B372B">GSTIN: ${esc(inv.clientGstNo || '-')}</div>
          <div style="font-size:11px;color:#3B372B;margin-top:4px">Place of Supply: ${esc(inv.placeOfSupply || '-')}</div>
          <div style="font-size:11px;color:#3B372B;margin-top:8px;line-height:1.5">${esc(inv.clientAddress || inv.clientShippingAddress || inv.clientBillingAddress || '-')}</div>
          <div style="font-size:11px;color:#3B372B;margin-top:8px">Order Ref: ${esc(inv.orderNo || '-')}</div>
        </div>
        <div class="challan-box">
          <div class="challan-title">Challan</div>
          <div style="margin-top:14px;font-size:12px;line-height:1.8">
            <div><strong>No.</strong> <span class="mono">${esc(inv.invoiceNo)}</span></div>
            <div><strong>Date</strong> ${fmtDate(inv.invoiceDate)}</div>
          </div>
        </div>
      </div>
      <table class="challan-table">
        <thead><tr><th style="width:50px">No.</th><th>Particulars</th><th style="width:110px">Qty.</th><th style="width:120px">Rate</th><th style="width:130px">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-top:10px">
        <div class="challan-total" style="margin-top:0">Total Qty: ${fmtN(totalQty)}</div>
        <div style="min-width:280px;font-size:12px">
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Subtotal</span><strong>${fmt(subtotal)}</strong></div>
          ${isInterState
            ? `<div style="display:flex;justify-content:space-between;padding:3px 0"><span>IGST ${esc(inv.igstPercent)}%</span><strong>${fmt(inv.igstAmount)}</strong></div>`
            : `<div style="display:flex;justify-content:space-between;padding:3px 0"><span>CGST ${splitGstPercent(inv.gstPercent)}%</span><strong>${fmt(inv.cgstAmount)}</strong></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span>SGST ${splitGstPercent(inv.gstPercent)}%</span><strong>${fmt(inv.sgstAmount)}</strong></div>`}
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Invoice discount</span><strong>${fmt(invoiceDiscount)}</strong></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0 0;margin-top:4px;border-top:2px solid #857748;font-size:15px"><span><strong>Total</strong></span><strong>${fmt(grandTotal)}</strong></div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px">
        <div style="font-size:12px;font-weight:700">GST No. ${COMPANY.gst}</div>
        <div style="text-align:right">
          <div style="font-size:12px;font-weight:700;margin-bottom:26px">For ${COMPANY.name}</div>
          <div style="border-top:1px solid #5F5A52;padding-top:4px;font-size:11px">Authorised Signatory</div>
        </div>
      </div>
    </div>
  `)
}

export function printPayments(payments) {
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const rows = payments.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="mono">${esc(p.paymentRef)}</td>
      <td>${esc(p.clientName)}</td>
      <td>${esc(p.paymentDate || '-')}</td>
      <td>${esc(p.mode || '-')}</td>
      <td class="r">${fmt(p.amount)}</td>
      <td class="mono">${esc((p.allocations || []).map(a => a.invoiceNo).join(', ') || 'Unallocated')}</td>
      <td class="mono">${esc(p.bankRef || '-')}</td>
      <td>${esc(p.status || '-')}</td>
    </tr>
  `).join('')

  open(`
    ${companyHeader('Payment Statement')}
    <table>
      <thead><tr><th>#</th><th>Payment ref</th><th>Client</th><th>Date</th><th>Mode</th><th class="r">Amount</th><th>Allocated to</th><th>Bank ref</th><th>Status</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="9" class="c">No payments</td></tr>'}</tbody>
    </table>
    <div class="totals-wrap"><div class="totals-box">
      <div class="t-row mut"><span>No. of payments</span><span>${payments.length}</span></div>
      <div class="t-row big"><span>Total received</span><span>${fmt(total)}</span></div>
    </div></div>
  `)
}

export function printReports(data) {
  const { clients = [], orders = [], invoices = [], payments = [] } = data
  const totalCY = clients.reduce((s, c) => s + (c.cyOutstanding || 0), 0)
  const totalPY = clients.reduce((s, c) => s + (c.pyOutstanding || 0), 0)
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalInvoiceVal = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const invoiceAmountByOrderId = invoices.reduce((acc, inv) => {
    if (inv.orderId == null) return acc
    acc[inv.orderId] = (acc[inv.orderId] || 0) + (inv.total || 0)
    return acc
  }, {})
  const orderRows = orders.map((o, i) => `<tr><td>${i + 1}</td><td class="mono">${esc(o.orderNo)}</td><td>${esc(o.clientName)}</td><td>${esc(o.orderDate || '-')}</td><td>${esc(o.status)}</td><td class="r">${fmt(invoiceAmountByOrderId[o.id] || 0)}</td></tr>`).join('')

  open(`
    ${companyHeader('Business Report')}
    <div class="info-row">
      <div class="info-box">
        <h3>Summary</h3>
        <div class="info-line"><span class="il">Total invoice value</span><span class="iv">${fmt(totalInvoiceVal)}</span></div>
        <div class="info-line"><span class="il">Payments received</span><span class="iv">${fmt(totalPaid)}</span></div>
        <div class="info-line"><span class="il">PY outstanding</span><span class="iv">${fmt(totalPY)}</span></div>
        <div class="info-line"><span class="il">CY outstanding</span><span class="iv">${fmt(totalCY)}</span></div>
      </div>
      <div class="info-box">
        <h3>Counts</h3>
        <div class="info-line"><span class="il">Clients</span><span class="iv">${clients.length}</span></div>
        <div class="info-line"><span class="il">Orders</span><span class="iv">${orders.length}</span></div>
        <div class="info-line"><span class="il">Invoices</span><span class="iv">${invoices.length}</span></div>
        <div class="info-line"><span class="il">Payments</span><span class="iv">${payments.length}</span></div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Order</th><th>Client</th><th>Date</th><th>Status</th><th class="r">Invoice amount</th></tr></thead>
      <tbody>${orderRows || '<tr><td colspan="6" class="c">No orders</td></tr>'}</tbody>
    </table>
  `)
}

export function printClients(clients) {
  const rows = clients.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="mono">${esc(c.code)}</td>
      <td>${esc(c.name)}</td>
      <td>${esc(c.salesperson || '-')}</td>
      <td class="mono">${esc(c.gstNo || '-')}</td>
      <td>${esc(c.phone || '-')}</td>
      <td class="r">${fmt(c.creditLimit)}</td>
      <td class="r">${fmt((c.pyOutstanding || 0) + (c.cyOutstanding || 0))}</td>
    </tr>
  `).join('')

  open(`
    ${companyHeader('Client Directory')}
    <table>
      <thead><tr><th>#</th><th>Code</th><th>Name</th><th>Salesperson</th><th>GST no.</th><th>Phone</th><th class="r">Credit limit</th><th class="r">Outstanding</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="8" class="c">No clients</td></tr>'}</tbody>
    </table>
  `)
}

export function printClientDetail(client, clientProducts) {
  const rows = (clientProducts || []).map((cp, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="mono">${esc(cp.productSku || '-')}</td>
      <td>${esc(cp.productName || '-')}</td>
      <td>${esc(cp.size || '-')}</td>
      <td>${esc(cp.handle || '-')}</td>
      <td class="r">${fmt(cp.agreedPrice)}</td>
      <td class="mono">${esc(cp.stereoRef || '-')}</td>
    </tr>
  `).join('')

  open(`
    ${companyHeader('Client Profile')}
    <div class="info-row">
      <div class="info-box">
        <h3>Client information</h3>
        <div class="info-line"><span class="il">Name</span><span class="iv">${esc(client.name)}</span></div>
        <div class="info-line"><span class="il">Code</span><span class="iv mono">${esc(client.code || '-')}</span></div>
        <div class="info-line"><span class="il">GST no.</span><span class="iv mono">${esc(client.gstNo || '-')}</span></div>
        <div class="info-line"><span class="il">Phone</span><span class="iv">${esc(client.phone || '-')}</span></div>
      </div>
      <div class="info-box">
        <h3>Outstanding</h3>
        <div class="info-line"><span class="il">PY outstanding</span><span class="iv">${fmt(client.pyOutstanding)}</span></div>
        <div class="info-line"><span class="il">CY outstanding</span><span class="iv">${fmt(client.cyOutstanding)}</span></div>
        <div class="info-line"><span class="il">Credit limit</span><span class="iv">${fmt(client.creditLimit)}</span></div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>SKU</th><th>Product</th><th>Size</th><th>Handle</th><th class="r">Agreed price</th><th>Stereo ref</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" class="c">No products mapped</td></tr>'}</tbody>
    </table>
  `)
}

export function printClientLedger(client, ledger, totalDebits, totalCredits, closingBalance) {
  const rows = (ledger || []).map((row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(row.date || '-')}</td>
      <td class="mono">${esc(row.ref || '-')}</td>
      <td>${esc(row.desc || '-')}</td>
      <td class="r">${row.debit ? fmt(row.debit) : '-'}</td>
      <td class="r">${row.credit ? fmt(row.credit) : '-'}</td>
      <td class="r">${fmt(row.balance)}</td>
    </tr>
  `).join('')

  open(`
    ${companyHeader('Client Ledger')}
    <div class="info-row">
      <div class="info-box">
        <h3>Client</h3>
        <div class="info-line"><span class="il">Name</span><span class="iv">${esc(client.name)}</span></div>
        <div class="info-line"><span class="il">Code</span><span class="iv mono">${esc(client.code || '-')}</span></div>
        <div class="info-line"><span class="il">GST no.</span><span class="iv mono">${esc(client.gstNo || '-')}</span></div>
      </div>
      <div class="info-box">
        <h3>Account summary</h3>
        <div class="info-line"><span class="il">Total debits</span><span class="iv">${fmt(totalDebits)}</span></div>
        <div class="info-line"><span class="il">Total credits</span><span class="iv">${fmt(totalCredits)}</span></div>
        <div class="info-line"><span class="il">Closing balance</span><span class="iv">${fmt(closingBalance)}</span></div>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Date</th><th>Reference</th><th>Description</th><th class="r">Debit</th><th class="r">Credit</th><th class="r">Balance</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" class="c">No ledger rows</td></tr>'}</tbody>
    </table>
  `)
}

export function downloadClientLedgerPdf(client, ledger, totalDebits, totalCredits, closingBalance) {
  const pages = ledgerPdfPages(client, ledger, totalDebits, totalCredits, closingBalance)
  const pdfBlob = buildSimplePdf(pages)
  downloadFile(pdfBlob, `${slug(client.name)}-ledger.pdf`)
}

export function shareClientLedgerOnWhatsApp(client, ledger, totalDebits, totalCredits, closingBalance) {
  const invoiceCount = (ledger || []).filter(row => row.type === 'invoice').length
  const paymentCount = (ledger || []).filter(row => row.type === 'payment').length
  const text = [
    `Client Ledger Summary`,
    `Client: ${client.name}`,
    `Code: ${client.code || '-'}`,
    `Total Invoices: ${invoiceCount}`,
    `Total Payments: ${paymentCount}`,
    `Total Debits: ${fmt(totalDebits)}`,
    `Total Credits: ${fmt(totalCredits)}`,
    `Closing Balance: ${fmt(closingBalance)}`,
  ].join('\n')
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
}
