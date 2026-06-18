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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username.trim(), form.password)
      navigate(user?.is_staff || user?.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard')
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
          Use your username and password to access your patient account.
        </p>
      </header>

      <Alert message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="auth-panel__form" noValidate>
        <Input
          label="Username"
          name="username"
          placeholder="Your username"
          autoComplete="username"
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
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
