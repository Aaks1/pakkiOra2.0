import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { isTomorrow, doctorName } from '../utils/patientFormat'
import { useAppointmentHistory } from '../hooks/usePatientQueries'
import { PatientUIContext } from './patientUIContext'

const READ_KEY = 'pakkiora_notifications_read'
const LAST_BOOKING_KEY = 'pakkiora_last_booking_id'

function loadReadIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveReadIds(set) {
  localStorage.setItem(READ_KEY, JSON.stringify([...set]))
}

function getLastBookingId() {
  try {
    return sessionStorage.getItem(LAST_BOOKING_KEY)
  } catch {
    return null
  }
}

function buildNotifications(history) {
  if (!history) return []
  const items = []
  const now = new Date().toISOString()
  const lastBookingId = getLastBookingId()

  ;(history.upcoming || []).forEach((appt) => {
    items.push({
      id: `upcoming-${appt.id}`,
      title: isTomorrow(appt.date) ? 'Appointment Tomorrow' : 'Upcoming Appointment',
      body: `${doctorName(appt.doctor)} · ${appt.date} at ${String(appt.start_time).slice(0, 5)}`,
      time: appt.created_at || now,
      type: 'upcoming',
    })
  })

  ;(history.cancelled || [])
    .slice()
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 10)
    .forEach((appt) => {
      items.push({
        id: `cancelled-${appt.id}`,
        title: 'Appointment Cancelled',
        body: `${doctorName(appt.doctor)} · ${appt.date} at ${String(appt.start_time).slice(0, 5)}`,
        time: appt.updated_at || appt.created_at || now,
        type: 'cancelled',
      })
    })

  const confirmedAppt = lastBookingId
    ? (history.upcoming || []).find((a) => String(a.id) === lastBookingId)
    : null

  if (confirmedAppt) {
    items.unshift({
      id: `confirmed-${confirmedAppt.id}`,
      title: 'Appointment Confirmed',
      body: `${doctorName(confirmedAppt.doctor)} · ${confirmedAppt.date} at ${String(confirmedAppt.start_time).slice(0, 5)}`,
      time: confirmedAppt.created_at || now,
      type: 'confirmed',
    })
  }

  items.sort((a, b) => new Date(b.time) - new Date(a.time))
  return items
}

export default function PatientUIProvider({ children }) {
  const queryClient = useQueryClient()
  const { data: history } = useAppointmentHistory()
  const [search, setSearch] = useState('')
  const [readIds, setReadIds] = useState(loadReadIds)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const notifications = useMemo(() => buildNotifications(history), [history])

  const refreshNotifications = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['appointmentHistory'] })
  }, [queryClient])

  const isRead = useCallback((id) => readIds.has(id), [readIds])

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev)
      notifications.forEach((n) => next.add(n.id))
      saveReadIds(next)
      return next
    })
  }, [notifications])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds],
  )

  const value = useMemo(() => ({
    search,
    setSearch,
    notifications,
    unreadCount,
    isRead,
    markRead,
    markAllRead,
    refreshNotifications,
    sidebarOpen,
    setSidebarOpen,
  }), [search, notifications, unreadCount, isRead, markRead, markAllRead, refreshNotifications, sidebarOpen])

  return <PatientUIContext.Provider value={value}>{children}</PatientUIContext.Provider>
}
