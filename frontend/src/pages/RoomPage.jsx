import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LiveKitRoom,
  useLocalParticipant,
  useParticipants,
  useTracks,
  VideoTrack,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { startSession, endSession } from '../api/session'

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_TILES = 6

const TILE_GRADIENTS = [
  'from-violet-400 to-purple-500',
  'from-sky-400    to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400  to-orange-500',
  'from-rose-400   to-pink-500',
  'from-cyan-400   to-blue-500',
]

const getPomodoroSec = () => {
  const val = parseInt(localStorage.getItem('hive-pomodoro-minutes') ?? '25', 10)
  return (isNaN(val) || val < 1 ? 25 : val) * 60
}

function PersonIcon() {
  return (
    <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  )
}

// ── Participant tile — shows live video or a placeholder ───────────────────────

function ParticipantTile({ trackRef, index }) {
  const gradient   = TILE_GRADIENTS[index % TILE_GRADIENTS.length]
  const isLocal    = trackRef.participant?.isLocal ?? false
  const isMuted    = trackRef.publication?.isMuted ?? true
  const noVideo    = !trackRef.publication || isMuted

  if (noVideo) {
    return (
      <div className={`rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2 ${
        isLocal ? 'bg-gray-900' : `bg-gradient-to-br ${gradient}`
      }`}>
        <PersonIcon />
        {isLocal && <span className="text-gray-400 text-xs">Камера вимкнена</span>}
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-gray-900">
      <VideoTrack
        trackRef={trackRef}
        className={`w-full h-full object-cover ${isLocal ? '[transform:scaleX(-1)]' : ''}`}
      />
    </div>
  )
}

// Faded placeholder tile shown when fewer than MAX_TILES participants are present
function EmptyTile({ index }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${TILE_GRADIENTS[index % TILE_GRADIENTS.length]} opacity-20 flex items-center justify-center`}>
      <PersonIcon />
    </div>
  )
}

// ── RoomContent — must be inside <LiveKitRoom> to use LiveKit hooks ────────────

function RoomContent({ onLeave, timerRunning, timeLeft, completedPomodoros, onToggleTimer }) {
  const { localParticipant } = useLocalParticipant()
  const participants         = useParticipants()
  const tracks               = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  )

  const [cameraEnabled, setCameraEnabled] = useState(true)

  const toggleCamera = async () => {
    try {
      await localParticipant.setCameraEnabled(!cameraEnabled)
      setCameraEnabled((v) => !v)
    } catch (e) {
      console.error('Camera toggle failed', e)
    }
  }

  const fmt      = (n) => String(n).padStart(2, '0')
  const minutes  = Math.floor(timeLeft / 60)
  const seconds  = timeLeft % 60
  const empties  = Math.max(0, MAX_TILES - tracks.length)

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0">
        <span className="font-bold text-gray-900 tracking-tight">Hive</span>
        <span className="text-sm text-gray-400">
          {participants.length} учасник{participants.length === 1 ? '' : 'ів'}
        </span>
        <button
          onClick={onLeave}
          className="px-4 py-1.5 text-sm text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Вийти
        </button>
      </header>

      {/* Video grid */}
      <div className="flex-1 p-4 grid grid-cols-3 grid-rows-2 gap-3 min-h-0">
        {tracks.slice(0, MAX_TILES).map((trackRef, i) => (
          <ParticipantTile
            key={trackRef.participant?.sid ?? `track-${i}`}
            trackRef={trackRef}
            index={i}
          />
        ))}
        {Array.from({ length: empties }).map((_, i) => (
          <EmptyTile key={`empty-${i}`} index={tracks.length + i} />
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 border-t border-gray-100 px-6 py-3 flex items-center">

        {/* Camera toggle */}
        <button
          onClick={toggleCamera}
          title={cameraEnabled ? 'Вимкнути камеру' : 'Увімкнути камеру'}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            cameraEnabled
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-red-100 text-red-500 hover:bg-red-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {cameraEnabled
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 5.656M3 3l18 18M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2v-1" />
            }
          </svg>
        </button>

        {/* Pomodoro timer */}
        <div className="flex-1 flex items-center justify-center gap-3 select-none">
          <span className="text-sm text-gray-400 w-6 text-right">хв</span>
          <span className="text-2xl font-bold text-gray-800 w-9 text-center tabular-nums">{fmt(minutes)}</span>
          <button
            onClick={onToggleTimer}
            className="w-8 h-8 rounded-full bg-brand flex items-center justify-center hover:bg-brand-hover transition-colors flex-shrink-0"
          >
            {timerRunning
              ? <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            }
          </button>
          <span className="text-2xl font-bold text-gray-800 w-9 text-center tabular-nums">{fmt(seconds)}</span>
          <span className="text-sm text-gray-400 w-6">сек</span>
        </div>

        {completedPomodoros > 0 && (
          <span className="text-xs text-gray-400">🍅 {completedPomodoros}</span>
        )}
      </div>
    </>
  )
}

// ── Page root — manages session lifecycle and timer ───────────────────────────

export default function RoomPage() {
  const navigate = useNavigate()

  const [session, setSession] = useState(null)  // { sessionId, roomId, livekitToken, livekitUrl, startedAt }
  const [error,   setError]   = useState('')

  const duration   = getPomodoroSec()
  const [timeLeft,           setTimeLeft]           = useState(duration)
  const [timerRunning,       setTimerRunning]       = useState(true)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const sessionEndedRef = useRef(false)

  // ── Start session on mount ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    startSession()
      .then((data) => { if (!cancelled) setSession(data) })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message ?? 'Не вдалося розпочати сесію') })
    return () => { cancelled = true }
  }, [])

  // ── End session on unmount / tab close ─────────────────────────────────────
  useEffect(() => {
    const end = () => {
      if (session?.sessionId && !sessionEndedRef.current) {
        sessionEndedRef.current = true
        endSession(session.sessionId, { pomodoroCount: completedPomodoros }).catch(() => {})
      }
    }
    window.addEventListener('beforeunload', end)
    return () => { window.removeEventListener('beforeunload', end); end() }
  }, [session?.sessionId, completedPomodoros])

  // ── Pomodoro countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerRunning || timeLeft === 0) return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setCompletedPomodoros((c) => c + 1); return duration }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timerRunning, timeLeft, duration])

  const handleLeave = async () => {
    if (sessionEndedRef.current) return
    sessionEndedRef.current = true
    if (session?.sessionId) {
      try { await endSession(session.sessionId, { pomodoroCount: completedPomodoros }) }
      catch { /* best-effort */ }
    }
    navigate('/home')
  }

  // ── Loading / error screens ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-500 mb-4 text-sm">{error}</p>
          <button onClick={() => navigate('/home')} className="text-brand hover:underline text-sm">← Назад</button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Підключення до кімнати...</p>
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <LiveKitRoom
        token={session.livekitToken}
        serverUrl={session.livekitUrl}
        connect={!!(session.livekitToken && session.livekitUrl)}
        video={true}
        audio={false}
        className="flex-1 flex flex-col min-h-0"
      >
        <RoomContent
          onLeave={handleLeave}
          timerRunning={timerRunning}
          timeLeft={timeLeft}
          completedPomodoros={completedPomodoros}
          onToggleTimer={() => setTimerRunning((v) => !v)}
        />
      </LiveKitRoom>
    </div>
  )
}
