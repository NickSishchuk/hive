import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSession, endSession } from '../api/session'

const getPomodoroSec = () => {
  const val = parseInt(localStorage.getItem('hive-pomodoro-minutes') ?? '25', 10)
  return (isNaN(val) || val < 1 ? 25 : val) * 60
}

const TILE_GRADIENTS = [
  'from-violet-400 to-purple-500',
  'from-sky-400    to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400  to-orange-500',
  'from-rose-400   to-pink-500',
]

function PersonIcon() {
  return (
    <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  )
}

export default function RoomPage() {
  const navigate      = useNavigate()
  const localVideoRef = useRef(null)
  const streamRef     = useRef(null)

  const [sessionId,          setSessionId]          = useState(null)
  const [sessionError,       setSessionError]       = useState('')
  const [cameraOn,           setCameraOn]           = useState(true)
  const [duration,         ] = useState(getPomodoroSec)
  const [timeLeft,           setTimeLeft]           = useState(getPomodoroSec)
  const [timerRunning,       setTimerRunning]       = useState(true)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  const sessionEndedRef = useRef(false)

  // Start session on mount
  useEffect(() => {
    let cancelled = false
    startSession()
      .then((data) => { if (!cancelled) setSessionId(data.sessionId) })
      .catch((err) => { if (!cancelled) setSessionError(err.response?.data?.message ?? 'Не вдалося розпочати сесію') })
    return () => { cancelled = true }
  }, [])

  // Cleanup on tab close / unmount
  useEffect(() => {
    const cleanup = () => {
      if (sessionId && !sessionEndedRef.current) {
        sessionEndedRef.current = true
        endSession(sessionId, { pomodoroCount: completedPomodoros }).catch(() => {})
      }
    }
    window.addEventListener('beforeunload', cleanup)
    return () => { window.removeEventListener('beforeunload', cleanup); cleanup() }
  }, [sessionId, completedPomodoros])

  // Webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
    } catch { setCameraOn(false) }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (localVideoRef.current) localVideoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    if (cameraOn) startCamera()
    else          stopCamera()
    return () => stopCamera()
  }, [cameraOn, startCamera, stopCamera])

  // Pomodoro countdown
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

  const fmt     = (n) => String(n).padStart(2, '0')
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const handleLeave = async () => {
    if (sessionEndedRef.current) return
    sessionEndedRef.current = true
    stopCamera()
    if (sessionId) {
      try { await endSession(sessionId, { pomodoroCount: completedPomodoros }) }
      catch { /* best-effort */ }
    }
    navigate('/home')
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0">
        <span className="font-bold text-gray-900 tracking-tight">Hive</span>
        <span className="text-sm text-gray-400">
          {sessionError && <span className="text-red-400 text-xs">{sessionError}</span>}
        </span>
        <button onClick={handleLeave}
          className="px-4 py-1.5 text-sm text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          Вийти
        </button>
      </header>

      {/* Video grid */}
      <div className="flex-1 p-4 grid grid-cols-3 grid-rows-2 gap-3 min-h-0">
        <div className="relative rounded-2xl overflow-hidden bg-gray-900">
          <video ref={localVideoRef} autoPlay muted playsInline
            className={`w-full h-full object-cover ${cameraOn ? 'block' : 'hidden'}`} />
          {!cameraOn && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <PersonIcon />
              <span className="text-gray-400 text-xs">Камера вимкнена</span>
            </div>
          )}
        </div>
        {TILE_GRADIENTS.map((g, i) => (
          <div key={i} className={`rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center`}>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"><PersonIcon /></div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 border-t border-gray-100 px-6 py-3 flex items-center">

        {/* Camera toggle — no chevron */}
        <button
          onClick={() => setCameraOn((v) => !v)}
          title={cameraOn ? 'Вимкнути камеру' : 'Увімкнути камеру'}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            cameraOn ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-red-100 text-red-500 hover:bg-red-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {cameraOn
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 5.656M3 3l18 18M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2v-1" />
            }
          </svg>
        </button>

        {/* Pomodoro timer */}
        <div className="flex-1 flex items-center justify-center gap-3 select-none">
          <span className="text-sm text-gray-400 w-6 text-right">хв</span>
          <span className="text-2xl font-bold text-gray-800 w-9 text-center tabular-nums">{fmt(minutes)}</span>
          <button onClick={() => setTimerRunning((v) => !v)}
            className="w-8 h-8 rounded-full bg-brand flex items-center justify-center hover:bg-brand-hover transition-colors flex-shrink-0">
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
    </div>
  )
}
