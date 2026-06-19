import { motion } from 'framer-motion'

export default function AdminPageHeader({ title, subtitle, right }) {
  return (
    <motion.header
      className="admin-page-header"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div>
        <h1 className="admin-page-header__title">{title}</h1>
        {subtitle ? <p className="admin-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </motion.header>
  )
}
