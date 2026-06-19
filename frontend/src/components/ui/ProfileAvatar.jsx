import { useState } from 'react'
import { AdvancedImage } from '@cloudinary/react'
import { getAvatarImage } from '../../utils/cloudinary'

const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
}

export default function ProfileAvatar({ photoUrl, initials, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false)
  const sizeClass = SIZES[size] || SIZES.md
  const cldImg = !failed ? getAvatarImage(photoUrl, size) : null

  if (cldImg) {
    return (
      <AdvancedImage
        cldImg={cldImg}
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  if (photoUrl && !failed) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-medium text-slate-600 ${sizeClass} ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
