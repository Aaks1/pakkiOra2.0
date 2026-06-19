import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
  formId,
  onSubmit,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  const body = (
    <>
      <div className="admin-modal-header">
        <h2 id="admin-modal-title" className="admin-modal-title">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {formId ? (
        <form id={formId} onSubmit={onSubmit} className="admin-modal-form">
          <div className="admin-modal-body">{children}</div>
          {footer ? <div className="admin-modal-footer">{footer}</div> : null}
        </form>
      ) : (
        <>
          <div className="admin-modal-body">{children}</div>
          {footer ? <div className="admin-modal-footer">{footer}</div> : null}
        </>
      )}
    </>
  )

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="admin-modal-overlay">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            className={`admin-modal-panel ${maxWidth}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {body}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
