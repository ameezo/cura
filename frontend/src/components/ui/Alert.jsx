import './Alert.css';

const ICONS = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

export default function Alert({ variant = 'info', title, children, onClose, className = '' }) {
  return (
    <div className={`alert alert-${variant} ${className}`}>
      <span className="alert-icon material-symbols-rounded">{ICONS[variant]}</span>
      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        <p className="alert-message">{children}</p>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Dismiss">
          <span className="material-symbols-rounded">close</span>
        </button>
      )}
    </div>
  );
}
