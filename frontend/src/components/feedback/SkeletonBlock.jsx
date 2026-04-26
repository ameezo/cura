import './SkeletonBlock.css';

export default function SkeletonBlock({ lines = 3, avatar = false, className = '' }) {
  return (
    <div className={`skeleton-block ${className}`}>
      {avatar && <div className="skeleton-avatar" />}
      <div className="skeleton-lines">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-line"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    </div>
  );
}
