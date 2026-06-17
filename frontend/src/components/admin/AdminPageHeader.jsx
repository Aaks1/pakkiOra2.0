export default function AdminPageHeader({ title, subtitle }) {
  return (
    <header className="admin-page-header">
      <h1 className="admin-page-header__title">{title}</h1>
      {subtitle ? <p className="admin-page-header__subtitle">{subtitle}</p> : null}
    </header>
  )
}
