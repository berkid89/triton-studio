interface ErrorStateProps {
  message: string;
  hint?: string;
}

export function ErrorState({ message, hint }: ErrorStateProps) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-red-400">{message}</p>
      {hint && (
        <p className="mt-2 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

