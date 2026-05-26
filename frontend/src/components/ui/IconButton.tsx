/** IconButton — boton cuadrado para iconos solo. */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'border';
}

const SIZE = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' } as const;
const VARIANT = {
  ghost: 'hover:bg-elevated',
  border: 'border border-border hover:bg-elevated',
} as const;

export function IconButton({
  children,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...rest
}: IconButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center rounded-lg transition disabled:opacity-50',
        SIZE[size],
        VARIANT[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
