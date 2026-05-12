const COLORS = ['#c0602a', '#a04b24', '#823d22', '#6b341f', '#d4783a', '#e09a58'];

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

export default function Avatar({ username, avatarUrl, size = 'md', className = '' }) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const color = stringToColor(username || 'U');

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: color }}
    >
      {(username || 'U')[0].toUpperCase()}
    </div>
  );
}
