import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import ResourceCard from '../components/ResourceCard'

export default function PendingApprovals() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [actioning, setActioning] = useState(null)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/resources/pending/?page=${page}`)
      setResources(data.results || [])
      setTotalCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / 10))
    } catch { setResources([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPending() }, [page])

  const handleApprove = async (id) => {
    setActioning(id)
    try {
      await api.post(`/admin/resources/${id}/approve/`)
      toast.success('Resource approved! ✅')
      fetchPending()
    } catch { toast.error('Failed to approve.') }
    finally { setActioning(null) }
  }

  const handleReject = async (id) => {
    setActioning(id)
    try {
      await api.post(`/admin/resources/${id}/reject/`)
      toast.success('Resource rejected.')
      fetchPending()
    } catch { toast.error('Failed to reject.') }
    finally { setActioning(null) }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <ClockIcon className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
            {totalCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-sm font-bold">{totalCount}</span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and approve or reject pending resource submissions.</p>
        </div>

        {/* Info banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
          <CheckCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Approved resources become visible to all users immediately. Rejected resources are hidden but not deleted.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-60 animate-pulse bg-gray-100 dark:bg-dark-700" />)}
          </div>
        ) : resources.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircleIcon className="h-14 w-14 text-emerald-300 dark:text-emerald-700 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">All caught up! 🎉</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No pending resources at the moment.</p>
            <Link to="/admin/dashboard" className="btn-primary mt-4 inline-flex">Back to Dashboard</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(r => (
                <div key={r.id} className="flex flex-col gap-0">
                  <ResourceCard
                    resource={r}
                    showActions
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                  {/* Uploader info */}
                  <div className="card rounded-t-none border-t-0 px-5 py-3 bg-gray-50 dark:bg-dark-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Submitted by <span className="font-semibold text-gray-700 dark:text-gray-300">{r.uploaded_by?.username}</span>
                      {' · '}<span>{r.uploaded_by?.email}</span>
                    </p>
                  </div>
                </div>
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
