import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { login as apiLogin, register as apiRegister } from '../api/auth'

const INPUT = 'w-full px-3 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 placeholder:text-gray-400 transition'
const LABEL = 'block text-sm text-gray-600 mb-1.5'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, refreshToken } = useAuthStore()

  if (refreshToken) return <Navigate to="/home" replace />

  const [tab,     setTab]     = useState('login')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm,   setRegForm]   = useState({ email: '', name: '', password: '', confirm: '' })
  const [loginErrors, setLoginErrors] = useState({})
  const [regErrors, setRegErrors] = useState({})

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateLogin = () => {
    const errors = {}
    if (!loginForm.email) errors.email = 'Це поле є обов\'язковим'
    else if (!isValidEmail(loginForm.email)) errors.email = 'Будь ласка введіть коректну електронну пошту'
    if (!loginForm.password) errors.password = 'Це поле є обов\'язковим'
    setLoginErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegister = () => {
    const errors = {}
    if (!regForm.email) errors.email = 'Це поле є обов\'язковим'
    else if (!isValidEmail(regForm.email)) errors.email = 'Будь ласка введіть коректну електронну пошту'
    if (!regForm.name) errors.name = 'Це поле є обов\'язковим'
    if (!regForm.password) errors.password = 'Це поле є обов\'язковим'
    if (!regForm.confirm) errors.confirm = 'Це поле є обов\'язковим'
    if (regForm.password && regForm.confirm && regForm.password !== regForm.confirm) {
      errors.confirm = 'Паролі не збігаються'
    }
    setRegErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateLogin()) return
    setLoading(true)
    try {
      const data = await apiLogin(loginForm)
      login(data)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Невірний email або пароль')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateRegister()) return
    setLoading(true)
    try {
      const data = await apiRegister({ email: regForm.email, name: regForm.name, password: regForm.password })
      login(data)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Помилка реєстрації')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-5/12 bg-brand flex-col p-10">
        <span className="text-white text-xl font-bold tracking-tight">Hive</span>
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-white text-4xl font-extrabold leading-snug mb-4">
            Працюй разом.<br />Віртуально.
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Приєднуйся до кімнати і відчуй<br />ефект спільної присутності.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-xs">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-7">
            {[{ key: 'login', label: 'Вхід' }, { key: 'register', label: 'Реєстрація' }].map(({ key, label }) => (
              <button key={key} onClick={() => { setTab(key); setError('') }}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === key ? 'bg-brand text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-500">{error}</div>
          )}

          {tab === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Вхід</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={LABEL}>Email</label>
                  <input type="text" placeholder="your@email.com" className={INPUT}
                    value={loginForm.email} onChange={e => { setLoginForm(f => ({ ...f, email: e.target.value })); setLoginErrors(e => ({ ...e, email: '' })) }} />
                  {loginErrors.email && <p className="text-xs text-red-500 mt-1">{loginErrors.email}</p>}
                </div>
                <div>
                  <label className={LABEL}>Пароль</label>
                  <input type="password" className={INPUT}
                    value={loginForm.password} onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); setLoginErrors(e => ({ ...e, password: '' })) }} />
                  {loginErrors.password && <p className="text-xs text-red-500 mt-1">{loginErrors.password}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-hover transition-colors mt-1 disabled:opacity-60">
                  {loading ? 'Вхід...' : 'Увійти'}
                </button>
              </form>
              <p className="text-center mt-5 text-sm text-gray-500">
                Немає акаунту?{' '}
                <button onClick={() => { setTab('register'); setError('') }} className="text-brand hover:underline font-medium">Зареєструватись</button>
              </p>
            </>
          )}

          {tab === 'register' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Реєстрація</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className={LABEL}>Email</label>
                  <input type="text" placeholder="your@email.com" className={INPUT}
                    value={regForm.email} onChange={e => { setRegForm(f => ({ ...f, email: e.target.value })); setRegErrors(e => ({ ...e, email: '' })) }} />
                  {regErrors.email && <p className="text-xs text-red-500 mt-1">{regErrors.email}</p>}
                </div>
                <div>
                  <label className={LABEL}>Ваше ім'я</label>
                  <input type="text" placeholder="Your Name" className={INPUT}
                    value={regForm.name} onChange={e => { setRegForm(f => ({ ...f, name: e.target.value })); setRegErrors(e => ({ ...e, name: '' })) }} />
                  {regErrors.name && <p className="text-xs text-red-500 mt-1">{regErrors.name}</p>}
                </div>
                <div>
                  <label className={LABEL}>Пароль</label>
                  <input type="password" className={INPUT}
                    value={regForm.password} onChange={e => { setRegForm(f => ({ ...f, password: e.target.value })); setRegErrors(e => ({ ...e, password: '' })) }} />
                  {regErrors.password && <p className="text-xs text-red-500 mt-1">{regErrors.password}</p>}
                </div>
                <div>
                  <label className={LABEL}>Повторіть пароль</label>
                  <input type="password" className={INPUT}
                    value={regForm.confirm} onChange={e => { setRegForm(f => ({ ...f, confirm: e.target.value })); setRegErrors(e => ({ ...e, confirm: '' })) }} />
                  {regErrors.confirm && <p className="text-xs text-red-500 mt-1">{regErrors.confirm}</p>}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-hover transition-colors mt-1 disabled:opacity-60">
                  {loading ? 'Реєстрація...' : 'Зареєструвати акаунт'}
                </button>
              </form>
              <p className="text-center mt-5 text-sm text-gray-500">
                Вже маєте акаунт?{' '}
                <button onClick={() => { setTab('login'); setError('') }} className="text-brand hover:underline font-medium">Увійти</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
