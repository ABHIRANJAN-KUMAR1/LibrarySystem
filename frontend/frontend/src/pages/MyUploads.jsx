import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import ResourceCard from '../components/ResourceCard'

export default function MyUploads() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const fetchUploads = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/resources/my-uploads/')
      setUploads(data.results || data)
    } catch { setUploads([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUploads() }, [])

  const filtered = filter === 'ALL' ? uploads : uploads.filter(r => r.status === filter)

  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Uploads</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{uploads.length} total uploads</p>
          </div>
          <Link to="/upload" className="btn-primary">
            <CloudArrowUpIcon className="h-4 w-4" />
            Upload New
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-dark-700 rounded-xl w-fit mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${filter === t.key
                  ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              {t.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                ${filter === t.key ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400' : 'bg-gray-200 dark:bg-dark-600 text-gray-500 dark:text-gray-400'}`}>
                {t.key === 'ALL' ? uploads.length : uploads.filter(r => r.status === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-gray-100 dark:bg-dark-700" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No {filter.toLowerCase()} uploads.</p>
            <Link to="/upload" className="btn-primary mt-4 inline-flex">Upload your first resource</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(r => <ResourceCard key={r.id} resource={r} onAction={fetchUploads} />)}
          </div>
        )}
      </main>
    </div>
  )
}
