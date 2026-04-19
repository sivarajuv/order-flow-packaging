import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import toast from 'react-hot-toast'
import { BRAND } from '../branding'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) { setError('Enter username and password'); return }
    setLoading(true); setError('')
    try {
      await login(username.trim(), password)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid username or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inp = (extra = {}) => ({
    style: {
      width: '100%', height: 40, border: '1px solid #E2DFD8', borderRadius: 8,
      padding: '0 12px', outline: 'none', fontSize: 13, color: '#1C1B18',
      background: '#FAFAF8', fontFamily: 'inherit', boxSizing: 'border-box',
      ...extra,
    },
    onFocus:  e => { e.target.style.borderColor = '#1D4ED8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,.08)' },
    onBlur:   e => { e.target.style.borderColor = '#E2DFD8'; e.target.style.boxShadow = 'none' },
  })

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg,#F4F3EE 0%,#EBE9E2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, fontFamily: '"IBM Plex Sans", sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            style={{
              width: 88, height: 88, objectFit: 'cover', borderRadius: 18,
              marginBottom: 14, boxShadow: '0 10px 24px rgba(0,0,0,.14)', border: '1px solid #DCCF8A',
            }}
          />
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.4px', color: '#1C1B18' }}>
            {BRAND.name}
          </div>
          <div style={{ fontSize: 12, color: '#6A6760', marginTop: 4 }}>
            {BRAND.subtitle}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', border: '1px solid #E2DFD8', borderRadius: 16,
          padding: '32px 28px 28px', boxShadow: '0 8px 32px rgba(0,0,0,.07)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 22, color: '#1C1B18' }}>
            Sign in to your account
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#6A6760', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Username
              </label>
              <input
                autoFocus autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                {...inp()}
              />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#6A6760', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  {...inp({ paddingRight: 52 })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#A09C97', fontSize: 11, fontFamily: 'inherit', padding: 0,
                  }}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8,
                padding: '10px 12px', fontSize: 12, color: '#991B1B',
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <span style={{ fontSize: 14 }}>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 42, background: loading ? '#6B8ED8' : '#1D4ED8', color: '#fff',
                border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                fontFamily: 'inherit', transition: 'background .15s', letterSpacing: '.01em',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#A09C97' }}>
          Contact your administrator if you need access.
        </div>
      </div>
    </div>
  )
}
