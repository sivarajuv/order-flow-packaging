import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../api/client'
import { Badge, fmt, Pipeline, Spinner } from '../components/UI'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const nav = useNavigate()

  useEffect(() => { getDashboard().then(setData) }, [])
  if (!data) return <Spinner />

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <span className="text-muted text-small">
          {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </span>
      </div>

      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-label">CY Outstanding</div>
          <div className="metric-value" style={{ color: 'var(--amber)' }}>{fmt(data.totalCyOutstanding)}</div>
          <div className="metric-sub">PY: {fmt(data.totalPyOutstanding)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Open orders</div>
          <div className="metric-value">{data.openOrders}</div>
          <div className="metric-sub">{data.activeJobs} jobs active</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active clients</div>
          <div className="metric-value">{data.clientSummary?.filter(c => c.status === 'ACTIVE').length ?? 0}</div>
          <div className="metric-sub">{data.clientSummary?.length ?? 0} total</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Overdue invoices</div>
          <div className="metric-value" style={{ color: 'var(--red)' }}>{data.overdueInvoices}</div>
          <div className="metric-sub">Needs attention</div>
        </div>
      </div>

      {/* Production status per job card with pipeline */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header">
          <div className="card-title">Production status — active job cards</div>
          <button className="btn btn-sm" onClick={() => nav('/jobcards')}>View all</button>
        </div>
        {!data.activeJobCards?.length
          ? <div className="empty-state">No active job cards at the moment</div>
          : data.activeJobCards.map(jc => (
            <div
              key={jc.id}
              className="prod-row"
              onClick={() => nav(`/jobcards/${jc.id}`)}
            >
              <div className="prod-row-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="mono fw-600">{jc.jobCardNo}</span>
                  <span className="text-muted text-small">{jc.clientName}</span>
                  <span style={{ fontWeight: 500 }}>{jc.productName}</span>
                  {jc.size && <span className="tag">{jc.size}</span>}
                  {jc.handle && jc.handle !== 'None' && <span className="tag">{jc.handle}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="tag">{(jc.qty || 0).toLocaleString('en-IN')} pcs</span>
                  <Badge status={jc.status} />
                </div>
              </div>
              <Pipeline doneStages={jc.doneStages || []} />
            </div>
          ))
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Pending invoices */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending invoices</div>
            <button className="btn btn-sm" onClick={() => nav('/invoices')}>View all</button>
          </div>
          {!data.unpaidInvoices?.length
            ? <div className="empty-state">All invoices paid</div>
            : (
              <table className="data-table">
                <thead>
                  <tr><th>Invoice</th><th>Client</th><th>Due date</th><th className="r">Balance</th></tr>
                </thead>
                <tbody>
                  {data.unpaidInvoices.map(inv => (
                    <tr key={inv.id} className="clickable" onClick={() => nav(`/invoices/${inv.id}`)}>
                      <td className="mono">{inv.invoiceNo}</td>
                      <td>{inv.clientName}</td>
                      <td className="text-muted text-small">{inv.dueDate}</td>
                      <td className="r fw-600" style={{ color: 'var(--amber)' }}>{fmt(inv.balanceDue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* Client outstanding */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Client outstanding</div>
            <button className="btn btn-sm" onClick={() => nav('/clients')}>View all</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Client</th><th>SP</th><th>PY o/s</th><th>CY o/s</th><th className="r">Total</th></tr>
            </thead>
            <tbody>
              {data.clientSummary?.map(c => (
                <tr key={c.id} className="clickable" onClick={() => nav(`/clients/${c.id}`)}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td className="text-muted">{c.salesperson}</td>
                  <td>{fmt(c.pyOutstanding)}</td>
                  <td style={{ color: 'var(--amber)' }}>{fmt(c.cyOutstanding)}</td>
                  <td className="r fw-600">{fmt((c.pyOutstanding || 0) + (c.cyOutstanding || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
