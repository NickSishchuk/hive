// ─── User ────────────────────────────────────────────────────────────────────
// TODO Stage 3: replace with /api/users/me response
export const MOCK_USER = {
  id:    'mock-user-id',
  name:  'Аліна Кароль',
  email: 'alina@gmail.com',
}

// ─── Stats ───────────────────────────────────────────────────────────────────
// TODO Stage 3: replace with /api/users/me/stats response
export const MOCK_STATS = {
  totalHours:    48,
  streakDays:    12,
  totalSessions: 96,
}

// ─── Badges ──────────────────────────────────────────────────────────────────
// TODO Stage 3: replace with /api/users/me/badges response
// earned: false = locked (lock icon shown)
export const MOCK_BADGES = [
  { key: 'first_session', icon: '🏅', name: 'Перша сесія',    description: 'Провів першу сесію',      earned: true  },
  { key: 'streak_7',      icon: '🔥', name: 'Тижневий стрік', description: '7 днів підряд',            earned: true  },
  { key: 'sprinter',      icon: '⚡', name: 'Спринтер',        description: '10 сесій за тиждень',     earned: true  },
  { key: 'focus_master',  icon: '🌟', name: 'Майстер фокусу', description: '50 годин роботи',          earned: true  },
  { key: 'legend',        icon: '🏆', name: 'Легенда',         description: '100 сесій',               earned: false },
  { key: 'accuracy',      icon: '🎯', name: 'Точність',        description: '25 сесій без пропусків',  earned: false },
]

// ─── Activity grid ───────────────────────────────────────────────────────────
// 5 weeks × 7 days (Mon → Sun), values 0–4 (intensity of pink)
// TODO Stage 3: compute from session history
export const MOCK_ACTIVITY = [
  [0, 2, 1, 3, 2, 0, 1],
  [1, 3, 2, 4, 3, 1, 0],
  [2, 4, 3, 4, 2, 3, 1],
  [3, 2, 4, 3, 4, 2, 3],
  [1, 3, 2, 4, 3, 4, 2],
]

// ─── Room ────────────────────────────────────────────────────────────────────
// TODO Stage 3: replace with StartSessionResponse (sessionId, roomId, participantCount)
export const MOCK_ROOM = {
  participantCount: 6,
}

// ─── Settings ────────────────────────────────────────────────────────────────
// TODO Stage 3: merge /api/users/me + local preferences stored in localStorage
export const MOCK_SETTINGS = {
  name:             'Аліна Кароль',
  email:            'alina@gmail.com',
  camera:           'FaceTime HD Camera',
  resolution:       '720p',
  pomodoroMinutes:  25,
  breakMinutes:     5,
}
