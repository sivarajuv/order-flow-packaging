import { createContext, useContext, useState, useEffect } from 'react'
import { loginApi, logoutApi, meApi } from '../api/client'

// ── Role permissions (UI-level) ───────────────────────────
export const ROLE_PERMISSIONS = {
  ADMIN: {
    label: 'Administrator',
    color: '#6D28D9', bg: '#F5F3FF',
    pages: ['dashboard','clients','products','orders','jobcards','invoices','payments','reports','users'],
    canEdit: true, canViewRates: true, canViewAmounts: true,
    canPrint: true, canCreateOrder: true, canCreateInvoice: true,
    canRecordPayment: true, canManageUsers: true, aiChat: true,
  },
  SALES: {
    label: 'Sales',
    color: '#1D4ED8', bg: '#EFF6FF',
    pages: ['dashboard','clients','products','orders','jobcards','invoices','payments','reports'],
    canEdit: true, canViewRates: true, canViewAmounts: true,
    canPrint: true, canCreateOrder: true, canCreateInvoice: true,
    canRecordPayment: true, canManageUsers: false, aiChat: true,
  },
  OPERATOR: {
    label: 'Operator',
    color: '#15803D', bg: '#F0FDF4',
    pages: ['jobcards'],
    canEdit: false, canViewRates: false, canViewAmounts: false,
    canPrint: true, canCreateOrder: false, canCreateInvoice: false,
    canRecordPayment: false, canLogActivity: true, canUpdateStatus: true,
    canManageUsers: false, aiChat: false,
  },
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)  // checking existing session on mount

  // On mount: try to restore session from stored token
  useEffect(() => {
    const token = sessionStorage.getItem('of_token')
    if (!token) { setLoading(false); return }
    meApi()
      .then(u => setUser(u))
      .catch(() => {
        sessionStorage.removeItem('of_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
   const res = await loginApi(username, password)
    sessionStorage.setItem('of_token', res.token)
    setUser(res)
    return res
  }

  const logout = async () => {
    try { await logoutApi() } catch { /* ignore */ }
    sessionStorage.removeItem('of_token')
    setUser(null)
  }

  const perms = user ? (ROLE_PERMISSIONS[user.role] || null) : null

  return (
    <AuthContext.Provider value={{ user, login, logout, perms, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
