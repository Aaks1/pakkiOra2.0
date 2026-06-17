import { Link } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import RegisterForm from '../../components/auth/RegisterForm'

export default function Register() {
  return (
    <AuthLayout
      eyebrow="Get started"
      title="Join Paki Ora"
      description="Create your free patient account to book visits, manage appointments, and access your care from one secure platform."
      alternateLink={
        <Link to="/login" className="auth-page__nav-link">
          Sign in
        </Link>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
