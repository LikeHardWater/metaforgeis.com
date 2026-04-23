'use client'

import { useState, useRef, useTransition } from 'react'
import { Paperclip, Upload, X, Loader2, FileText, Image as ImageIcon, File } from 'lucide-react'

type AttachmentRecord = {
  id: string
  filename: string
  mimeType: string | null
  sizeBytes: number | null
  createdAt: Date
  uploadedBy: { name: string | null }
}

interface Props {
  entityType: string
  entityId: string
  attachments: AttachmentRecord[]
}

function FileIcon({ mimeType }: { mimeType: string | null }) {
  if (mimeType?.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-500" aria-hidden="true" />
  if (mimeType === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" aria-hidden="true" />
  return <File className="w-4 h-4 text-slate-400" aria-hidden="true" />
}

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function AttachmentSection({ entityType, entityId, attachments: initial }: Props) {
  const [attachments, setAttachments] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    const form = new FormData()
    form.append('file', file)
    form.append('entityType', entityType)
    form.append('entityId', entityId)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return }
      setAttachments((prev) => [
        ...prev,
        { id: data.id, filename: data.filename, mimeType: file.type, sizeBytes: file.size, createdAt: new Date(), uploadedBy: { name: 'You' } },
      ])
    } catch {
      setError('Upload failed. Check your AWS credentials.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      try {
        await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
        setAttachments((prev) => prev.filter((a) => a.id !== id))
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" /> Attachments ({attachments.length})
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-dark font-medium transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading…' : 'Upload File'}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
        />
      </div>

      {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

      {attachments.length === 0 && !uploading && (
        <p className="text-gray-500 text-sm">No attachments yet.</p>
      )}

      <div className="space-y-2">
        {attachments.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <FileIcon mimeType={a.mimeType} />
            <div className="flex-1 min-w-0">
              <a
                href={`/api/attachments/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-900 hover:text-gold transition-colors truncate block"
              >
                {a.filename}
              </a>
              <p className="text-xs text-gray-500">
                {formatBytes(a.sizeBytes)}{a.uploadedBy.name ? ` · ${a.uploadedBy.name}` : ''} · {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(a.id)}
              disabled={deletingId === a.id}
              className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {deletingId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
