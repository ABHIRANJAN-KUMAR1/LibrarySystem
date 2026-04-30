import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  HomeIcon, BookOpenIcon, CloudArrowUpIcon, ChartBarIcon,
  ClockIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
  AcademicCapIcon, MoonIcon, SunIcon
} from '@heroicons/react/24/outline'

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
      ${isActive
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 hover:text-gray-900 dark:hover:text-white'
      }`
    }
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    <span>{label}</span>
  </NavLink>
)

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userLinks = [
    { to: '/', icon: HomeIcon, label: 'Home' },
    { to: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { to: '/browse', icon: BookOpenIcon, label: 'Browse Resources' },
    { to: '/upload', icon: CloudArrowUpIcon, label: 'Upload Resource' },
    { to: '/my-uploads', icon: ClockIcon, label: 'My Uploads' },
  ]

  const adminLinks = [
    { to: '/', icon: HomeIcon, label: 'Home' },
    { to: '/admin/dashboard', icon: ChartBarIcon, label: 'Admin Dashboard' },
    { to: '/admin/pending', icon: ClockIcon, label: 'Pending Approvals' },
    { to: '/admin/resources', icon: BookOpenIcon, label: 'All Resources' },
  ]

  const links = isAdmin ? adminLinks : userLinks

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-600 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-dark-600">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <AcademicCapIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">DERL</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Resource Library</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-gray-50 dark:bg-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded
              ${isAdmin ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400' : 'bg-gray-200 text-gray-600 dark:bg-dark-500 dark:text-gray-400'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(link => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 dark:border-dark-600 space-y-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
        >
          {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
