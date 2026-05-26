/** TextField — input con label + error opcional. */
import type { InputHTMLAttributes, ReactNode } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-3.5 py-2.5 text-base',
} as const;

export function TextField({
  label,
  error,
  hint,
  size = 'md',
  id,
  className = '',
  ...rest
}: TextFieldProps): React.ReactElement {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium opacity-80">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full rounded-lg bg-card border outline-none transition',
          error ? 'border-danger focus:ring-2 focus:ring-danger/30' : 'border-border focus:ring-2 focus:ring-accent/30 focus:border-accent',
          SIZE_CLASSES[size],
          className,
        ].join(' ')}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs opacity-60">{hint}</p>
      ) : null}
    </div>
  );
}
