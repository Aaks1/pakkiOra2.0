import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../api/axios'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    if (submitted) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    if (!form.username.trim() && !form.password) {
      setError('Enter your username and password.')
      return
    }
    if (!form.username.trim()) {
      setError('Username is required.')
      return
    }
    if (!form.password) {
      setError('Password is required.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const sessionUser = await login(form.username.trim(), form.password)
      const isAdmin = sessionUser?.is_staff || sessionUser?.is_superuser || sessionUser?.role === 'admin'
      navigate(isAdmin ? '/admin/dashboard' : '/patient/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-panel">
      <header className="auth-panel__header">
        <h2 className="auth-panel__title">Sign in</h2>
        <p className="auth-panel__subtitle">
          Sign in with your username and password. Patients and admin staff use the same login.
        </p>
      </header>

      {submitted && error ? <Alert message={error} onClose={() => setError('')} /> : null}

      <form onSubmit={handleSubmit} className="auth-panel__form" noValidate>
        <Input
          label="Username"
          name="username"
          placeholder="Your username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange('username')}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange('password')}
        />

        <Button type="submit" variant="primary" loading={loading} className="auth-panel__submit btn--lg">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="auth-panel__footer">
        Don&apos;t have an account?{' '}
        <Link to="/register">Create one</Link>
      </p>
    </div>
  )
}
