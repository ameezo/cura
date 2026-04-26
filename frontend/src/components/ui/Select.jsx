import './Select.css';

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  id,
  name,
  icon,
  className = '',
  ...props
}) {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`select-group ${error ? 'select-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <div className="select-wrapper">
        {icon && <span className="select-icon material-symbols-rounded">{icon}</span>}
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`select-field ${icon ? 'has-icon' : ''}`}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <span className="select-arrow material-symbols-rounded">expand_more</span>
      </div>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
}
