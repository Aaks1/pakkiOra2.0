export default function Alert({ message, onClose, type = 'error' }) {
  if (!message) return null

  return (
    <div className={`alert alert--${type}`} role="alert">
      <span className="alert__text">{message}</span>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  )
}
