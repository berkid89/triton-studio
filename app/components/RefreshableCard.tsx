import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { ReactNode } from "react";

interface RefreshableCardProps {
  title: string;
  description: string;
  onRefresh: () => void;
  loading: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function RefreshableCard({
  title,
  description,
  onRefresh,
  loading,
  disabled = false,
  children,
}: RefreshableCardProps) {
  return (
    <div className="bg-[#121212] rounded-lg shadow-sm border border-[#2a2a2a] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading || disabled}
          className="ml-4"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {children}
    </div>
  );
}

