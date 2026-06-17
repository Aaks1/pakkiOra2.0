import SiteHeader from './SiteHeader'

export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
