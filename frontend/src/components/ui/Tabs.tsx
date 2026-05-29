/** Tabs — barra de navegacion horizontal (subrayado + icono opcional). */
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TabItem {
  key: string;
  label: ReactNode;
  icon?: LucideIcon;
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
    <div className={`flex items-center gap-1 border-b border-border overflow-x-auto overflow-y-hidden ${className}`}>
      {items.map((item) => {
        const isActive = item.key === active;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => !item.disabled && onChange(item.key)}
            disabled={item.disabled}
            className={[
              'inline-flex items-center gap-2 px-3.5 py-3 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap shrink-0',
              isActive
                ? 'text-accent border-accent'
                : 'opacity-60 border-transparent hover:opacity-100',
              item.disabled ? 'cursor-not-allowed opacity-30' : '',
            ].join(' ')}
            aria-selected={isActive}
            role="tab"
          >
            {Icon && <Icon size={16} strokeWidth={1.5} className="shrink-0" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
