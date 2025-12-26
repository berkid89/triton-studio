import { useState, useEffect, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Loader2, Plus, Minus } from "lucide-react";
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

type InputMode = "json" | "guided";

export function InferenceForm({
  modelInferenceInfo,
  server,
  serverStatus,
  modelName,
  version,
}: InferenceFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>("guided");
  const [inferenceInputs, setInferenceInputs] = useState<Record<string, string>>({});
  const [guidedInputs, setGuidedInputs] = useState<Record<string, any>>({});
  const [inferenceResult, setInferenceResult] = useState<any>(null);
  const [inferenceLoading, setInferenceLoading] = useState(false);
  const [inferenceError, setInferenceError] = useState<string | null>(null);

  // Initialize inference inputs when model inference info is loaded
  useEffect(() => {
    if (modelInferenceInfo && modelInferenceInfo.inputs) {
      const initialInputs: Record<string, string> = {};
      const initialGuidedInputs: Record<string, any> = {};
      modelInferenceInfo.inputs.forEach((input) => {
        initialInputs[input.name] = "";
        // Initialize guided inputs based on shape
        if (input.shape && input.shape.length > 0) {
          const totalElements = input.shape.reduce((a, b) => (a === -1 || b === -1 ? 1 : a * b), 1);
          if (totalElements > 0 && totalElements < 1000) {
            // Only initialize guided inputs for reasonable sizes
            if (input.shape.length === 1) {
              // 1D array
              initialGuidedInputs[input.name] = Array(input.shape[0] === -1 ? 1 : input.shape[0]).fill("");
            } else if (input.shape.length === 2) {
              // 2D array
              const rows = input.shape[0] === -1 ? 1 : input.shape[0];
              const cols = input.shape[1] === -1 ? 1 : input.shape[1];
              initialGuidedInputs[input.name] = Array(rows).fill(null).map(() => Array(cols).fill(""));
            } else {
              // Higher dimensions or dynamic - use empty string to fallback to JSON
              initialGuidedInputs[input.name] = "";
            }
          } else {
            initialGuidedInputs[input.name] = "";
          }
        } else {
          initialGuidedInputs[input.name] = "";
        }
      });
      setInferenceInputs(initialInputs);
      setGuidedInputs(initialGuidedInputs);
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

  // Convert guided input structure to flat array
  const convertGuidedInputToArray = (guidedValue: any, dataType: string): any[] => {
    if (typeof guidedValue === "string") {
      return parseInputValue(guidedValue, dataType);
    }
    
    if (Array.isArray(guidedValue)) {
      const flattened = flattenArray(guidedValue);
      if (dataType.startsWith("INT")) {
        return flattened.map((v) => {
          const num = typeof v === "string" ? parseInt(v, 10) : v;
          return isNaN(num) ? 0 : num;
        });
      } else if (dataType.startsWith("FP") || dataType === "FP64") {
        return flattened.map((v) => {
          const num = typeof v === "string" ? parseFloat(v) : v;
          return isNaN(num) ? 0 : num;
        });
      }
      return flattened;
    }
    
    return [];
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
          if (inputMode === "guided") {
            const guidedValue = guidedInputs[input.name];
            if (guidedValue === undefined || guidedValue === null || 
                (typeof guidedValue === "string" && !guidedValue.trim()) ||
                (Array.isArray(guidedValue) && guidedValue.length === 0)) {
              throw new Error(`Input '${input.name}' is required`);
            }
          } else {
            const value = inferenceInputs[input.name];
            if (!value || !value.trim()) {
              throw new Error(`Input '${input.name}' is required`);
            }
          }
          return true;
        })
        .map((input) => {
          let data: any[];
          if (inputMode === "guided") {
            const guidedValue = guidedInputs[input.name];
            data = convertGuidedInputToArray(guidedValue, input.datatype);
          } else {
            const value = inferenceInputs[input.name];
            data = parseInputValue(value, input.datatype);
          }
          
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
  }, [modelInferenceInfo, server, serverStatus, modelName, version, inferenceInputs, guidedInputs, inputMode]);

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

  // Render guided input field based on shape and type
  const renderGuidedInput = (input: { name: string; datatype: string; shape: number[] }) => {
    const guidedValue = guidedInputs[input.name];
    
    // If guided value is a string, it means we should fallback to JSON input
    if (typeof guidedValue === "string") {
      return (
        <textarea
          id={input.name}
          value={guidedValue}
          onChange={(e) =>
            setGuidedInputs({
              ...guidedInputs,
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
      );
    }

    // Handle BYTES type
    if (input.datatype === "BYTES") {
      return (
        <Input
          id={input.name}
          type="text"
          value={guidedValue || ""}
          onChange={(e) =>
            setGuidedInputs({
              ...guidedInputs,
              [input.name]: e.target.value,
            })
          }
          placeholder="Enter text (will be base64 encoded)"
          className="font-mono"
        />
      );
    }

    // Handle 1D arrays
    if (Array.isArray(guidedValue) && guidedValue.length > 0 && !Array.isArray(guidedValue[0])) {
      const isDynamic = input.shape.length === 0 || input.shape[0] === -1;
      
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            {guidedValue.map((_, index) => (
              <div key={index} className="space-y-1">
                <Label htmlFor={`${input.name}-${index}`} className="text-xs text-gray-500">
                  [{index}]
                </Label>
                <Input
                  id={`${input.name}-${index}`}
                  type={input.datatype.startsWith("INT") ? "number" : input.datatype.startsWith("FP") ? "number" : "text"}
                  step={input.datatype.startsWith("FP") ? "any" : undefined}
                  value={guidedValue[index] || ""}
                  onChange={(e) => {
                    const newValue = [...guidedValue];
                    newValue[index] = e.target.value;
                    setGuidedInputs({
                      ...guidedInputs,
                      [input.name]: newValue,
                    });
                  }}
                  className="font-mono text-sm"
                />
              </div>
            ))}
          </div>
          {isDynamic && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newValue = [...guidedValue, ""];
                  setGuidedInputs({
                    ...guidedInputs,
                    [input.name]: newValue,
                  });
                }}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Element
              </Button>
              {guidedValue.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newValue = guidedValue.slice(0, -1);
                    setGuidedInputs({
                      ...guidedInputs,
                      [input.name]: newValue,
                    });
                  }}
                  className="h-8"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  Remove Last
                </Button>
              )}
            </div>
          )}
        </div>
      );
    }

    // Handle 2D arrays
    if (Array.isArray(guidedValue) && guidedValue.length > 0 && Array.isArray(guidedValue[0])) {
      const isDynamicRows = input.shape.length === 0 || input.shape[0] === -1;
      const numCols = input.shape.length > 1 && input.shape[1] !== -1 ? input.shape[1] : (guidedValue[0]?.length || 1);
      
      return (
        <div className="space-y-3">
          {guidedValue.map((row, rowIndex) => (
            <div key={rowIndex} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-500">Row {rowIndex}</Label>
                {isDynamicRows && guidedValue.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newValue = guidedValue.filter((_: any, idx: number) => idx !== rowIndex);
                      setGuidedInputs({
                        ...guidedInputs,
                        [input.name]: newValue,
                      });
                    }}
                    className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {row.map((_: any, colIndex: number) => (
                  <Input
                    key={colIndex}
                    id={`${input.name}-${rowIndex}-${colIndex}`}
                    type={input.datatype.startsWith("INT") ? "number" : input.datatype.startsWith("FP") ? "number" : "text"}
                    step={input.datatype.startsWith("FP") ? "any" : undefined}
                    value={row[colIndex] || ""}
                    onChange={(e) => {
                      const newValue = guidedValue.map((r: any[], rIdx: number) => 
                        rIdx === rowIndex 
                          ? r.map((c: any, cIdx: number) => cIdx === colIndex ? e.target.value : c)
                          : r
                      );
                      setGuidedInputs({
                        ...guidedInputs,
                        [input.name]: newValue,
                      });
                    }}
                    className="font-mono text-sm"
                  />
                ))}
              </div>
            </div>
          ))}
          {isDynamicRows && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newRow = Array(numCols).fill("");
                  const newValue = [...guidedValue, newRow];
                  setGuidedInputs({
                    ...guidedInputs,
                    [input.name]: newValue,
                  });
                }}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Row
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Fallback to textarea
    return (
      <textarea
        id={input.name}
        value={typeof guidedValue === "string" ? guidedValue : ""}
        onChange={(e) =>
          setGuidedInputs({
            ...guidedInputs,
            [input.name]: e.target.value,
          })
        }
        placeholder="Enter JSON array or comma-separated values"
        className="flex min-h-[80px] w-full rounded-md border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76b900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50 font-mono"
        rows={3}
      />
    );
  };

  return (
    <div className="space-y-6">
      {serverStatus !== 'ready' && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-400">
            Server is not ready. Inference requests may fail.
          </p>
        </div>
      )}
      
      {/* Input Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Input Mode:</span>
          <div className="flex gap-1 bg-[#121212] p-1 rounded-md border border-[#2a2a2a]">
            <Button
              type="button"
              variant={inputMode === "guided" ? "default" : "ghost"}
              size="sm"
              onClick={() => setInputMode("guided")}
              className="h-7 px-3 text-xs"
            >
              Guided Form
            </Button>
            <Button
              type="button"
              variant={inputMode === "json" ? "default" : "ghost"}
              size="sm"
              onClick={() => setInputMode("json")}
              className="h-7 px-3 text-xs"
            >
              JSON
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {inputMode === "guided" 
            ? "Structured inputs based on model input shapes" 
            : "Free-form JSON input"}
        </p>
      </div>
      
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
            {inputMode === "guided" ? (
              renderGuidedInput(input)
            ) : (
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
            )}
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

