import DashboardLayout from '../../components/dashboard/DashboardLayout'

const STATS = [
  { label: 'Total patients', value: '1,284' },
  { label: 'Appointments today', value: '42' },
  { label: 'Active doctors', value: '26' },
  { label: 'Pending approvals', value: '7' },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="Monitor clinic operations and manage platform activity."
    >
      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--span">
          <h2 className="dashboard-card__title">Overview</h2>
          <div className="dashboard-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="dashboard-stat">
                <p className="dashboard-stat__value">{stat.value}</p>
                <p className="dashboard-stat__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <h2 className="dashboard-card__title">Admin shortcuts</h2>
          <div className="dashboard-actions">
            <a href="/#features" className="dashboard-chip">Manage services</a>
            <a href="/#about" className="dashboard-chip">View platform trust metrics</a>
            <a href="/#how-it-works" className="dashboard-chip">Review patient flow</a>
          </div>
        </article>
      </section>
    </DashboardLayout>
  )
}
