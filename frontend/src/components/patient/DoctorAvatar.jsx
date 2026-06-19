import ProfileAvatar from '../ui/ProfileAvatar'
import { doctorInitials } from '../../utils/patientFormat'

export default function DoctorAvatar({ doctor, size = 'md', className = '' }) {
  return (
    <ProfileAvatar
      initials={doctorInitials(doctor)}
      size={size}
      className={className}
    />
  )
}
