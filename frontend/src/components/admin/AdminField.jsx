export default function AdminField({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label ? <label className="admin-field-label">{label}</label> : null}
      {children}
    </div>
  )
}

export const inputClass = 'admin-field-input'