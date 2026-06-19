import ProfileAvatar from '../ui/ProfileAvatar'
import { doctorInitials } from '../../utils/patientFormat'

export default function DoctorAvatar({ doctor, size = 'md', className = '' }) {
  return (
    <ProfileAvatar
      photoUrl={doctor?.photo_url}
      initials={doctorInitials(doctor)}
      size={size}
      className={className}
    />
  )
}
