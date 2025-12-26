import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";
import { TritonApiService } from "~/lib/triton-api.service";
import type { ModelInferenceInfo } from "~/types";
import type { TritonServer } from "~/lib/triton-server.server";
import type { ServerStatus } from "~/lib/utils";

interface InferenceFormProps {
  modelInferenceInfo: ModelInferenceInfo | null;
  server: TritonServer;
  serverStatus: ServerStatus;
  modelName: string;
  version: string;
}

export function InferenceForm({
  modelInferenceInfo,
  server,
  serverStatus,
  modelName,
  version,
}: InferenceFormProps) {
  const [inferenceInputs, setInferenceInputs] = useState<Record<string, string>>({});
  const [inferenceResult, setInferenceResult] = useState<any>(null);
  const [inferenceLoading, setInferenceLoading] = useState(false);
  const [inferenceError, setInferenceError] = useState<string | null>(null);

  // Initialize inference inputs when model inference info is loaded
  useEffect(() => {
    if (modelInferenceInfo && modelInferenceInfo.inputs) {
      const initialInputs: Record<string, string> = {};
      modelInferenceInfo.inputs.forEach((input) => {
        initialInputs[input.name] = "";
      });
      setInferenceInputs(initialInputs);
    }
  }, [modelInferenceInfo]);

  // Helper function to flatten nested arrays
  const flattenArray = (arr: any[]): any[] => {
    const result: any[] = [];
    for (const item of arr) {
      if (Array.isArray(item)) {
        result.push(...flattenArray(item));
      } else {
        result.push(item);
      }
    }
    return result;
  };

  const parseInputValue = (value: string, dataType: string): any[] => {
    if (!value.trim()) return [];

    // Handle BYTES type (base64 encoded strings)
    if (dataType === "BYTES") {
      // Convert string to base64
      try {
        const base64 = btoa(unescape(encodeURIComponent(value)));
        return [base64];
      } catch {
        // If already base64, use as is
        return [value];
      }
    }

    let parsed: any = null;

    // Try to parse as JSON array first
    try {
      parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // Flatten nested arrays and convert to proper types
        const flattened = flattenArray(parsed);
        if (dataType.startsWith("INT")) {
          return flattened.map((v) => parseInt(v, 10));
        } else if (dataType.startsWith("FP") || dataType === "FP64") {
          return flattened.map((v) => parseFloat(v));
        }
        return flattened;
      }
    } catch {
      // Not JSON, continue with other parsing
    }

    // Try to parse as comma-separated values
    if (value.includes(",")) {
      const values = value.split(",").map((v) => v.trim());
      if (dataType.startsWith("INT")) {
        return values.map((v) => parseInt(v, 10));
      } else if (dataType.startsWith("FP") || dataType === "FP64") {
        return values.map((v) => parseFloat(v));
      }
      return values;
    }

    // Single value
    if (dataType.startsWith("INT")) {
      return [parseInt(value, 10)];
    } else if (dataType.startsWith("FP") || dataType === "FP64") {
      return [parseFloat(value)];
    }

    return [value];
  };

  const handleInference = useCallback(async () => {
    if (!modelInferenceInfo || !server.http_url || serverStatus !== 'ready') {
      setInferenceError("Server must be ready to perform inference");
      return;
    }

    setInferenceLoading(true);
    setInferenceError(null);
    setInferenceResult(null);

    try {
      const apiService = new TritonApiService(server, true);
      
      // Build inputs array based on ModelInferenceInfo
      const inputs = modelInferenceInfo.inputs
        .filter((input) => {
          const value = inferenceInputs[input.name];
          // All inputs are required (ModelInferenceInfo doesn't have optional field)
          if (!value || !value.trim()) {
            throw new Error(`Input '${input.name}' is required`);
          }
          return true;
        })
        .map((input) => {
          const value = inferenceInputs[input.name];
          const data = parseInputValue(value, input.datatype);
          
          // Ensure data is always a flat array
          const flatData = Array.isArray(data) ? data : [data];
          
          // Calculate shape - handle dynamic dimensions (-1)
          let shape: number[] = [];
          if (input.shape && input.shape.length > 0) {
            shape = [...input.shape];
          } else {
            // No shape specified, infer from data
            shape = [flatData.length];
          }

          // Replace -1 with actual dimension based on data length
          if (shape.includes(-1)) {
            const totalElements = flatData.length;
            const knownDims = shape.filter((d) => d !== -1 && d > 0);
            
            if (knownDims.length > 0) {
              // Calculate product of known (fixed) dimensions
              const knownProduct = knownDims.reduce((a, b) => a * b, 1);
              if (knownProduct > 0 && totalElements % knownProduct === 0) {
                // Calculate dynamic dimension
                const dynamicDim = totalElements / knownProduct;
                shape = shape.map((d) => (d === -1 ? dynamicDim : d));
              } else {
                // If data doesn't divide evenly, use totalElements as first dim
                // This handles cases where shape might be simplified
                shape = shape.map((d, idx) => {
                  if (d === -1) {
                    // If it's the first dimension, use totalElements
                    // Otherwise, try to calculate
                    return idx === 0 ? totalElements : 1;
                  }
                  return d;
                });
              }
            } else {
              // All dimensions are -1 or 0, use data length as first dimension
              shape = shape.map((d, idx) => (d === -1 && idx === 0 ? totalElements : (d === -1 ? 1 : d)));
            }
          } else if (shape.length === 0) {
            // No shape specified, use data length
            shape = [flatData.length];
          }

          return {
            name: input.name,
            shape: shape,
            datatype: input.datatype,
            data: flatData,
          };
        });

      const requestBody = {
        inputs: inputs,
      };

      const result = await apiService.inference(modelName, version, requestBody);
      setInferenceResult(result);
    } catch (error) {
      console.error("Failed to perform inference:", error);
      setInferenceError(error instanceof Error ? error.message : "Failed to perform inference");
    } finally {
      setInferenceLoading(false);
    }
  }, [modelInferenceInfo, server, serverStatus, modelName, version, inferenceInputs]);

  if (!modelInferenceInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">
          Model inference information is required to perform inference.
        </p>
      </div>
    );
  }

  if (!modelInferenceInfo.inputs || modelInferenceInfo.inputs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">
          This model has no inputs defined.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {serverStatus !== 'ready' && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-400">
            Server is not ready. Inference requests may fail.
          </p>
        </div>
      )}
      
      {/* Inference Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleInference();
        }}
        className="space-y-4"
      >
        {modelInferenceInfo.inputs.map((input) => (
          <div key={input.name} className="space-y-2">
            <Label htmlFor={input.name} className="text-sm font-medium text-gray-300">
              {input.name}
              <span className="text-red-400 ml-1">*</span>
              <span className="text-xs text-gray-500 ml-2">
                ({input.datatype}
                {input.shape && input.shape.length > 0 && `, shape: [${input.shape.join(", ")}]`})
              </span>
            </Label>
            <textarea
              id={input.name}
              value={inferenceInputs[input.name] || ""}
              onChange={(e) =>
                setInferenceInputs({
                  ...inferenceInputs,
                  [input.name]: e.target.value,
                })
              }
              placeholder={
                input.datatype === "BYTES"
                  ? "Enter text (will be base64 encoded)"
                  : input.datatype.startsWith("INT") || input.datatype.startsWith("FP")
                  ? "Enter comma-separated numbers or JSON array, e.g., [1, 2, 3] or 1, 2, 3"
                  : "Enter value or JSON array"
              }
              className="flex min-h-[80px] w-full rounded-md border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76b900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              rows={3}
            />
          </div>
        ))}

        {inferenceError && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-md">
            <p className="text-sm text-red-400">{inferenceError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={inferenceLoading || serverStatus !== 'ready'}
          className="w-full"
        >
          {inferenceLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Inference...
            </>
          ) : (
            "Run Inference"
          )}
        </Button>
      </form>

      {/* Inference Results */}
      {inferenceResult && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Results</h3>
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
            <pre className="text-xs text-gray-300 overflow-x-auto font-mono">
              {JSON.stringify(inferenceResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

