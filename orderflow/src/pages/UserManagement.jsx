import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getUsers, createUser, updateUser, setUserActive, deleteUser, deleteAllData } from '../api/client'
import { Modal, Spinner } from '../components/UI'
import { useAuth } from '../auth/AuthContext'

const ROLE_OPTS = [
  { value: 'ADMIN', label: 'Admin', desc: 'Full access to all modules' },
  { value: 'SALES', label: 'Sales', desc: 'Clients, orders, invoices, reports' },
  { value: 'OPERATOR', label: 'Operator', desc: 'Job cards only, no rates or amounts' },
]

const ROLE_COLORS = {
  ADMIN: { color: '#6D28D9', bg: '#F5F3FF' },
  SALES: { color: '#1D4ED8', bg: '#EFF6FF' },
  OPERATOR: { color: '#15803D', bg: '#F0FDF4' },
}

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || { color: '#6A6760', bg: '#F4F3EE' }
  return <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{role}</span>
}

function Avatar({ initials, role }) {
  const c = ROLE_COLORS[role] || { color: '#6A6760', bg: '#F4F3EE' }
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export default function UserManagement() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ username: '', fullName: '', role: 'SALES', password: '', confirmPw: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPw: '' })
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const load = () => {
    setLoading(true)
    getUsers().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ username: '', fullName: '', role: 'SALES', password: '', confirmPw: '' })
    setModal('create')
  }

  const openEdit = u => {
    setSelected(u)
    setForm({ username: u.username, fullName: u.fullName, role: u.role, password: '', confirmPw: '' })
    setModal('edit')
  }

  const openResetPw = u => {
    setSelected(u)
    setForm(f => ({ ...f, password: '', confirmPw: '' }))
    setModal('pw')
  }

  const openChangePw = () => {
    setPwForm({ currentPassword: '', newPassword: '', confirmPw: '' })
    setModal('changepw')
  }

  const saveCreate = async () => {
    if (!form.username.trim() || !form.fullName.trim()) { toast.error('Username and full name required'); return }
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.password !== form.confirmPw) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      const u = await createUser({ username: form.username.trim(), fullName: form.fullName.trim(), role: form.role, password: form.password })
      setUsers(prev => [...prev, u])
      setModal(null)
      toast.success(`User "${u.username}" created`)
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async () => {
    if (!form.fullName.trim()) { toast.error('Full name required'); return }
    setSaving(true)
    try {
      const u = await updateUser(selected.id, { fullName: form.fullName.trim(), role: form.role })
      setUsers(prev => prev.map(x => x.id === u.id ? u : x))
      setModal(null)
      toast.success('User updated')
    } finally {
      setSaving(false)
    }
  }

  const saveResetPw = async () => {
    if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.password !== form.confirmPw) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await updateUser(selected.id, { fullName: selected.fullName, role: selected.role, password: form.password })
      setModal(null)
      toast.success(`Password reset for "${selected.username}"`)
    } finally {
      setSaving(false)
    }
  }

  const saveChangePw = async () => {
    if (!pwForm.currentPassword) { toast.error('Current password required'); return }
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (pwForm.newPassword !== pwForm.confirmPw) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      const token = sessionStorage.getItem('of_token')
      await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      }).then(async r => {
        if (!r.ok) {
          const d = await r.json()
          throw new Error(d.message)
        }
      })
      setModal(null)
      toast.success('Password changed successfully')
    } catch (e) {
      toast.error(e.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async u => {
    if (u.id === me?.id) { toast.error("Can't disable your own account"); return }
    try {
      const updated = await setUserActive(u.id, !u.active)
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x))
      toast.success(updated.active ? `${u.username} enabled` : `${u.username} disabled`)
    } catch {}
  }

  const handleDelete = async u => {
    if (u.id === me?.id) { toast.error("Can't delete your own account"); return }
    if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return
    try {
      await deleteUser(u.id)
      setUsers(prev => prev.filter(x => x.id !== u.id))
      toast.success(`User "${u.username}" deleted`)
    } catch {}
  }

  const handleDeleteAll = async () => {
    if (me?.role !== 'ADMIN') {
      toast.error('Only ADMIN can delete all data')
      return
    }
    if (!window.confirm('Delete ALL data (Orders, Invoices, Clients, Payments)? This cannot be undone.')) return
    try {
      await deleteAllData()
      toast.success('All data deleted successfully')
      window.location.reload()
    } catch (e) {
      toast.error(e.message || 'Failed to delete all data')
    }
  }

  if (loading) return <Spinner />

  const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
    const text = query.trim().toLowerCase()
    const matchesQuery = !text || [u.username, u.fullName, u.role]
      .some(value => String(value || '').toLowerCase().includes(text))
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesQuery && matchesRole
  })

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">User management</h1>
        <div className="page-actions">
          {me?.role === 'ADMIN' && <button className="btn btn-danger" onClick={handleDeleteAll} style={{ marginRight: 8 }}>Delete All Data</button>}
          <button className="btn" onClick={openChangePw}>Change my password</button>
          <button className="btn btn-primary" onClick={openCreate}>+ New user</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {ROLE_OPTS.map(r => {
          const c = ROLE_COLORS[r.value]
          return (
            <div key={r.value} style={{ background: '#fff', border: `1px solid ${c.bg}`, borderRadius: 10, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {r.value === 'ADMIN' ? 'A' : r.value === 'SALES' ? 'S' : 'O'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 1 }}>{r.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="form-grid">
          <div className="field">
            <label>Search</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Username, name, role" />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="ALL">All</option>
              {ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Username</th><th>Role</th><th>Status</th><th style={{ width: 160 }}>Actions</th></tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Avatar initials={u.avatar || u.username.slice(0, 2).toUpperCase()} role={u.role} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>
                          {u.fullName}
                          {u.id === me?.id && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#6D28D9', background: '#F5F3FF', padding: '1px 5px', borderRadius: 10 }}>YOU</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="mono text-muted" style={{ fontSize: 11 }}>{u.username}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>{u.active ? <span className="badge badge-green">Active</span> : <span className="badge badge-red">Disabled</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-sm" onClick={() => openResetPw(u)}>Reset</button>
                      {u.id !== me?.id && <>
                        <button className={`btn btn-sm ${u.active ? '' : 'btn-success'}`} onClick={() => toggleActive(u)}>{u.active ? 'Disable' : 'Enable'}</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u)}>Delete</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'create' && (
        <Modal title="Create new user" onClose={() => setModal(null)}>
          <div className="form-grid">
            <div className="field"><label>Username *</label><input value={form.username} onChange={e => set('username', e.target.value)} autoFocus /></div>
            <div className="field"><label>Full name *</label><input value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
            <div className="field field-full"><label>Role *</label><select value={form.role} onChange={e => set('role', e.target.value)}>{ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
            <div className="field"><label>Password *</label><input type="password" value={form.password} onChange={e => set('password', e.target.value)} /></div>
            <div className="field"><label>Confirm password *</label><input type="password" value={form.confirmPw} onChange={e => set('confirmPw', e.target.value)} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveCreate} disabled={saving}>{saving ? 'Creating...' : 'Create user'}</button>
          </div>
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title={`Edit user - ${selected.username}`} onClose={() => setModal(null)}>
          <div className="form-grid">
            <div className="field field-full"><label>Full name *</label><input value={form.fullName} onChange={e => set('fullName', e.target.value)} autoFocus /></div>
            <div className="field field-full"><label>Role *</label><select value={form.role} onChange={e => set('role', e.target.value)}>{ROLE_OPTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </Modal>
      )}

      {modal === 'pw' && selected && (
        <Modal title={`Reset password - ${selected.username}`} onClose={() => setModal(null)}>
          <div className="form-grid">
            <div className="field"><label>New password *</label><input type="password" value={form.password} onChange={e => set('password', e.target.value)} autoFocus /></div>
            <div className="field"><label>Confirm new password *</label><input type="password" value={form.confirmPw} onChange={e => set('confirmPw', e.target.value)} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveResetPw} disabled={saving}>{saving ? 'Saving...' : 'Reset password'}</button>
          </div>
        </Modal>
      )}

      {modal === 'changepw' && (
        <Modal title="Change my password" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div className="field"><label>Current password *</label><input type="password" value={pwForm.currentPassword} onChange={e => setPw('currentPassword', e.target.value)} autoFocus /></div>
            <div className="field"><label>New password *</label><input type="password" value={pwForm.newPassword} onChange={e => setPw('newPassword', e.target.value)} /></div>
            <div className="field"><label>Confirm new password *</label><input type="password" value={pwForm.confirmPw} onChange={e => setPw('confirmPw', e.target.value)} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveChangePw} disabled={saving}>{saving ? 'Saving...' : 'Change password'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
