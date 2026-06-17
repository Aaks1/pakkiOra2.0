export default function Select({
  label,
  id,
  hint,
  required,
  className = '',
  wrapperClassName = '',
  children,
  ...props
}) {
  const fieldId = id || props.name

  return (
    <div className={`form-field ${wrapperClassName}`.trim()}>
      {label && (
        <label htmlFor={fieldId} className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      <select id={fieldId} className={`form-field__input form-field__select ${className}`.trim()} required={required} {...props}>
        {children}
      </select>
      {hint && <p className="form-field__hint">{hint}</p>}
    </div>
  )
}
