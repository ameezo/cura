import './Avatar.css';

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  const classes = ['avatar', `avatar-${size}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="avatar-img" />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
}
