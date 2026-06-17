import DashboardLayout from '../../components/dashboard/DashboardLayout'

const UPCOMING = [
  { doctor: 'Dr. Sarah Lee', specialty: 'Cardiology', date: '2026-06-22', time: '10:30 AM' },
  { doctor: 'Dr. Priya Nair', specialty: 'Dermatology', date: '2026-06-29', time: '02:00 PM' },
]

export default function PatientDashboard() {
  return (
    <DashboardLayout
      role="patient"
      title="Patient Dashboard"
      subtitle="Track appointments and manage your care in one place."
    >
      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2 className="dashboard-card__title">Upcoming appointments</h2>
          <ul className="dashboard-list">
            {UPCOMING.map((item) => (
              <li key={`${item.doctor}-${item.date}`} className="dashboard-list__item">
                <p className="dashboard-list__primary">{item.doctor}</p>
                <p className="dashboard-list__secondary">{item.specialty}</p>
                <p className="dashboard-list__meta">{item.date} at {item.time}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-card">
          <h2 className="dashboard-card__title">Quick actions</h2>
          <div className="dashboard-actions">
            <a href="/#services" className="dashboard-chip">Book new appointment</a>
            <a href="/#features" className="dashboard-chip">View telehealth options</a>
            <a href="/#how-it-works" className="dashboard-chip">How booking works</a>
          </div>
        </article>
      </section>
    </DashboardLayout>
  )
}
