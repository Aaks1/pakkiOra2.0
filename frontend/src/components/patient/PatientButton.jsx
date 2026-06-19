import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const TAP = {
  whileTap: { scale: 0.94 },
  whileHover: { scale: 1.02 },
  transition: { type: 'spring', stiffness: 520, damping: 26 },
}

function HitRipple({ show }) {
  if (!show) return null
  return (
    <motion.span
      className="patient-btn__hit"
      initial={{ opacity: 0.7, scale: 0.85 }}
      animate={{ opacity: 0, scale: 1.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      aria-hidden="true"
    />
  )
}

function useHitFlash() {
  const [hit, setHit] = useState(false)
  const flash = () => {
    setHit(true)
    window.setTimeout(() => setHit(false), 450)
  }
  return [hit, flash]
}

export function PatientFadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function PatientStagger({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function PatientStaggerItem({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}

export default function PatientButton({
  children,
  variant = 'primary',
  to,
  className = '',
  onClick,
  ...props
}) {
  const [hit, flash] = useHitFlash()
  const classes = `patient-btn patient-btn--${variant} ${className}`.trim()
  const wrapClass = className.includes('w-full') ? 'block w-full' : 'inline-flex'

  const handleClick = (e) => {
    flash()
    onClick?.(e)
  }

  if (to) {
    return (
      <motion.div {...TAP} className={wrapClass}>
        <Link to={to} className={classes} onClick={handleClick} {...props}>
          <HitRipple show={hit} />
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button type="button" className={classes} onClick={handleClick} {...TAP} {...props}>
      <HitRipple show={hit} />
      {children}
    </motion.button>
  )
}

export function PatientQuickLink({ to, icon: Icon, iconTone, children, onClick }) {
  const [hit, flash] = useHitFlash()

  return (
    <PatientStaggerItem>
      <motion.div {...TAP}>
        <Link
          to={to}
          className="patient-quick-card"
          onClick={(e) => {
            flash()
            onClick?.(e)
          }}
        >
          {hit ? (
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-blue-100/50"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              aria-hidden="true"
            />
          ) : null}
          <span className={`patient-quick-card__icon patient-quick-card__icon--${iconTone}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>{children}</span>
        </Link>
      </motion.div>
    </PatientStaggerItem>
  )
}
