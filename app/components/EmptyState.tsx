interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

