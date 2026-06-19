import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import ProfileAvatar from './ProfileAvatar'
import { isCloudinaryConfigured, uploadToCloudinary } from '../../utils/cloudinary'

export default function CloudinaryPhotoField({
  label = 'Photo (optional)',
  value,
  onChange,
  initials = '?',
  inputClass = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm',
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const url = await uploadToCloudinary(file)
      onChange(url)
    } catch (err) {
      setError(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="flex items-center gap-4">
        <ProfileAvatar photoUrl={value} initials={initials} size="lg" />
        <div className="flex-1 space-y-2">
          {isCloudinaryConfigured ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-300 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {uploading ? 'Uploading…' : 'Upload image'}
            </button>
          ) : (
            <p className="text-xs text-slate-500">Paste a Cloudinary URL below, or set Cloudinary env vars to enable upload.</p>
          )}
          <input
            className={inputClass}
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
          />
        </div>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  )
}
