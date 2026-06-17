import { Link } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import LoginForm from '../../components/auth/LoginForm'

export default function Login() {
  return (
    <AuthLayout
      eyebrow="Patient portal"
      title="Welcome back"
      description="Sign in to book appointments, view your schedule, and stay connected with your healthcare providers."
      alternateLink={
        <Link to="/register" className="auth-page__nav-link auth-page__nav-link--cta">
          Create account
        </Link>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
