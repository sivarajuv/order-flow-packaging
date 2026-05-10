import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createExpense, getExpenses } from '../api/client'
import { Modal, Spinner, fmt, today } from '../components/UI'

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    getExpenses().then(data => setExpenses([...data].reverse())).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))]
  const filteredExpenses = expenses.filter(exp => {
    const text = query.trim().toLowerCase()
    const matchesQuery = !text || [exp.category, exp.paidTo, exp.description, exp.notes]
      .some(value => String(value || '').toLowerCase().includes(text))
    const matchesCategory = categoryFilter === 'ALL' || exp.category === categoryFilter
    return matchesQuery && matchesCategory
  })
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0)

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add expense</button>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="form-grid">
          <div className="field">
            <label>Search</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Category, paid to, description" />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="ALL">All</option>
              {categories.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
        <div className="metric-card">
          <div className="metric-label">Entries</div>
          <div className="metric-value">{filteredExpenses.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total expense</div>
          <div className="metric-value" style={{ color: 'var(--red)' }}>{fmt(totalExpenses)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Last expense</div>
          <div className="metric-value" style={{ fontSize: 14 }}>{expenses[0]?.expenseDate || '-'}</div>
          <div className="metric-sub">{expenses[0]?.category || '-'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Category</th><th>Paid to</th><th>Description</th><th>Notes</th><th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {!filteredExpenses.length
                ? <tr><td colSpan={6} className="empty-state">No expenses recorded</td></tr>
                : filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="text-muted text-small">{exp.expenseDate}</td>
                    <td><span className="tag">{exp.category || '-'}</span></td>
                    <td style={{ fontWeight: 500 }}>{exp.paidTo || '-'}</td>
                    <td>{exp.description || '-'}</td>
                    <td className="text-muted">{exp.notes || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--red)' }}>{fmt(exp.amount)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSave={(saved) => {
        setExpenses(prev => [saved, ...prev])
        setShowModal(false)
        toast.success('Expense added')
      }} />}
    </div>
  )
}

function ExpenseModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    expenseDate: today(),
    category: 'Transport',
    paidTo: '',
    description: '',
    amount: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const save = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Amount is required')
      return
    }
    setSaving(true)
    try {
      const saved = await createExpense({
        ...form,
        amount: parseFloat(form.amount),
      })
      onSave(saved)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Add expense" onClose={onClose}>
      <div className="form-grid">
        <div className="field"><label>Date</label><input type="date" value={form.expenseDate} onChange={e => set('expenseDate', e.target.value)} /></div>
        <div className="field"><label>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            <option>Transport</option>
            <option>Material</option>
            <option>Labour</option>
            <option>Office</option>
            <option>Maintenance</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field"><label>Amount (Rs) *</label><input type="number" step="0.01" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
        <div className="field"><label>Paid to</label><input value={form.paidTo} onChange={e => set('paidTo', e.target.value)} /></div>
        <div className="field field-full"><label>Description</label><input value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div className="field field-full"><label>Notes</label><textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      </div>
      <div className="modal-footer">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save expense'}</button>
      </div>
    </Modal>
  )
}
