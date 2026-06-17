export default function Input({
  label,
  id,
  hint,
  required,
  className = '',
  wrapperClassName = '',
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
      <input id={fieldId} className={`form-field__input ${className}`.trim()} required={required} {...props} />
      {hint && <p className="form-field__hint">{hint}</p>}
    </div>
  )
}
