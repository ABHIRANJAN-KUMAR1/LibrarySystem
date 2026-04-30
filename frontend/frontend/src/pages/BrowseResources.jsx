import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import ResourceCard from '../components/ResourceCard'

const CATEGORIES = ['', 'books', 'notes', 'videos', 'papers', 'slides', 'other']

export default function BrowseResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (category) params.set('category', category)
      params.set('page', page)
      const { data } = await api.get(`/resources/?${params}`)
      setResources(data.results || [])
      setTotalCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / 10))
    } catch { setResources([]) }
    finally { setLoading(false) }
  }, [search, category, page])

  useEffect(() => {
    const timer = setTimeout(fetchResources, 300)
    return () => clearTimeout(timer)
  }, [fetchResources])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Resources</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{totalCount} approved resources available</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-56">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              className="input-field pl-9"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              id="search-input"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              className="input-field pl-9 pr-8 appearance-none capitalize"
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1) }}
              id="category-filter"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c || 'All Categories'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-gray-100 dark:bg-dark-700" />)}
          </div>
        ) : resources.length === 0 ? (
          <div className="card p-16 text-center">
            <BookOpenIcon className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">No resources found.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(r => <ResourceCard key={r.id} resource={r} onAction={fetchResources} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 disabled:opacity-40">← Prev</button>
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
