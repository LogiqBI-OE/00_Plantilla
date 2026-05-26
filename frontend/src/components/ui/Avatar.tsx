/** Avatar — circulo con iniciales o imagen. */
interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || '?';
}

export function Avatar({ name = '', src, size = 'md' }: AvatarProps): React.ReactElement {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${SIZE[size]} rounded-full object-cover border border-border`}
      />
    );
  }
  return (
    <div
      className={`${SIZE[size]} rounded-full bg-accent/15 text-accent border border-accent/20 flex items-center justify-center font-semibold`}
    >
      {initials(name)}
    </div>
  );
}
