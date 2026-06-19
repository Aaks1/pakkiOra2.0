import { Cloudinary } from '@cloudinary/url-gen'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset)

function getClient() {
  if (!cloudName) return null
  return new Cloudinary({ cloud: { cloudName } })
}

export function extractPublicId(url) {
  if (!url || !cloudName || !url.includes(`res.cloudinary.com/${cloudName}`)) return null
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/)
  return match?.[1] || null
}

const SIZE_PX = { sm: 72, md: 80, lg: 96, xl: 128, '2xl': 160 }

export function getAvatarImage(photoUrl, size = 'md') {
  const client = getClient()
  const publicId = extractPublicId(photoUrl)
  if (!client || !publicId) return null

  const px = SIZE_PX[size] || SIZE_PX.md
  return client
    .image(publicId)
    .format('auto')
    .quality('auto')
    .resize(fill().width(px).height(px).gravity(autoGravity()))
}

export async function uploadToCloudinary(file) {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.')
  }
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', uploadPreset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed.')
  }
  return data.secure_url
}
