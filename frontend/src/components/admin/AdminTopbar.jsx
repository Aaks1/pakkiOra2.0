import { Bell, Menu } from 'lucide-react'

export default function AdminTopbar({ onMenuOpen, dateLabel }) {
  return (
    <>
      <header className="admin-topbar admin-topbar--mobile lg:hidden">
        <button
          type="button"
          onClick={onMenuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="admin-topbar__title flex-1 text-center">Admin Console</p>
        <Bell className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />
      </header>

      <header className="admin-topbar hidden lg:flex">
        <div className="admin-topbar__status">
          <span className="admin-live-dot" aria-hidden="true" />
          System operational
        </div>
        <p className="admin-topbar__date">{dateLabel}</p>
      </header>
    </>
  )
}
