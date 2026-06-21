import { useQuery } from '@tanstack/react-query'
import AppLayout from '../components/layout/AppLayout'
import { getStats, getBadges } from '../api/user'
import { getSessionHistory } from '../api/session'
import { useAuthStore } from '../store/authStore'

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

const ACTIVITY_COLORS = [
  'bg-gray-100',
  'bg-orange-100',
  'bg-orange-200',
  'bg-orange-300',
  'bg-brand',
]

function getLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildActivityGrid(history = []) {
  const counts = {}
  history.forEach((s) => {
    if (!s.endedAt) return
    const date = new Date(s.startedAt)
    const key = getLocalDateKey(date)
    counts[key] = (counts[key] || 0) + 1
  })

  const today       = new Date()
  const dayOfWeek   = today.getDay()
  const sinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const start = new Date(today)
  start.setDate(today.getDate() - (4 * 7 + sinceMonday))
  start.setHours(0, 0, 0, 0)

  const grid = []
  for (let w = 0; w < 5; w++) {
    const row = []
    for (let d = 0; d < 7; d++) {
      const date  = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      const key   = getLocalDateKey(date)
      const count = counts[key] || 0
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4
      row.push(level)
    }
    grid.push(row)
  }
  return grid
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`rounded-xl p-3.5 flex items-center gap-3 ${accent ? 'bg-orange-50' : 'bg-gray-50'}`}>
      <span className="text-lg leading-none">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 leading-none mb-1">{label}</p>
        <p className={`text-sm font-bold ${accent ? 'text-orange-500' : 'text-gray-800'}`}>{value}</p>
      </div>
    </div>
  )
}

function BadgeCard({ badge }) {
  return (
    <div className={`relative rounded-xl border p-3.5 flex items-start gap-3 ${
      badge.earned ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50/80 opacity-55'
    }`}>
      <span className="text-2xl leading-none mt-0.5">{badge.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{badge.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{badge.description}</p>
      </div>
      {!badge.earned && <span className="absolute top-2 right-2.5 text-sm">🔒</span>}
    </div>
  )
}

export default function CabinetPage() {
  const user = useAuthStore((s) => s.user)

  const { data: stats,   isLoading: statsLoading   } = useQuery({ queryKey: ['stats'],   queryFn: getStats })
  const { data: history, isLoading: historyLoading } = useQuery({ queryKey: ['history'], queryFn: getSessionHistory })
  const { data: badges,  isLoading: badgesLoading  } = useQuery({ queryKey: ['badges'],  queryFn: getBadges })

  const activityGrid = buildActivityGrid(history ?? [])
  const totalHours   = stats ? Math.round(stats.totalMinutes / 60) : '—'
  const initials     = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0 flex flex-col gap-3">
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white text-xl font-bold select-none">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{user?.name ?? '—'}</p>
              <p className="text-xs text-gray-400 mt-0.5 break-all">{user?.email ?? '—'}</p>
            </div>
          </div>

          {statsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <StatCard icon="⏰"  label="Години роботи" value={totalHours} />
              <StatCard icon="🔥" label="Стрік"          value={`${stats?.streakCurrent ?? 0} днів`} accent />
              <StatCard icon="✅" label="Сесії"           value={stats?.totalSessions ?? 0} />
            </>
          )}
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">

          {/* Activity */}
          <section className="bg-white rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-gray-800 mb-4">Нещодавня активність</h2>
            {historyLoading ? (
              <div className="h-28 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                  {DAY_LABELS.map((d) => (
                    <span key={d} className="text-xs text-gray-400 text-center">{d}</span>
                  ))}
                </div>
                {activityGrid.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1.5 mb-1.5">
                    {week.map((level, di) => (
                      <div key={di} className={`aspect-square rounded-sm ${ACTIVITY_COLORS[level]}`} />
                    ))}
                  </div>
                ))}
              </>
            )}
          </section>

          {/* Badges */}
          <section className="bg-white rounded-2xl p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Бейджі</h2>
            {badgesLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(badges ?? []).map((b) => <BadgeCard key={b.key} badge={b} />)}
              </div>
            )}
          </section>

        </div>
      </div>
    </AppLayout>
  )
}
