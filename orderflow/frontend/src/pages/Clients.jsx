import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getClients, getClient, createClient, updateClient,
  getClientProducts, addClientProduct, updateClientProduct, deleteClientProduct,
  getProducts,
} from '../api/client'
import { Badge, GstBadge, Modal, DetailRow, fmt, today, Spinner, RowActions, EditCell, PrintIcon } from '../components/UI'
import { printClients, printClientDetail } from '../components/PrintTemplates'

// ── Clients List ──────────────────────────────────────────
export function ClientsList() {
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [editRow, setEditRow]   = useState(null)
  const [showNew, setShowNew]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const nav = useNavigate()

  useEffect(() => { getClients().then(setClients).finally(() => setLoading(false)) }, [])

  const blank = () => ({
    code:'', name:'', areaCode:'', gstNo:'', phone:'', email:'', salesperson:'',
    billingAddress:'', shippingAddress:'', creditLimit:'', paymentTerms:'Net 30',
    gstPercent:18, pyOutstanding:0, cyOutstanding:0, status:'ACTIVE',
  })

  const startEdit = c  => setEditRow({ ...c })
  const cancelEdit = () => { setEditRow(null); setShowNew(false) }
  const set = (k, v)   => setEditRow(r => ({ ...r, [k]: v }))

  const saveRow = async () => {
    if (!editRow.code || !editRow.name) { toast.error('Code and name required'); return }
    setSaving(true)
    try {
      const payload = {
        ...editRow,
        creditLimit:    parseFloat(editRow.creditLimit)    || 0,
        gstPercent:     parseInt(editRow.gstPercent)       || 18,
        pyOutstanding:  parseFloat(editRow.pyOutstanding)  || 0,
        cyOutstanding:  parseFloat(editRow.cyOutstanding)  || 0,
      }
      const saved = editRow.id
        ? await updateClient(editRow.id, payload)
        : await createClient(payload)
      setClients(prev => prev.find(c => c.id === saved.id)
        ? prev.map(c => c.id === saved.id ? saved : c)
        : [...prev, saved])
      setEditRow(null); setShowNew(false)
      toast.success('Client saved')
    } finally { setSaving(false) }
  }

  const GST_OPTS    = [{value:0,label:'0% exempt'},{value:5,label:'5%'},{value:18,label:'18%'}]
  const STATUS_OPTS = [{value:'ACTIVE',label:'Active'},{value:'ON_HOLD',label:'On hold'},{value:'INACTIVE',label:'Inactive'}]
  const TERMS_OPTS  = ['Net 15','Net 30','Net 45','Advance'].map(v => ({value:v,label:v}))

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Clients</h1>
        <div className="page-actions">
          <button className="btn" onClick={() => printClients(clients)}>
            <PrintIcon /> Print
          </button>
          <button className="btn btn-primary" onClick={() => { setShowNew(true); setEditRow(blank()) }}>
            + New client
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th><th>Name</th><th>Area code</th><th>Salesperson</th><th>Phone</th>
                <th>GST rate</th><th>Terms</th><th>Credit limit</th>
                <th>PY o/s</th><th>CY o/s</th><th style={{textAlign:'right'}}>Total</th>
                <th>Status</th><th style={{width:90}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* new row */}
              {showNew && (
                <tr className="row-edit-active">
                  <td><input className="cell-input" style={{width:60}} value={editRow?.code||''} onChange={e=>set('code',e.target.value)} placeholder="C004" /></td>
                  <td><input className="cell-input" style={{minWidth:130}} value={editRow?.name||''} onChange={e=>set('name',e.target.value)} placeholder="Name *" /></td>
                  <td><input className="cell-input" style={{width:80}} value={editRow?.areaCode||''} onChange={e=>set('areaCode',e.target.value)} placeholder="e.g. BLR" /></td>
                  <td><input className="cell-input" style={{width:90}} value={editRow?.salesperson||''} onChange={e=>set('salesperson',e.target.value)} /></td>
                  <td><input className="cell-input" style={{width:100}} value={editRow?.phone||''} onChange={e=>set('phone',e.target.value)} /></td>
                  <td>
                    <select className="cell-select" value={editRow?.gstPercent??18} onChange={e=>set('gstPercent',parseInt(e.target.value))}>
                      {GST_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="cell-select" value={editRow?.paymentTerms||'Net 30'} onChange={e=>set('paymentTerms',e.target.value)}>
                      {TERMS_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td><input className="cell-input" type="number" style={{width:90}} value={editRow?.creditLimit||''} onChange={e=>set('creditLimit',e.target.value)} /></td>
                  <td><input className="cell-input" type="number" style={{width:80}} value={editRow?.pyOutstanding||0} onChange={e=>set('pyOutstanding',e.target.value)} /></td>
                  <td><input className="cell-input" type="number" style={{width:80}} value={editRow?.cyOutstanding||0} onChange={e=>set('cyOutstanding',e.target.value)} /></td>
                  <td>—</td>
                  <td>
                    <select className="cell-select" value={editRow?.status||'ACTIVE'} onChange={e=>set('status',e.target.value)}>
                      {STATUS_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td><RowActions editing saving={saving} onSave={saveRow} onCancel={cancelEdit} /></td>
                </tr>
              )}

              {clients.map(c => {
                const isEditing = editRow?.id === c.id
                const total = (c.pyOutstanding||0) + (c.cyOutstanding||0)
                return (
                  <tr key={c.id}
                    className={isEditing ? 'row-edit-active' : 'clickable'}
                    onClick={() => !isEditing && nav(`/clients/${c.id}`)}
                  >
                    <td className="mono">
                      <EditCell editing={isEditing} value={editRow?.code} onChange={v=>set('code',v)}>{c.code}</EditCell>
                    </td>
                    <td style={{fontWeight: isEditing ? 400 : 600}}>
                      <EditCell editing={isEditing} value={editRow?.name} onChange={v=>set('name',v)}>{c.name}</EditCell>
                    </td>
                    <td>
                      <EditCell editing={isEditing} value={editRow?.areaCode} onChange={v=>set('areaCode',v)}>
                        {c.areaCode ? <span className="tag">{c.areaCode}</span> : <span className="text-muted">—</span>}
                      </EditCell>
                    </td>
                    <td>
                      <EditCell editing={isEditing} value={editRow?.salesperson} onChange={v=>set('salesperson',v)}>{c.salesperson}</EditCell>
                    </td>
                    <td className="text-muted">
                      <EditCell editing={isEditing} value={editRow?.phone} onChange={v=>set('phone',v)}>{c.phone}</EditCell>
                    </td>
                    <td>
                      {isEditing
                        ? <select className="cell-select" value={editRow?.gstPercent??18} onChange={e=>set('gstPercent',parseInt(e.target.value))}>
                            {GST_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        : <GstBadge pct={c.gstPercent} />}
                    </td>
                    <td className="text-muted">
                      {isEditing
                        ? <select className="cell-select" value={editRow?.paymentTerms} onChange={e=>set('paymentTerms',e.target.value)}>
                            {TERMS_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        : c.paymentTerms}
                    </td>
                    <td>
                      <EditCell editing={isEditing} value={editRow?.creditLimit} onChange={v=>set('creditLimit',v)} type="number" width="90px">
                        <span className="mono">{fmt(c.creditLimit)}</span>
                      </EditCell>
                    </td>
                    <td>
                      <EditCell editing={isEditing} value={editRow?.pyOutstanding} onChange={v=>set('pyOutstanding',v)} type="number" width="80px">
                        {fmt(c.pyOutstanding)}
                      </EditCell>
                    </td>
                    <td style={{color:'var(--amber)'}}>
                      <EditCell editing={isEditing} value={editRow?.cyOutstanding} onChange={v=>set('cyOutstanding',v)} type="number" width="80px">
                        {fmt(c.cyOutstanding)}
                      </EditCell>
                    </td>
                    <td style={{fontWeight:600, textAlign:'right'}}>{isEditing ? '—' : fmt(total)}</td>
                    <td>
                      {isEditing
                        ? <select className="cell-select" value={editRow?.status} onChange={e=>set('status',e.target.value)}>
                            {STATUS_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        : <Badge status={c.status} />}
                    </td>
                    <td onClick={e=>e.stopPropagation()}>
                      <RowActions editing={isEditing} saving={saving}
                        onEdit={()=>startEdit(c)} onSave={saveRow} onCancel={cancelEdit} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Client Detail ─────────────────────────────────────────
export function ClientDetail() {
  const { id } = useParams()
  const nav    = useNavigate()
  const [client,    setClient]    = useState(null)
  const [cps,       setCps]       = useState([])
  const [products,  setProducts]  = useState([])
  const [editCp,    setEditCp]    = useState(null)
  const [showNewCp, setShowNewCp] = useState(false)
  const [editClient,setEditClient]= useState(false)
  const [clientForm,setClientForm]= useState({})
  const [saving,    setSaving]    = useState(false)

  const load = async () => {
    const [c, cpList, pList] = await Promise.all([getClient(id), getClientProducts(id), getProducts()])
    setClient(c); setCps(cpList); setProducts(pList); setClientForm({ ...c })
  }
  useEffect(() => { load() }, [id])

  const saveClient = async () => {
    setSaving(true)
    try {
      const updated = await updateClient(id, {
        ...clientForm,
        creditLimit:   parseFloat(clientForm.creditLimit)   || 0,
        gstPercent:    parseInt(clientForm.gstPercent)      || 18,
        pyOutstanding: parseFloat(clientForm.pyOutstanding) || 0,
        cyOutstanding: parseFloat(clientForm.cyOutstanding) || 0,
      })
      setClient(updated); setClientForm({ ...updated }); setEditClient(false)
      toast.success('Client updated')
    } finally { setSaving(false) }
  }
  const setCF = (k, v) => setClientForm(f => ({ ...f, [k]: v }))

  const blankCp    = () => ({ productId: products[0]?.id || '', agreedPrice:'', stereoRef:'', specialSpec:'', notes:'' })
  const startEditCp = cp => setEditCp({ ...cp })
  const cancelCp   = () => { setEditCp(null); setShowNewCp(false) }
  const setCpField  = (k, v) => setEditCp(r => ({ ...r, [k]: v }))

  const saveCpRow = async () => {
    if (!editCp.agreedPrice) { toast.error('Agreed price required'); return }
    setSaving(true)
    try {
      if (editCp.id) {
        await updateClientProduct(id, editCp.id, {
          agreedPrice: parseFloat(editCp.agreedPrice),
          stereoRef:   editCp.stereoRef,
          specialSpec: editCp.specialSpec,
          notes:       editCp.notes,
        })
      } else {
        await addClientProduct(id, {
          productId:   parseInt(editCp.productId),
          agreedPrice: parseFloat(editCp.agreedPrice),
          stereoRef:   editCp.stereoRef,
          specialSpec: editCp.specialSpec,
          notes:       editCp.notes,
        })
      }
      await load(); setEditCp(null); setShowNewCp(false)
      toast.success('Product saved')
    } finally { setSaving(false) }
  }

  const removeCp = async cpId => {
    if (!window.confirm('Remove this product from client?')) return
    await deleteClientProduct(id, cpId)
    setCps(prev => prev.filter(c => c.id !== cpId))
    toast.success('Removed')
  }

  const onCpProductChange = pid => {
    const p = products.find(x => String(x.id) === String(pid))
    setCpField('productId', pid)
    if (p && !editCp?.id) setCpField('agreedPrice', p.basePrice)
  }

  if (!client) return <Spinner />

  const GST_OPTS    = [{value:0,label:'0% exempt'},{value:5,label:'5%'},{value:18,label:'18%'}]
  const TERMS_OPTS  = ['Net 15','Net 30','Net 45','Advance'].map(v=>({value:v,label:v}))
  const STATUS_OPTS = [{value:'ACTIVE',label:'Active'},{value:'ON_HOLD',label:'On hold'},{value:'INACTIVE',label:'Inactive'}]

  return (
    <div className="page">
      <div className="breadcrumb">
        <a onClick={() => nav('/clients')}>Clients</a><span>/</span><span>{client.name}</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">{client.name}</h1>
        <div className="page-actions">
          {client.areaCode && <span className="tag">{client.areaCode}</span>}
          <Badge status={client.status} />
          <button className="btn" onClick={() => printClientDetail(client, cps)}>
            <PrintIcon /> Print
          </button>
          {!editClient
            ? <button className="btn" onClick={() => setEditClient(true)}>Edit client</button>
            : <>
                <button className="btn btn-primary" onClick={saveClient} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button className="btn" onClick={() => { setEditClient(false); setClientForm({ ...client }) }}>Cancel</button>
              </>
          }
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Client info</div>

          <DetailRow label="Code" value={
            editClient
              ? <input className="cell-input" style={{width:90}} value={clientForm.code||''} onChange={e=>setCF('code',e.target.value)} />
              : <span className="mono">{client.code}</span>
          } />
          <DetailRow label="Area code" value={
            editClient
              ? <input className="cell-input" style={{width:100}} value={clientForm.areaCode||''} onChange={e=>setCF('areaCode',e.target.value)} placeholder="e.g. BLR, CHN" />
              : client.areaCode
                ? <span className="tag">{client.areaCode}</span>
                : <span className="text-muted">—</span>
          } />
          <DetailRow label="GST no." value={
            editClient
              ? <input className="cell-input" style={{width:160}} value={clientForm.gstNo||''} onChange={e=>setCF('gstNo',e.target.value)} />
              : <span className="mono">{client.gstNo||'—'}</span>
          } />
          <DetailRow label="Phone" value={
            editClient
              ? <input className="cell-input" style={{width:130}} value={clientForm.phone||''} onChange={e=>setCF('phone',e.target.value)} />
              : client.phone
          } />
          <DetailRow label="Email" value={
            editClient
              ? <input className="cell-input" style={{width:190}} value={clientForm.email||''} onChange={e=>setCF('email',e.target.value)} />
              : client.email
          } />
          <DetailRow label="Salesperson" value={
            editClient
              ? <input className="cell-input" style={{width:130}} value={clientForm.salesperson||''} onChange={e=>setCF('salesperson',e.target.value)} />
              : client.salesperson
          } />
          <DetailRow label="Payment terms" value={
            editClient
              ? <select className="cell-select" style={{width:110}} value={clientForm.paymentTerms} onChange={e=>setCF('paymentTerms',e.target.value)}>
                  {TERMS_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              : client.paymentTerms
          } />
          <DetailRow label="GST rate" value={
            editClient
              ? <select className="cell-select" style={{width:110}} value={clientForm.gstPercent??18} onChange={e=>setCF('gstPercent',parseInt(e.target.value))}>
                  {GST_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              : <GstBadge pct={client.gstPercent} />
          } />
          <DetailRow label="Credit limit" value={
            editClient
              ? <input className="cell-input" type="number" style={{width:120}} value={clientForm.creditLimit||''} onChange={e=>setCF('creditLimit',e.target.value)} />
              : <span className="fw-600">{fmt(client.creditLimit)}</span>
          } />
          <DetailRow label="Status" value={
            editClient
              ? <select className="cell-select" style={{width:100}} value={clientForm.status} onChange={e=>setCF('status',e.target.value)}>
                  {STATUS_OPTS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              : <Badge status={client.status} />
          } />
          <DetailRow label="Billing address" value={
            editClient
              ? <input className="cell-input" style={{width:210}} value={clientForm.billingAddress||''} onChange={e=>setCF('billingAddress',e.target.value)} />
              : <span className="text-muted">{client.billingAddress||'—'}</span>
          } />
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>Outstanding balance</div>
          <div className="amount-summary">
            <div className="amount-row">
              <span>PY outstanding</span>
              <span>{editClient
                ? <input className="cell-input" type="number" style={{width:120}} value={clientForm.pyOutstanding||0} onChange={e=>setCF('pyOutstanding',e.target.value)} />
                : fmt(client.pyOutstanding)}</span>
            </div>
            <div className="amount-row muted">
              <span>CY outstanding</span>
              <span>{editClient
                ? <input className="cell-input" type="number" style={{width:120}} value={clientForm.cyOutstanding||0} onChange={e=>setCF('cyOutstanding',e.target.value)} />
                : <span style={{color:'var(--amber)'}}>{fmt(client.cyOutstanding)}</span>}</span>
            </div>
            <div className="amount-row total">
              <span>Total outstanding</span>
              <span>{fmt((client.pyOutstanding||0)+(client.cyOutstanding||0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client-product editable grid */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Client-specific products & rates</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowNewCp(true); setEditCp(blankCp()) }}>
            + Add product
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Size</th><th>Handle</th>
                <th>Base price</th><th>Agreed price</th>
                <th>Stereo ref</th><th>Spec</th><th style={{width:90}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showNewCp && (
                <tr className="row-edit-active">
                  <td colSpan={4}>
                    <select className="cell-select" style={{minWidth:260}} value={editCp?.productId||''} onChange={e=>onCpProductChange(e.target.value)}>
                      {products.map(p=><option key={p.id} value={p.id}>{p.name} — {p.size} — {p.handle}</option>)}
                    </select>
                  </td>
                  <td className="text-muted" style={{fontSize:11}}>
                    {fmt(products.find(p=>String(p.id)===String(editCp?.productId))?.basePrice)}
                  </td>
                  <td><input className="cell-input" type="number" step="0.01" style={{width:90}} value={editCp?.agreedPrice||''} onChange={e=>setCpField('agreedPrice',e.target.value)} /></td>
                  <td><input className="cell-input" style={{width:120}} value={editCp?.stereoRef||''} onChange={e=>setCpField('stereoRef',e.target.value)} placeholder="e.g. RAVI-2024" /></td>
                  <td><input className="cell-input" style={{width:160}} value={editCp?.specialSpec||''} onChange={e=>setCpField('specialSpec',e.target.value)} /></td>
                  <td><RowActions editing saving={saving} onSave={saveCpRow} onCancel={cancelCp} /></td>
                </tr>
              )}
              {!cps.length && !showNewCp && (
                <tr><td colSpan={9} className="empty-state">No products mapped yet. Add products with negotiated prices.</td></tr>
              )}
              {cps.map(cp => {
                const isEditing = editCp?.id === cp.id
                return (
                  <tr key={cp.id} className={isEditing ? 'row-edit-active' : ''}>
                    <td style={{fontWeight:600}}>{cp.productName}</td>
                    <td className="mono text-muted">{cp.productSku}</td>
                    <td className="text-muted">{cp.size}</td>
                    <td><span className="tag">{cp.handle}</span></td>
                    <td><span className="rate-base">{fmt(cp.basePrice)}</span></td>
                    <td>
                      {isEditing
                        ? <input className="cell-input" type="number" step="0.01" style={{width:90}} value={editCp?.agreedPrice||''} onChange={e=>setCpField('agreedPrice',e.target.value)} />
                        : <span className="rate-agreed">{fmt(cp.agreedPrice)}</span>}
                    </td>
                    <td>
                      {isEditing
                        ? <input className="cell-input" style={{width:120}} value={editCp?.stereoRef||''} onChange={e=>setCpField('stereoRef',e.target.value)} />
                        : <span className="mono text-muted" style={{fontSize:11}}>{cp.stereoRef||'—'}</span>}
                    </td>
                    <td>
                      {isEditing
                        ? <input className="cell-input" style={{width:160}} value={editCp?.specialSpec||''} onChange={e=>setCpField('specialSpec',e.target.value)} />
                        : <span className="text-muted text-small">{cp.specialSpec||'—'}</span>}
                    </td>
                    <td>
                      <RowActions editing={isEditing} saving={saving}
                        onEdit={()=>startEditCp(cp)} onSave={saveCpRow} onCancel={cancelCp}
                        onDelete={()=>removeCp(cp.id)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
