'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4 float">{icon}</div>
      <h3 className="text-xl font-display font-semibold text-susu-cream mb-2 text-center">
        {title}
      </h3>
      <p className="text-susu-cream/60 text-center mb-6 max-w-xs">
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
