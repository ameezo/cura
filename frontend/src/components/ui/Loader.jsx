import './Loader.css';

export function Spinner({ size = 'md', className = '' }) {
  return <div className={`spinner spinner-${size} ${className}`} />;
}

export function Skeleton({ width, height = '20px', rounded = false, className = '' }) {
  return (
    <div
      className={`skeleton ${rounded ? 'skeleton-rounded' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}

export default function Loader({ text = 'Loading...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className="loader-content">
          <Spinner size="lg" />
          <p className="loader-text">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <Spinner />
      <span className="loader-text">{text}</span>
    </div>
  );
}
