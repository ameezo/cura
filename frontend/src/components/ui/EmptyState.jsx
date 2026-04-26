import './EmptyState.css';

export default function EmptyState({ icon = 'inbox', title, message, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">
        <span className="material-symbols-rounded">{icon}</span>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
