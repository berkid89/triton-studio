import { db } from "~/db.server";

export type TritonServer = {
  id: number;
  name: string;
  url: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateTritonServerInput = {
  name: string;
  url: string;
};

export type UpdateTritonServerInput = {
  name?: string;
  url?: string;
};

// Create a new TritonServer
export function createTritonServer(input: CreateTritonServerInput): TritonServer {
  const stmt = db.prepare(`
    INSERT INTO triton_servers (name, url)
    VALUES (?, ?)
  `);
  
  const result = stmt.run(input.name, input.url);
  return getTritonServerById(result.lastInsertRowid as number)!;
}

// Get all TritonServers
export function getAllTritonServers(): TritonServer[] {
  const stmt = db.prepare(`
    SELECT id, name, url, created_at, updated_at
    FROM triton_servers
    ORDER BY created_at DESC
  `);
  
  return stmt.all() as TritonServer[];
}

// Get a TritonServer by ID
export function getTritonServerById(id: number): TritonServer | null {
  const stmt = db.prepare(`
    SELECT id, name, url, created_at, updated_at
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
  const values: (string | number)[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }

  if (input.url !== undefined) {
    updates.push("url = ?");
    values.push(input.url);
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
