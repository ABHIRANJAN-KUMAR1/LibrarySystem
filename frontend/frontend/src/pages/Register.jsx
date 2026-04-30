import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AcademicCapIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import DarkModeToggle from '../components/DarkModeToggle'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', password2: '', role: 'user'
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('Passwords do not match.')
      return
    }
    const result = await register(form)
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-primary-700 to-primary-800 relative overflow-hidden items-center justify-center">
        <div className="absolute top-10 left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="relative text-center text-white px-12">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <AcademicCapIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-3">Join DERL</h2>
          <p className="text-white/70 text-lg max-w-xs mx-auto">
            Create your account and start sharing & discovering educational resources.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            {['Upload Resources', 'Admin Approval', 'Browse Library', 'Track Downloads'].map(f => (
              <div key={f} className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                ✓ {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-dark-900 overflow-y-auto">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join the DERL community</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="reg-username">Username</label>
              <input id="reg-username" name="username" type="text" required className="input-field" placeholder="Choose a username" value={form.username} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="reg-email">Email</label>
              <input id="reg-email" name="email" type="email" required className="input-field" placeholder="your@email.com" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="reg-role">Account Type</label>
              <select id="reg-role" name="role" className="input-field" value={form.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} required minLength={8} className="input-field pr-10" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPw ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Must contain 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="reg-password2">Confirm Password</label>
              <input id="reg-password2" name="password2" type={showPw ? 'text' : 'password'} required className="input-field" placeholder="Repeat password" value={form.password2} onChange={handleChange} />
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
