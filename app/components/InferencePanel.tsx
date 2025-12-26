import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { InferenceForm } from "./InferenceForm";
import type { ModelInferenceInfo } from "~/types";
import type { TritonServer } from "~/lib/triton-server.server";
import type { ServerStatus } from "~/lib/utils";

interface InferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  modelInferenceInfo: ModelInferenceInfo | null;
  server: TritonServer;
  serverStatus: ServerStatus;
  modelName: string;
  version: string;
}

export function InferencePanel({
  isOpen,
  onClose,
  modelInferenceInfo,
  server,
  serverStatus,
  modelName,
  version,
}: InferencePanelProps) {
  return (
    <>
      <div
        className={`fixed top-0 right-0 z-50 h-screen w-full max-w-[50vw] min-w-[320px] bg-[#121212] border-l border-[#2a2a2a] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
            <h2 className="text-xl font-semibold text-gray-100">Inference</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <InferenceForm
              modelInferenceInfo={modelInferenceInfo}
              server={server}
              serverStatus={serverStatus}
              modelName={modelName}
              version={version}
            />
          </div>
        </div>
      </div>

      {/* Overlay when panel is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}

