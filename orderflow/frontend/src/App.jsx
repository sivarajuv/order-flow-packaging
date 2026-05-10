import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth, ROLE_PERMISSIONS } from './auth/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { ClientsList, ClientDetail } from './pages/Clients'
import Products from './pages/Products'
import { OrdersList, OrderDetail } from './pages/Orders'
import { JobCardsList, JobCardDetail } from './pages/JobCards'
import { OperatorJobCardsList, OperatorJobCardDetail } from './pages/OperatorJobCards'
import { InvoicesList, InvoiceDetail } from './pages/Invoices'
import Payments from './pages/Payments'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'
import AiChat from './components/AiChat'
import { BRAND } from './branding'

const ALL_NAV = [
  { to: '/',         key: 'dashboard', label: 'Dashboard',    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/clients',  key: 'clients',   label: 'Clients',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { to: '/products', key: 'products',  label: 'Products',     icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/orders',   key: 'orders',    label: 'Sales orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/jobcards', key: 'jobcards',  label: 'Job cards',    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { to: '/invoices', key: 'invoices',  label: 'Invoices',     icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/payments', key: 'payments',  label: 'Payments',     icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { to: '/expenses', key: 'expenses',  label: 'Expenses',     icon: 'M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3-.672 3-1.5S13.657 8 12 8zm0 5c-2.21 0-4 .895-4 2v1h8v-1c0-1.105-1.79-2-4-2zm7-9H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z' },
  { to: '/reports',  key: 'reports',   label: 'Reports',      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/users',    key: 'users',     label: 'Users',        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
]

// ── Sidebar ───────────────────────────────────────────────
function Sidebar() {
  const { user, logout, perms } = useAuth()
  const allowedPages = perms?.pages || []
  const visibleNav   = ALL_NAV.filter(n => allowedPages.includes(n.key))
  const roleInfo     = ROLE_PERMISSIONS[user?.role] || {}

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src={BRAND.logo} alt={BRAND.name} className="sb-logo" style={{ objectFit: 'cover' }} />
        <div>
          <div className="sb-name">{BRAND.name}</div>
          <div className="sb-sub">{BRAND.subtitle}</div>
        </div>
      </div>

      <nav className="sb-nav">
        {visibleNav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <svg fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User strip + logout */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: roleInfo.bg || 'var(--surface2)',
            color: roleInfo.color || 'var(--ink2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700,
          }}>
            {user?.avatar || user?.username?.slice(0,2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || user?.username}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: roleInfo.color, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {roleInfo.label}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '5px 0', background: 'none',
            border: '1px solid var(--border)', borderRadius: 'var(--r)',
            fontSize: 11, color: 'var(--ink2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: 'inherit', transition: 'all .1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--red-txt)'; e.currentTarget.style.borderColor='#FCA5A5' }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--ink2)'; e.currentTarget.style.borderColor='var(--border)' }}
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}

// ── Loading screen ────────────────────────────────────────
function SplashLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F4F3EE', fontFamily: '"IBM Plex Sans", sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <img
          src={BRAND.logo}
          alt={BRAND.name}
          style={{
            width: 56, height: 56, borderRadius: 14, marginBottom: 14,
            objectFit: 'cover', boxShadow: '0 8px 20px rgba(0,0,0,.12)', border: '1px solid #DCCF8A',
          }}
        />
        <div style={{ fontSize: 13, color: '#6A6760' }}>Loading…</div>
      </div>
    </div>
  )
}

// ── Main shell ────────────────────────────────────────────
function AppShell() {
  const { user, perms, loading } = useAuth()
  const [chatOpen, setChatOpen] = useState(false)

  if (loading) return <SplashLoader />
  if (!user)   return <Navigate to="/login" replace />

  // Operator: only job cards, no amounts
  if (user.role === 'OPERATOR') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <Routes>
            <Route path="/"              element={<Navigate to="/jobcards" replace />} />
            <Route path="/jobcards"      element={<OperatorJobCardsList />} />
            <Route path="/jobcards/:id"  element={<OperatorJobCardDetail />} />
            <Route path="*"              element={<Navigate to="/jobcards" replace />} />
          </Routes>
        </div>
      </div>
    )
  }

  // Admin + Sales: full app
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Routes>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/clients"       element={<ClientsList />} />
          <Route path="/clients/:id"   element={<ClientDetail />} />
          <Route path="/products"      element={<Products />} />
          <Route path="/orders"        element={<OrdersList />} />
          <Route path="/orders/:id"    element={<OrderDetail />} />
          <Route path="/jobcards"      element={<JobCardsList />} />
          <Route path="/jobcards/:id"  element={<JobCardDetail />} />
          <Route path="/invoices"      element={<InvoicesList />} />
          <Route path="/invoices/:id"  element={<InvoiceDetail />} />
          <Route path="/payments"      element={<Payments />} />
          <Route path="/expenses"      element={<Expenses />} />
          <Route path="/reports"       element={<Reports />} />
          {user.role === 'ADMIN' && (
            <Route path="/users"       element={<UserManagement />} />
          )}
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {perms?.aiChat && (
        <>
          <button className="ai-fab" onClick={() => setChatOpen(o => !o)} title="AI Assistant">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </button>
          {chatOpen && <AiChat onClose={() => setChatOpen(false)} />}
        </>
      )}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{ duration: 3500, style: { fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 } }}
        />
        <AuthRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

function AuthRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <SplashLoader />
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*"     element={<AppShell />} />
    </Routes>
  )
}
