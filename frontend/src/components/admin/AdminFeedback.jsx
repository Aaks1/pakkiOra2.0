import { motion, AnimatePresence } from 'framer-motion'

export function AdminError({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          className="admin-alert admin-alert--error"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}

export function AdminSuccess({ message }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.p
          className="admin-alert admin-alert--success"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}
