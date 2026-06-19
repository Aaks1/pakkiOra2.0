import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import { usePatientUI } from '../../hooks/usePatientUI'

export default function NotificationDropdown() {
  const { notifications, unreadCount, markRead, isRead } = usePatientUI()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="patient-icon-btn relative"
        whileTap={{ scale: 0.9 }}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-teal-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</p>
              ) : (
                notifications.map((n) => {
                  const read = isRead(n.id)
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                        read ? 'opacity-60' : ''
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          read ? 'bg-transparent' : 'bg-blue-600'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500">{n.body}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
            <Link
              to="/patient/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
