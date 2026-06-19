import { Link } from 'react-router-dom'
import { usePatientUI } from '../../hooks/usePatientUI'

export default function PatientNotifications() {
  const { notifications, isRead, markRead, markAllRead, unreadCount } = usePatientUI()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {notifications.length > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Mark all read
          </button>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {notifications.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">No notifications yet.</p>
        ) : (
          notifications.map((n) => {
            const read = isRead(n.id)
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                className={`flex w-full gap-3 border-b border-slate-100 px-6 py-4 text-left last:border-b-0 hover:bg-slate-50 ${
                  read ? 'opacity-60' : ''
                }`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read ? 'bg-transparent' : 'bg-blue-600'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{n.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>
                </div>
              </button>
            )
          })
        )}
      </div>

      <Link to="/patient/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
        Back to dashboard
      </Link>
    </div>
  )
}
