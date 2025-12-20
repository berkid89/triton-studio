import { db } from "~/db.server";

export type TritonServer = {
  id: number;
  name: string;
  grpc_inference_url?: string | null;
  http_url?: string | null;
  metrics_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateTritonServerInput = {
  name: string;
  grpc_inference_url?: string;
  http_url?: string;
  metrics_url?: string;
};

export type UpdateTritonServerInput = {
  name?: string;
  grpc_inference_url?: string;
  http_url?: string;
  metrics_url?: string;
};

// Create a new TritonServer
export function createTritonServer(input: CreateTritonServerInput): TritonServer {
  const stmt = db.prepare(`
    INSERT INTO triton_servers (name, grpc_inference_url, http_url, metrics_url)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    input.name,
    input.grpc_inference_url || null,
    input.http_url || null,
    input.metrics_url || null
  );
  return getTritonServerById(result.lastInsertRowid as number)!;
}

// Get all TritonServers
export function getAllTritonServers(): TritonServer[] {
  const stmt = db.prepare(`
    SELECT id, name, grpc_inference_url, http_url, metrics_url, created_at, updated_at
    FROM triton_servers
    ORDER BY created_at DESC
  `);
  
  return stmt.all() as TritonServer[];
}

// Get a TritonServer by ID
export function getTritonServerById(id: number): TritonServer | null {
  const stmt = db.prepare(`
    SELECT id, name, grpc_inference_url, http_url, metrics_url, created_at, updated_at
    FROM triton_servers
    WHERE id = ?
  `);
  
  return (stmt.get(id) as TritonServer | undefined) ?? null;
}

// Update a TritonServer
export function updateTritonServer(
  id: number,
  input: UpdateTritonServerInput
): TritonServer | null {
  const existing = getTritonServerById(id);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }

  if (input.grpc_inference_url !== undefined) {
    updates.push("grpc_inference_url = ?");
    values.push(input.grpc_inference_url || null);
  }

  if (input.http_url !== undefined) {
    updates.push("http_url = ?");
    values.push(input.http_url || null);
  }

  if (input.metrics_url !== undefined) {
    updates.push("metrics_url = ?");
    values.push(input.metrics_url || null);
  }

  if (updates.length === 0) {
    return existing;
  }

  values.push(id);
  const stmt = db.prepare(`
    UPDATE triton_servers
    SET ${updates.join(", ")}
    WHERE id = ?
  `);

  stmt.run(...values);
  return getTritonServerById(id);
}

// Delete a TritonServer
export function deleteTritonServer(id: number): boolean {
  const stmt = db.prepare(`
    DELETE FROM triton_servers
    WHERE id = ?
  `);
  
  const result = stmt.run(id);
  return result.changes > 0;
}
