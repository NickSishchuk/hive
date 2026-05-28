import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AppLayout from '../components/layout/AppLayout'
import { useAuthStore } from '../store/authStore'
import { getStats } from '../api/user'

// Read pomodoro settings from localStorage (set in SettingsPage)
const getPomodoroLabel = () => {
  const work  = localStorage.getItem('hive-pomodoro-minutes') ?? '25'
  const brk   = localStorage.getItem('hive-break-minutes')    ?? '5'
  return `${work} хв роботи / ${brk} хв перерви`
}

export default function HomePage() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats })

  const firstName    = user?.name?.split(' ')[0] ?? ''
  const todayHours   = stats ? (stats.todayMinutes / 60).toFixed(1) : '—'
  const streak       = stats?.streakCurrent ?? '—'
  const totalSessions = stats?.totalSessions ?? '—'

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Привіт, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">Готова до продуктивної роботи?</p>
        </div>

        {/* Start work card */}
        <div className="relative rounded-2xl bg-brand-light overflow-hidden mb-6 p-8">
          {/* Decorative circles */}
          <div className="absolute right-0 top-0 bottom-0 w-56 pointer-events-none">
            <div className="absolute w-48 h-48 rounded-full bg-brand/20 -right-10 -top-6" />
            <div className="absolute w-36 h-36 rounded-full bg-brand/25 right-10 bottom-2" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-xs">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Розпочати роботу</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Система автоматично підбере<br />кімнату та учасників
            </p>
            <button
              onClick={() => navigate('/room')}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-full font-semibold hover:bg-brand-hover transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Розпочати
            </button>
          </div>
        </div>

        {/* Online count */}
        {/* TODO: replace hardcoded value with GET /api/rooms/online-count once backend adds it */}
        <div className="flex items-center justify-center gap-2 mb-5 text-sm text-gray-600">
          <span className="font-semibold">Зараз працюють</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-gray-500">247 онлайн</span>
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <StatCard icon="⏱" label="Годин сьогодні" value={todayHours} />
          <StatCard icon="🔥" label="Стрік"          value={streak === '—' ? '—' : `${streak} днів`} accent />
          <StatCard icon="✅" label="Сесій всього"   value={totalSessions} />
        </div>

        {/* Pomodoro banner */}
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-xl border border-gray-100 hover:border-brand/30 transition-colors group"
        >
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
            </svg>
            Рекомендований режим: <span className="font-medium text-gray-800">{getPomodoroLabel()}</span>
          </div>
          <span className="text-sm text-brand font-medium group-hover:underline">Змінити →</span>
        </button>

      </div>
    </AppLayout>
  )
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`rounded-xl p-4 flex flex-col gap-1 ${accent ? 'bg-orange-50' : 'bg-white border border-gray-100'}`}>
      <span className="text-lg">{icon}</span>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-orange-500' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}
