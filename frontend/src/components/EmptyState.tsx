import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = 'edit_note',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-xl text-center">
      <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-md shadow-sm">
        <span
          className="material-symbols-outlined text-outline"
          style={{ fontSize: '40px' }}
        >
          {icon}
        </span>
      </div>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">
        {title}
      </h2>
      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-sm">{action}</div>}
    </div>
  );
}
