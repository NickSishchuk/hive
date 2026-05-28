import client from './client'

/**
 * POST /api/sessions/start
 * @returns {Promise<{ sessionId: string, roomId: string, startedAt: string }>}
 */
export const startSession = () =>
  client.post('/sessions/start').then((r) => r.data)

/**
 * PATCH /api/sessions/:id/end
 * @param {string} sessionId
 * @param {{ pomodoroCount: number }} payload
 * @returns {Promise<{ sessionId, durationMinutes, pomodoroCount, startedAt, endedAt }>}
 */
export const endSession = (sessionId, payload) =>
  client.patch(`/sessions/${sessionId}/end`, payload).then((r) => r.data)

/**
 * GET /api/sessions/history
 * @returns {Promise<Array<{
 *   sessionId: string,
 *   roomId: string,
 *   durationMinutes: number,
 *   pomodoroCount: number,
 *   startedAt: string,
 *   endedAt: string | null,
 * }>>}
 */
export const getSessionHistory = () =>
  client.get('/sessions/history').then((r) => r.data)

/**
 * GET /api/rooms/online-count
 * @returns {Promise<{ count: number }>}
 */
export const getOnlineCount = () =>
  client.get('/rooms/online-count').then((r) => r.data)
