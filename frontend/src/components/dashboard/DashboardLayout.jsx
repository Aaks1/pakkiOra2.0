import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../brand/BrandLogo'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout({ title, subtitle, children, role = 'patient' }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <Container className="dashboard-page__header-inner">
          <BrandLogo variant="compact" />
          <nav className="dashboard-page__nav" aria-label="Dashboard navigation">
            <Link to="/" className="dashboard-page__nav-link">Landing</Link>
            {role === 'admin' ? (
              <Link to="/admin" className="dashboard-page__nav-link dashboard-page__nav-link--active">Admin</Link>
            ) : (
              <Link to="/patient" className="dashboard-page__nav-link dashboard-page__nav-link--active">Patient</Link>
            )}
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </nav>
        </Container>
      </header>

      <main className="dashboard-page__main">
        <Container>
          <header className="dashboard-page__title-wrap">
            <h1 className="dashboard-page__title">{title}</h1>
            <p className="dashboard-page__subtitle">{subtitle}</p>
          </header>
          {children}
        </Container>
      </main>
    </div>
  )
}
