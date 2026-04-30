import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import DarkModeToggle from '../components/DarkModeToggle'
import api from '../api/axios'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', captcha_answer: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [captcha, setCaptcha] = useState({ id: '', question: '' })
  const [captchaLoading, setCaptchaLoading] = useState(true)

  const fetchCaptcha = async () => {
    setCaptchaLoading(true)
    try {
      const { data } = await api.get('/captcha/')
      setCaptcha({ id: data.captcha_id, question: data.question })
      setForm(f => ({ ...f, captcha_answer: '' }))
    } catch {
      setError('Failed to load CAPTCHA. Please refresh.')
    } finally {
      setCaptchaLoading(false)
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.captcha_answer) {
      setError('Please answer the CAPTCHA.')
      return
    }
    const result = await login(form.username, form.password, captcha.id, parseInt(form.captcha_answer))
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } else {
      setError(result.error)
      fetchCaptcha() // Refresh captcha on failure
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 relative overflow-hidden items-center justify-center">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="relative text-center text-white px-12">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-3">Welcome Back!</h2>
          <p className="text-white/70 text-lg max-w-xs mx-auto">
            Sign in to access your digital educational resource library.
          </p>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-dark-900">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">to your DERL account</p>
            </div>
            <DarkModeToggle />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="input-field"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPw ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="captcha_answer">
                Security Check: {captchaLoading ? 'Loading...' : captcha.question}
              </label>
              <div className="flex gap-2">
                <input
                  id="captcha_answer"
                  name="captcha_answer"
                  type="number"
                  required
                  className="input-field flex-1"
                  placeholder="Enter answer"
                  value={form.captcha_answer}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                  title="Refresh CAPTCHA"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${captchaLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
