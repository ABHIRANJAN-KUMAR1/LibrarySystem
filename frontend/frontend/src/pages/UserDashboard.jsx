import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CloudArrowUpIcon, BookOpenIcon, ClockIcon,
  CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import ResourceCard from '../components/ResourceCard'

const StatCard = ({ icon: Icon, label, value, color, to }) => {
  const content = (
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
  return to ? <Link to={to}>{content}</Link> : content
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [myUploads, setMyUploads] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uploadsRes, approvedRes] = await Promise.all([
          api.get('/resources/my-uploads/'),
          api.get('/resources/'),
        ])
        setMyUploads(uploadsRes.data.results || uploadsRes.data)
        setApproved(approvedRes.data.results || [])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const counts = {
    total: myUploads.length,
    pending: myUploads.filter(r => r.status === 'PENDING').length,
    approved: myUploads.filter(r => r.status === 'APPROVED').length,
    rejected: myUploads.filter(r => r.status === 'REJECTED').length,
    downloads: myUploads.reduce((s, r) => s + r.download_count, 0),
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="text-primary-600">{user?.username}</span> 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your activity on DERL.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={CloudArrowUpIcon} label="My Uploads" value={counts.total} color="text-primary-600 bg-primary-50 dark:bg-primary-900/20" to="/my-uploads" />
          <StatCard icon={ClockIcon} label="Pending" value={counts.pending} color="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
          <StatCard icon={CheckCircleIcon} label="Approved" value={counts.approved} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
          <StatCard icon={ArrowDownTrayIcon} label="Downloads" value={counts.downloads} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/upload" className="card p-6 flex items-center gap-4 hover:border-primary-400 dark:hover:border-primary-500 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
              <CloudArrowUpIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Upload Resource</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Share a new educational resource</p>
            </div>
          </Link>
          <Link to="/browse" className="card p-6 flex items-center gap-4 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Browse Resources</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Discover approved resources</p>
            </div>
          </Link>
        </div>

        {/* Recent uploads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Recent Uploads</h2>
            <Link to="/my-uploads" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-gray-100 dark:bg-dark-700" />)}
            </div>
          ) : myUploads.length === 0 ? (
            <div className="card p-12 text-center">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No uploads yet.</p>
              <Link to="/upload" className="btn-primary mt-4 inline-flex">Upload your first resource</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myUploads.slice(0, 3).map(r => <ResourceCard key={r.id} resource={r} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
