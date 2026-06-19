import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import LoginForm from './LoginForm'

export default function Login() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to PakkiOra"
      description="Sign in as a patient or admin to access your dashboard."
      alternateLink={<Link to="/register">Register</Link>}
    >
      <LoginForm />
    </AuthLayout>
  )
}
