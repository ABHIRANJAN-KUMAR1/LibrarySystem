import { useState } from 'react'
import {
  ArrowDownTrayIcon, DocumentTextIcon,
  VideoCameraIcon, BookOpenIcon, DocumentIcon,
  PresentationChartBarIcon, TagIcon
} from '@heroicons/react/24/outline'
import StatusBadge from './StatusBadge'
import api from '../api/axios'
import toast from 'react-hot-toast'

const categoryIcons = {
  books: BookOpenIcon,
  notes: DocumentTextIcon,
  videos: VideoCameraIcon,
  papers: DocumentIcon,
  slides: PresentationChartBarIcon,
  other: TagIcon,
}

const categoryColors = {
  books: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  notes: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  videos: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  papers: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  slides: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  other: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
}

export default function ResourceCard({ resource, onAction, showActions = false, onApprove, onReject, onDelete }) {
  const [downloading, setDownloading] = useState(false)
  const Icon = categoryIcons[resource.category] || TagIcon
  const colorCls = categoryColors[resource.category] || categoryColors.other

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { data } = await api.post(`/resources/download/${resource.id}/`)
      window.open(data.file_url, '_blank')
      toast.success('Download started!')
      if (onAction) onAction()
    } catch {
      toast.error('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="card p-5 animate-fade-in flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
          <Icon className="h-5 w-5" />
        </div>
        <StatusBadge status={resource.status} />
      </div>

      {/* Title & desc */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
          {resource.title}
        </h3>
        {resource.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {resource.description}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span className="capitalize px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 font-medium">
          {resource.category}
        </span>
        <span>By {resource.uploaded_by?.username || 'Unknown'}</span>
        <span>•</span>
        <span>{formatDate(resource.created_at)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-600 mt-auto">
        <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
          {resource.download_count} downloads
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {resource.status === 'APPROVED' && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary text-xs px-3 py-1.5 rounded-lg"
              id={`download-${resource.id}`}
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
              {downloading ? 'Opening...' : 'Download'}
            </button>
          )}
          {showActions && (
            <>
              {onApprove && (
                <button onClick={() => onApprove(resource.id)} className="btn-success text-xs px-3 py-1.5 rounded-lg">
                  Approve
                </button>
              )}
              {onReject && (
                <button onClick={() => onReject(resource.id)} className="btn-danger text-xs px-3 py-1.5 rounded-lg">
                  Reject
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(resource.id)} className="btn-danger text-xs px-3 py-1.5 rounded-lg">
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
