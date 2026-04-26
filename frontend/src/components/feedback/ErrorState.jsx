import Button from '../ui/Button';
import './ErrorState.css';

export default function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-state-icon">
        <span className="material-symbols-rounded">error_outline</span>
      </div>
      <h3 className="error-state-title">{title}</h3>
      {message && <p className="error-state-message">{message}</p>}
      {onRetry && (
        <Button variant="outline" icon="refresh" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
