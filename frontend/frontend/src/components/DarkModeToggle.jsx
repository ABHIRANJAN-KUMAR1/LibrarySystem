import { useTheme } from '../context/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function DarkModeToggle() {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      id="dark-mode-toggle"
      aria-label="Toggle dark mode"
      className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800"
      style={{ backgroundColor: dark ? '#4f46e5' : '#e5e7eb' }}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center
          ${dark ? 'translate-x-7' : 'translate-x-1'}`}
      >
        {dark
          ? <MoonIcon className="h-3.5 w-3.5 text-primary-600" />
          : <SunIcon className="h-3.5 w-3.5 text-yellow-500" />
        }
      </span>
    </button>
  )
}
