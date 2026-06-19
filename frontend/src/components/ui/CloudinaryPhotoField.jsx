import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import ProfileAvatar from './ProfileAvatar'
import { isCloudinaryConfigured, uploadToCloudinary } from '../../utils/cloudinary'

export default function CloudinaryPhotoField({
  label = 'Photo (optional)',
  value,
  onChange,
  initials = '?',
  size = 'lg',
  showLabel = true,
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

  const canUpload = isCloudinaryConfigured && !uploading

  return (
    <div className="inline-flex flex-col items-start gap-2">
      {showLabel ? <p className="text-sm font-medium text-slate-700">{label}</p> : null}
      <button
        type="button"
        onClick={() => canUpload && inputRef.current?.click()}
        disabled={!isCloudinaryConfigured || uploading}
        className="group relative shrink-0 rounded-full disabled:cursor-not-allowed"
        title={canUpload ? 'Upload photo' : uploading ? 'Uploading…' : 'Photo upload unavailable'}
        aria-label={canUpload ? 'Upload profile photo' : 'Profile photo'}
      >
        <ProfileAvatar photoUrl={value} initials={initials} size={size} />
        {canUpload ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/45 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        ) : null}
        {uploading ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80 text-xs font-medium text-slate-600">
            …
          </span>
        ) : null}
      </button>
      {!isCloudinaryConfigured ? (
        <p className="max-w-[12rem] text-xs text-slate-500">Set Cloudinary env vars to enable photo upload.</p>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  )
}
