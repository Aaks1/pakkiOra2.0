import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import RegisterForm from './RegisterForm'

export default function Register() {
  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your PakkiOra account"
      description="Register as a patient to book appointments with trusted doctors."
      alternateLink={<Link to="/login">Sign in</Link>}
    >
      <RegisterForm />
    </AuthLayout>
  )
}
