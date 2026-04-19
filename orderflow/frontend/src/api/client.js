import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.response?.data || err.message || 'Request failed'
    toast.error(String(msg).substring(0, 120))
    return Promise.reject(err)
  }
)

export const getDashboard = () => api.get('/dashboard').then(r => r.data)

// Clients
export const getClients      = ()       => api.get('/clients').then(r => r.data)
export const getClient       = id       => api.get(`/clients/${id}`).then(r => r.data)
export const createClient    = data     => api.post('/clients', data).then(r => r.data)
export const updateClient    = (id, d)  => api.put(`/clients/${id}`, d).then(r => r.data)

// Client Products
export const getClientProducts    = id           => api.get(`/clients/${id}/products`).then(r => r.data)
export const addClientProduct     = (cid, d)     => api.post(`/clients/${cid}/products`, d).then(r => r.data)
export const updateClientProduct  = (cid,cpId,d) => api.put(`/clients/${cid}/products/${cpId}`, d).then(r => r.data)
export const deleteClientProduct  = (cid, cpId)  => api.delete(`/clients/${cid}/products/${cpId}`)

// Products
export const getProducts    = ()       => api.get('/products').then(r => r.data)
export const getProduct     = id       => api.get(`/products/${id}`).then(r => r.data)
export const createProduct  = data     => api.post('/products', data).then(r => r.data)
export const updateProduct  = (id, d)  => api.put(`/products/${id}`, d).then(r => r.data)

// Sales Orders
export const getOrders         = ()            => api.get('/orders').then(r => r.data)
export const getOrder          = id            => api.get(`/orders/${id}`).then(r => r.data)
export const createOrder       = data          => api.post('/orders', data).then(r => r.data)
export const updateOrder       = (id, d)       => api.put(`/orders/${id}`, d).then(r => r.data)
export const updateOrderStatus = (id, status)  => api.put(`/orders/${id}/status?status=${status}`).then(r => r.data)
export const updateOrderLine   = (oid,lid,d)   => api.put(`/orders/${oid}/lines/${lid}`, d).then(r => r.data)

// Job Cards
export const getJobCards          = ()             => api.get('/jobcards').then(r => r.data)
export const getJobCard           = id             => api.get(`/jobcards/${id}`).then(r => r.data)
export const updateJobCard        = (id, d)        => api.put(`/jobcards/${id}`, d).then(r => r.data)
export const updateJobCardStatus  = (id, status)   => api.put(`/jobcards/${id}/status?status=${status}`).then(r => r.data)
export const addActivity          = (id, d)        => api.post(`/jobcards/${id}/activities`, d).then(r => r.data)
export const deleteActivity       = (jcId, actId)  => api.delete(`/jobcards/${jcId}/activities/${actId}`).then(r => r.data)

// Invoices
export const getInvoices    = ()       => api.get('/invoices').then(r => r.data)
export const getInvoice     = id       => api.get(`/invoices/${id}`).then(r => r.data)
export const createInvoice  = data     => api.post('/invoices', data).then(r => r.data)

// Payments
export const getPayments    = ()       => api.get('/payments').then(r => r.data)
export const createPayment  = data     => api.post('/payments', data).then(r => r.data)

// AI Chat
export const sendChat = data => api.post('/ai/chat', data).then(r => r.data)

export default api
export const deleteOrder = (id) =>
  fetch(`/api/orders/${id}`, {
    method: 'DELETE'
  }).then(r => {
    if (!r.ok) throw new Error('Delete failed')
  })
// ── Auth APIs ─────────────────────────────



export const loginApi = (username, password) =>
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username,
      password: password
    })
  }).then(r => r.json())

export const logoutApi = () =>
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  }).then(r => {
    if (!r.ok) throw new Error('Logout failed')
  })

export const meApi = () => {
  const token = sessionStorage.getItem('of_token')

  return fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(r => {
    if (!r.ok) throw new Error('Not authenticated')
    return r.json()
  })
}
  // ── User Management APIs ─────────────────────────────
// ── User Management APIs ─────────────────────────────

const getToken = () => sessionStorage.getItem('of_token')

export const getUsers = () =>
  fetch('/api/auth/users', {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  }).then(r => r.json())

export const createUser = (data) =>
  fetch('/api/auth/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  }).then(r => r.json())

export const updateUser = (id, data) =>
  fetch(`/api/auth/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data)
  }).then(r => r.json())

export const setUserActive = (id, active) =>
  fetch(`/api/auth/users/${id}/active`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ active })
  }).then(r => r.json())

export const deleteUser = (id) =>
  fetch(`/api/auth/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  // ── ADMIN APIs ─────────────────────────────
  export const deleteAllData = () =>
    fetch('/api/admin/delete-all', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }).then(r => {
      if (!r.ok) throw new Error('Delete all failed')
    })