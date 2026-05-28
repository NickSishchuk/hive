import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const client = axios.create({ baseURL: '/api' })

// ── Request: attach access token ─────────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: handle 401 with a single refresh attempt ───────────────────────
// Queue of requests waiting for the refresh to complete
let isRefreshing = false
let queue = []

const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  queue = []
}

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    // Only attempt refresh on 401, once per request
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }

    if (isRefreshing) {
      // Another refresh is in flight — queue this request
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return client(original)
      })
    }

    original._retry = true
    isRefreshing = true

    const { refreshToken, login, logout } = useAuthStore.getState()

    try {
      // Use plain axios (not `client`) to avoid interceptor loop
      const { data } = await axios.post('/api/auth/refresh', { refreshToken })
      login(data)
      flushQueue(null, data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return client(original)
    } catch (refreshErr) {
      flushQueue(refreshErr)
      logout()
      window.location.href = '/'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default client
