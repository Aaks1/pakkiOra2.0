import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../api/axios'
import { buildRegisterPayload } from './registerSteps'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import StepProgress from '../ui/StepProgress'
import {
  REGISTER_STEPS,
  BLOOD_GROUPS,
  INITIAL_FORM,
  validateStep,
} from './registerSteps'

function StepPanel({ title, description, children }) {
  return (
    <div className="auth-step">
      <header className="auth-step__header">
        <h3 className="auth-step__title">{title}</h3>
        {description && <p className="auth-step__description">{description}</p>}
      </header>
      {children}
    </div>
  )
}

export default function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const isLastStep = step === REGISTER_STEPS.length - 1

  const goNext = () => {
    const msg = validateStep(step, form)
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    setStep((s) => Math.min(s + 1, REGISTER_STEPS.length - 1))
  }

  const goBack = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const msg = validateStep(step, form)
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(buildRegisterPayload(form))
      navigate('/patient/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-panel auth-panel--register">
      <header className="auth-panel__header">
        <h2 className="auth-panel__title">Create your account</h2>
        <p className="auth-panel__subtitle">
          Step {step + 1} of {REGISTER_STEPS.length} — patient registration
        </p>
      </header>

      <div className="auth-panel__progress">
        <StepProgress steps={REGISTER_STEPS} currentStep={step} />
      </div>

      <Alert message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="auth-panel__form" noValidate>
        {step === 0 && (
          <StepPanel
            title="Personal information"
            description="Required fields for your patient profile."
          >
            <div className="form-grid">
              <Input
                label="Username"
                name="username"
                autoComplete="username"
                required
                hint="At least 3 characters. Used to sign in."
                value={form.username}
                onChange={set('username')}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
              />
              <Input
                label="First name"
                name="first_name"
                autoComplete="given-name"
                required
                value={form.first_name}
                onChange={set('first_name')}
              />
              <Input
                label="Last name"
                name="last_name"
                autoComplete="family-name"
                required
                value={form.last_name}
                onChange={set('last_name')}
              />
            </div>
          </StepPanel>
        )}

        {step === 1 && (
          <StepPanel
            title="Contact details"
            description="Optional — helps your care team reach you."
          >
            <div className="form-grid">
              <Input
                label="Phone number"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. +64 21 123 4567"
                value={form.phone}
                onChange={set('phone')}
              />
              <Input
                label="Date of birth"
                name="date_of_birth"
                type="date"
                autoComplete="bday"
                value={form.date_of_birth}
                onChange={set('date_of_birth')}
              />
            </div>
            <Textarea
              label="Address"
              name="address"
              rows={3}
              autoComplete="street-address"
              placeholder="Street, city, postcode"
              value={form.address}
              onChange={set('address')}
              wrapperClassName="form-grid--full"
            />
          </StepPanel>
        )}

        {step === 2 && (
          <StepPanel
            title="Medical information"
            description="Optional — share anything relevant to your care."
          >
            <Select
              label="Blood group"
              name="blood_group"
              value={form.blood_group}
              onChange={set('blood_group')}
              wrapperClassName="form-grid--half"
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
            <Textarea
              label="Allergies"
              name="allergies"
              rows={2}
              hint="Known allergies or medication sensitivities"
              value={form.allergies}
              onChange={set('allergies')}
              wrapperClassName="form-grid--full"
            />
            <Textarea
              label="Medical conditions"
              name="medical_conditions"
              rows={2}
              hint="Chronic conditions, surgeries, or ongoing treatments"
              value={form.medical_conditions}
              onChange={set('medical_conditions')}
              wrapperClassName="form-grid--full"
            />
          </StepPanel>
        )}

        {step === 3 && (
          <StepPanel
            title="Secure your account"
            description="Choose a password with at least 8 characters."
          >
            <div className="form-grid">
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                hint="Minimum 8 characters"
                value={form.password}
                onChange={set('password')}
              />
              <Input
                label="Confirm password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirm_password}
                onChange={set('confirm_password')}
              />
            </div>
          </StepPanel>
        )}

        <div className="auth-panel__actions">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={goBack}>
              Back
            </Button>
          ) : (
            <Link to="/login" className="auth-panel__link">Already have an account?</Link>
          )}

          {isLastStep ? (
            <Button type="submit" variant="primary" loading={loading} className="btn--lg">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={goNext} className="btn--lg">
              Continue
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
