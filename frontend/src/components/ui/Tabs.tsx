/** Tabs — navegacion horizontal simple controlada. */
import type { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ items, active, onChange, className = '' }: TabsProps): React.ReactElement {
  return (
    <div className={`flex items-center gap-1 border-b border-border ${className}`}>
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => !item.disabled && onChange(item.key)}
            disabled={item.disabled}
            className={[
              'px-3 py-2 text-sm font-medium border-b-2 transition -mb-px',
              isActive
                ? 'text-accent border-accent'
                : 'opacity-60 border-transparent hover:opacity-100',
              item.disabled ? 'cursor-not-allowed opacity-30' : '',
            ].join(' ')}
            aria-selected={isActive}
            role="tab"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
