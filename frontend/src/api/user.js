import client from './client'

export const getMe = () =>
  client.get('/users/me').then((r) => r.data)

export const updateMe = (payload) =>
  client.patch('/users/me', payload).then((r) => r.data)

export const getStats = () =>
  client.get('/users/me/stats').then((r) => r.data)

export const getBadges = () =>
  client.get('/users/me/badges').then((r) => r.data)

/**
 * PATCH /api/auth/change-password
 * See BACKEND_MISSING_ENDPOINTS.md
 */
export const changePassword = (payload) =>
  client.patch('/auth/change-password', payload).then((r) => r.data)

/**
 * DELETE /api/users/me
 * See BACKEND_MISSING_ENDPOINTS.md
 */
export const deleteAccount = () =>
  client.delete('/users/me').then((r) => r.data)
