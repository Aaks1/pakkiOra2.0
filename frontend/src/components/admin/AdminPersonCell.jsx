import ProfileAvatar from '../ui/ProfileAvatar'

export default function AdminPersonCell({ name, subtitle, initials }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProfileAvatar initials={initials} size="sm" />
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{name}</p>
        {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  )
}
