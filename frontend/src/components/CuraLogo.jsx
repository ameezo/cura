/* Cura Logo — SVG inline component */

export default function CuraLogo({ size = 40, className = '' }) {
  return (
    <div className={`cura-logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle — caring gesture */}
        <circle cx="50" cy="50" r="46" stroke="url(#logoGradient)" strokeWidth="3" fill="none" opacity="0.3" />
        <circle cx="50" cy="50" r="38" fill="url(#logoGradient)" opacity="0.08" />

        {/* Medical cross */}
        <rect x="44" y="28" width="12" height="32" rx="4" fill="url(#logoGradient)" />
        <rect x="34" y="38" width="32" height="12" rx="4" fill="url(#logoGradient)" />

        {/* Heartbeat line */}
        <path
          d="M20 68 L35 68 L40 58 L46 78 L52 62 L56 72 L60 68 L80 68"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Caring hands — subtle arc */}
        <path
          d="M18 45 Q18 20 50 14"
          stroke="#93A3FA"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M82 45 Q82 20 50 14"
          stroke="#93A3FA"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#69AAFA" />
            <stop offset="100%" stopColor="#93A3FA" />
          </linearGradient>
        </defs>
      </svg>
      <span
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: size * 0.6,
          background: 'linear-gradient(135deg, #69AAFA, #93A3FA)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}
      >
        Cura
      </span>
    </div>
  );
}
