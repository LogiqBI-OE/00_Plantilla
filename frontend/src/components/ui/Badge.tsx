/** Badge — chip pequeño para estados (info, warning, danger, neutral). */
import type { ReactNode } from 'react';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

const TONE: Record<Tone, string> = {
  neutral: 'bg-elevated text-text-primary',
  info: 'bg-info/15 text-info',
  success: 'bg-info/15 text-info',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  accent: 'bg-accent/15 text-accent',
};

export function Badge({ tone = 'neutral', children }: BadgeProps): React.ReactElement {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
