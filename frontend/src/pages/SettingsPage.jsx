import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useAuthStore } from '../store/authStore'
import { updateMe, changePassword, deleteAccount } from '../api/user'
import { logout as apiLogout } from '../api/auth'

const LS_POMODORO = 'hive-pomodoro-minutes'
const LS_BREAK    = 'hive-break-minutes'

const getLS = (key, fallback) => localStorage.getItem(key) ?? fallback

const INPUT = 'w-full px-3 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/50 transition'
const LABEL = 'block text-xs text-gray-500 mb-1.5'

// ── Shared modal shell ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Change password modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form,    setForm]    = useState({ current: '', next: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [errors,  setErrors]  = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!form.current) newErrors.current = 'Це поле є обов\'язковим'
    if (!form.next) newErrors.next = 'Це поле є обов\'язковим'
    if (!form.confirm) newErrors.confirm = 'Це поле є обов\'язковим'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return
    if (form.next !== form.confirm) { setError('Нові паролі не збігаються'); return }
    if (form.next.length < 8)       { setError('Новий пароль має бути не менше 8 символів'); return }
    setLoading(true)
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не вдалося змінити пароль')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Modal title="Змінити пароль" onClose={onClose}>
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-4">Пароль успішно змінено</p>
          <button onClick={onClose} className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors">
            Закрити
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Змінити пароль" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={LABEL}>Поточний пароль</label>
          <input type="password" className={INPUT}
            value={form.current} onChange={e => { setForm(f => ({ ...f, current: e.target.value })); setErrors(e => ({ ...e, current: '' })) }} />
          {errors.current && <p className="text-xs text-red-500 mt-1">{errors.current}</p>}
        </div>
        <div>
          <label className={LABEL}>Новий пароль</label>
          <input type="password" className={INPUT}
            value={form.next} onChange={e => { setForm(f => ({ ...f, next: e.target.value })); setErrors(e => ({ ...e, next: '' })) }} />
          {errors.next && <p className="text-xs text-red-500 mt-1">{errors.next}</p>}
        </div>
        <div>
          <label className={LABEL}>Підтвердіть новий пароль</label>
          <input type="password" className={INPUT}
            value={form.confirm} onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setErrors(e => ({ ...e, confirm: '' })) }} />
          {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Скасувати
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-60">
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Delete account modal ──────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, onDeleted }) {
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setError('')
    setLoading(true)
    try {
      await deleteAccount()
      onDeleted()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не вдалося видалити акаунт')
      setLoading(false)
    }
  }

  return (
    <Modal title="Видалити акаунт" onClose={onClose}>
      <div className="mb-5">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-700 font-medium mb-1">Ви впевнені?</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Всі ваші дані, сесії та бейджі будуть видалені назавжди. Цю дію не можна скасувати.
        </p>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Скасувати
        </button>
        <button type="button" onClick={handleDelete} disabled={loading}
          className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60">
          {loading ? 'Видалення...' : 'Видалити'}
        </button>
      </div>
    </Modal>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-semibold text-gray-800 mb-3">{title}</h2>
      <div className="bg-white rounded-2xl p-5 space-y-4">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, setUser, refreshToken, logout } = useAuthStore()

  const [name,  setName]  = useState(user?.name  ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  const [pomodoroMin, setPomodoroMin] = useState(() => getLS(LS_POMODORO, '25'))
  const [breakMin,    setBreakMin]    = useState(() => getLS(LS_BREAK,    '5'))

  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount,  setShowDeleteAccount]  = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const updated = await updateMe({ name, email })
      setUser(updated)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Не вдалося зберегти профіль')
      setLoading(false)
      return
    }
    localStorage.setItem(LS_POMODORO, pomodoroMin)
    localStorage.setItem(LS_BREAK,    breakMin)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

const handleDeleted = async () => {
  await apiLogout(refreshToken)
  logout()
  navigate('/')
}

  return (
    <AppLayout>
      <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">

        {/* Two-column top row (Video section removed) */}
        <div className="grid grid-cols-2 gap-5">

          <Section title="Профіль">
            <div>
              <label className={LABEL}>Ім'я</label>
              <input type="text" className={INPUT} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <input type="text" className={INPUT} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </Section>

          <Section title="Таймер Pomodoro">
            <div>
              <label className={LABEL}>Тривалість сесії (хв)</label>
              <input type="number" min="1" max="90" className={INPUT}
                value={pomodoroMin} onChange={e => setPomodoroMin(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Тривалість перерви (хв)</label>
              <input type="number" min="1" max="30" className={INPUT}
                value={breakMin} onChange={e => setBreakMin(e.target.value)} />
            </div>
          </Section>

        </div>

        {/* Account */}
        <section>
          <h2 className="font-semibold text-gray-800 mb-3">Акаунт</h2>
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-2.5 max-w-xs">
            <button type="button" onClick={() => setShowChangePassword(true)}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-left">
              Змінити пароль
            </button>
            <button type="button" onClick={() => setShowDeleteAccount(true)}
              className="px-4 py-2.5 bg-red-50 text-red-500 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors text-left">
              Видалити акаунт
            </button>
          </div>
        </section>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading}
          className={`px-8 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-60 ${
            saved ? 'bg-green-500 text-white' : 'bg-brand text-white hover:bg-brand-hover'
          }`}>
          {loading ? 'Збереження...' : saved ? '✓ Збережено' : 'Зберегти зміни'}
        </button>

      </form>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showDeleteAccount  && <DeleteAccountModal  onClose={() => setShowDeleteAccount(false)} onDeleted={handleDeleted} />}

    </AppLayout>
  )
}
