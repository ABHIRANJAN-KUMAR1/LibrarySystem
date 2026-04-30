import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ClockIcon, CheckCircleIcon, XCircleIcon,
  DocumentTextIcon, ArrowDownTrayIcon, UsersIcon
} from '@heroicons/react/24/outline'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import ResourceCard from '../components/ResourceCard'
import toast from 'react-hot-toast'

const StatCard = ({ icon: Icon, label, value, color, to }) => {
  const inner = (
    <div className="card p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0, downloads: 0 })
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pendRes, allRes] = await Promise.all([
        api.get('/admin/resources/pending/'),
        api.get('/admin/resources/'),
      ])
      const all = allRes.data.results || []
      const pendList = pendRes.data.results || []
      setPending(pendList.slice(0, 4))
      const downloads = all.reduce((s, r) => s + r.download_count, 0)
      setStats({
        pending: all.filter(r => r.status === 'PENDING').length,
        approved: all.filter(r => r.status === 'APPROVED').length,
        rejected: all.filter(r => r.status === 'REJECTED').length,
        total: allRes.data.count || all.length,
        downloads,
      })
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/resources/${id}/approve/`)
      toast.success('Resource approved! ✅')
      fetchData()
    } catch { toast.error('Failed to approve.') }
  }

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/resources/${id}/reject/`)
      toast.success('Resource rejected.')
      fetchData()
    } catch { toast.error('Failed to reject.') }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-wide">Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and review educational resources across the platform.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={DocumentTextIcon} label="Total Resources" value={stats.total} color="text-primary-600 bg-primary-50 dark:bg-primary-900/20" to="/admin/resources" />
          <StatCard icon={ClockIcon} label="Pending" value={stats.pending} color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" to="/admin/pending" />
          <StatCard icon={CheckCircleIcon} label="Approved" value={stats.approved} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
          <StatCard icon={XCircleIcon} label="Rejected" value={stats.rejected} color="text-red-600 bg-red-50 dark:bg-red-900/20" />
          <StatCard icon={ArrowDownTrayIcon} label="Downloads" value={stats.downloads} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/admin/pending" className="card p-6 flex items-center gap-4 hover:border-amber-400 dark:hover:border-amber-600 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-white">Review Pending</p>
                {stats.pending > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">{stats.pending}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approve or reject submitted resources</p>
            </div>
          </Link>
          <Link to="/admin/resources" className="card p-6 flex items-center gap-4 hover:border-primary-400 dark:hover:border-primary-600 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">All Resources</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all resources</p>
            </div>
          </Link>
        </div>

        {/* Recent pending */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Pending Submissions</h2>
              <Link to="/admin/pending" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-gray-100 dark:bg-dark-700" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pending.map(r => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    showActions
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onAction={fetchData}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
