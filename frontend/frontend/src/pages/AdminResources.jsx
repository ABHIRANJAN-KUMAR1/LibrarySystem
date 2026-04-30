import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, TrashIcon } from '@heroicons/react/24/outline'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import ResourceCard from '../components/ResourceCard'

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', page)
      const { data } = await api.get(`/admin/resources/?${params}`)
      setResources(data.results || [])
      setTotalCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / 10))
    } catch { setResources([]) }
    finally { setLoading(false) }
  }, [search, statusFilter, page])

  useEffect(() => {
    const timer = setTimeout(fetchAll, 300)
    return () => clearTimeout(timer)
  }, [fetchAll])

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/resources/${id}/approve/`)
      toast.success('Resource approved! ✅')
      fetchAll()
    } catch { toast.error('Failed to approve.') }
  }

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/resources/${id}/reject/`)
      toast.success('Resource rejected.')
      fetchAll()
    } catch { toast.error('Failed to reject.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this resource?')) return
    try {
      await api.delete(`/resources/${id}/`)
      toast.success('Resource deleted.')
      fetchAll()
    } catch { toast.error('Failed to delete.') }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Resources</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{totalCount} resources total</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-56">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" placeholder="Search resources..."
              className="input-field pl-9" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              id="admin-search"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              className="input-field pl-9 pr-8 appearance-none"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              id="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-gray-100 dark:bg-dark-700" />)}
          </div>
        ) : resources.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="text-gray-500 dark:text-gray-400">No resources found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(r => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  showActions
                  onApprove={r.status !== 'APPROVED' ? handleApprove : undefined}
                  onReject={r.status !== 'REJECTED' ? handleReject : undefined}
                  onDelete={handleDelete}
                  onAction={fetchAll}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 disabled:opacity-40">← Prev</button>
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
