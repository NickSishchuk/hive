import client from './client'

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken, refreshToken, user: { id, email, name } }>}
 */
export const login = (credentials) =>
  client.post('/auth/login', credentials).then((r) => r.data)

/**
 * POST /api/auth/register
 * @param {{ email: string, name: string, password: string }} payload
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
export const register = (payload) =>
  client.post('/auth/register', payload).then((r) => r.data)

/**
 * POST /api/auth/logout
 * Invalidates the refresh token on the server.
 */
export const logout = (refreshToken) =>
  client.post('/auth/logout', { refreshToken }).catch(() => {/* ignore errors on logout */})
