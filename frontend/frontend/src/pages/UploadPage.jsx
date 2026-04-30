import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloudArrowUpIcon, DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'

const CATEGORIES = [
  { value: 'books', label: '📚 Books' },
  { value: 'notes', label: '📝 Notes' },
  { value: 'videos', label: '🎥 Videos' },
  { value: 'papers', label: '📄 Research Papers' },
  { value: 'slides', label: '📊 Slides / Presentations' },
  { value: 'other', label: '📦 Other' },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: 'other' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (f) => {
    if (!f) return
    if (f.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50 MB.')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Please select a file to upload.'); return }
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('category', form.category)
    formData.append('file', file)

    try {
      await api.post('/resources/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / (e.total || 1)))
        }
      })
      toast.success('Resource uploaded! Awaiting admin approval. 🎉')
      navigate('/my-uploads')
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(', ')
        : 'Upload failed. Please try again.'
      toast.error(msg)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Resource</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your resource will be reviewed by an admin before going public.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="title">
                Resource Title <span className="text-red-500">*</span>
              </label>
              <input id="title" name="title" type="text" required maxLength={255} className="input-field" placeholder="e.g. Introduction to Algorithms — 3rd Edition" value={form.title} onChange={handleChange} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="description">Description</label>
              <textarea id="description" name="description" rows={4} className="input-field resize-none" placeholder="Describe what this resource covers..." value={form.description} onChange={handleChange} />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="category">Category</label>
              <select id="category" name="category" className="input-field" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* File drop zone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                File <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">(max 50 MB)</span>
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
                  ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-dark-500 hover:border-primary-400 dark:hover:border-primary-600'}
                  ${file ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-400' : ''}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input id="file-input" type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <DocumentArrowUpIcon className="h-8 w-8 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">{file.name}</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Drag & drop your file here</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">or <span className="text-primary-600 dark:text-primary-400 font-semibold">click to browse</span></p>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {uploading && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                  <span className="font-semibold text-primary-600">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <span className="text-amber-500 text-lg mt-0.5">⏳</span>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                After upload, your resource will be marked as <strong>Pending</strong>. An admin must approve it before it's visible to other users.
              </p>
            </div>

            <button id="upload-submit" type="submit" disabled={uploading} className="btn-primary w-full justify-center py-3 text-base">
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Submit for Review
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
