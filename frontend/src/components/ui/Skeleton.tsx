/**
 * Skeleton loaders — placeholders animados.
 *
 * Tres variantes para los patrones mas comunes:
 * - SkeletonBox: bloque rectangular
 * - SkeletonTable: filas de una tabla
 * - SkeletonCards: grid de cards
 */
import type { HTMLAttributes } from 'react';

interface SkeletonBoxProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function SkeletonBox({
  width = '100%',
  height = 16,
  className = '',
  style,
  ...rest
}: SkeletonBoxProps): React.ReactElement {
  return (
    <div
      className={`bg-elevated rounded-md animate-pulse ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...rest}
    />
  );
}

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 pb-2 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} width="100%" height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 py-1.5">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox key={c} width="100%" height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonCardsProps {
  count?: number;
  cols?: number;
}

export function SkeletonCards({ count = 3, cols = 3 }: SkeletonCardsProps): React.ReactElement {
  const colClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3';
  return (
    <div className={`grid ${colClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <SkeletonBox width="60%" height={16} />
          <SkeletonBox width="100%" height={48} />
          <SkeletonBox width="40%" height={12} />
        </div>
      ))}
    </div>
  );
}
