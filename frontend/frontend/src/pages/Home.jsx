import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AcademicCapIcon, BookOpenIcon, ArrowRightIcon,
  ArrowDownTrayIcon, FireIcon
} from '@heroicons/react/24/outline'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import DarkModeToggle from '../components/DarkModeToggle'
import ResourceCard from '../components/ResourceCard'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
)

export default function Home() {
  const { user } = useAuth()
  const [topDownloads, setTopDownloads] = useState([])
  const [stats, setStats] = useState({ total: 0, categories: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const [topRes, allRes] = await Promise.all([
          api.get('/resources/top-downloads/'),
          api.get('/resources/?page_size=100'),
        ])
        const items = topRes.data
        const all = allRes.data.results || []
        setTopDownloads(items.slice(0, 6))
        const totalDownloads = all.reduce((s, r) => s + r.download_count, 0)
        const categories = new Set(all.map(r => r.category)).size
        setStats({ total: allRes.data.count || all.length, categories, downloads: totalDownloads })
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-600">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <AcademicCapIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">DERL</span>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            {!user ? (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            ) : (
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard →</Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 dark:from-dark-900 dark:via-dark-800 dark:to-primary-900 py-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Open Educational Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Discover & Share<br />
            <span className="bg-gradient-to-r from-primary-300 to-indigo-300 bg-clip-text text-transparent">
              Educational Resources
            </span>
          </h1>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Upload books, notes, research papers, and more. Every resource is reviewed by admins before going live.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={user ? '/browse' : '/register'} className="btn-primary text-base px-6 py-3 shadow-xl shadow-primary-900/30">
              <BookOpenIcon className="h-5 w-5" />
              {user ? 'Browse Resources' : 'Start for Free'}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            {user && (
              <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 text-base border border-white/20">
                Upload a Resource
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      {user && (
        <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={BookOpenIcon} label="Approved Resources" value={stats.total} color="text-primary-600 bg-primary-50 dark:bg-primary-900/20" />
            <StatCard icon={AcademicCapIcon} label="Categories" value={stats.categories} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
            <StatCard icon={ArrowDownTrayIcon} label="Total Downloads" value={stats.downloads} color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
          </div>
        </section>
      )}

      {/* Top Downloads */}
      {user && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-6">
            <FireIcon className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Downloads</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-5 h-48 animate-pulse bg-gray-100 dark:bg-dark-700" />
              ))}
            </div>
          ) : topDownloads.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-12">No resources yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topDownloads.map(r => <ResourceCard key={r.id} resource={r} />)}
            </div>
          )}
        </section>
      )}

      {/* CTA for guests */}
      {!user && (
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to explore?</p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join DERL today and access hundreds of educational resources uploaded by fellow learners.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Create Free Account <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  )
}
