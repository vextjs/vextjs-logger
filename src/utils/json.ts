const RESERVED = new Set(["level", "time", "msg"]);
const SIMPLE_STRING_PATTERN = /^[\u0020-\u0021\u0023-\u005b\u005d-\u007e]*$/;
const SHAPE_CACHE_LIMIT = 128;
const shapeCache = new Map<string, readonly ShapeEntry[]>();

interface ShapeEntry {
  key: string;
  quotedKey: string;
}

export function quote(value: string): string {
  return SIMPLE_STRING_PATTERN.test(value) ? `"${value}"` : JSON.stringify(value);
}

export function appendKeyValue(target: string[], key: string, value: unknown): void {
  if (RESERVED.has(key) || value === undefined) {
    return;
  }

  const serialized = serializeValue(value);
  if (serialized !== undefined) {
    target.push(",", quote(key), ":", serialized);
  }
}

export function appendRecord(target: string[], record: Record<string, unknown> | undefined): void {
  if (!record) {
    return;
  }

  for (const key of Object.keys(record)) {
    appendKeyValue(target, key, record[key]);
  }
}

export function appendKeyValueString(line: string, key: string, value: unknown): string {
  if (RESERVED.has(key) || value === undefined) {
    return line;
  }

  const serialized = serializeValue(value);
  if (serialized === undefined) {
    return line;
  }

  return `${line},${quote(key)}:${serialized}`;
}

export function appendRecordString(line: string, record: Record<string, unknown> | undefined): string {
  if (!record) {
    return line;
  }

  let next = line;
  for (const entry of getShape(record)) {
    const value = record[entry.key];
    if (value === undefined) {
      continue;
    }

    const serialized = serializeValue(value);
    if (serialized !== undefined) {
      next += `,${entry.quotedKey}:${serialized}`;
    }
  }
  return next;
}

export function serializeValue(value: unknown): string | undefined {
  switch (typeof value) {
    case "string":
      return quote(value);
    case "number":
      return Number.isFinite(value) ? String(value) : "null";
    case "boolean":
      return value ? "true" : "false";
    case "bigint":
      return quote(value.toString());
    case "undefined":
    case "function":
    case "symbol":
      return undefined;
    case "object":
      if (value === null) {
        return "null";
      }
      if (value instanceof Date) {
        return quote(value.toISOString());
      }
      if (value instanceof Error) {
        return serializeError(value);
      }
      return serializeObject(value, new WeakSet<object>());
  }
}

export function serializeError(error: Error): string {
  const target = ["{\"type\":", quote(error.constructor.name), ",\"message\":", quote(error.message)];

  if (error.name) {
    target.push(",\"name\":", quote(error.name));
  }
  if (error.stack) {
    target.push(",\"stack\":", quote(error.stack));
  }

  target.push("}");
  return target.join("");
}

function serializeObject(value: object, seen: WeakSet<object>): string {
  if (seen.has(value)) {
    return quote("[Circular]");
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return serializeArray(value, seen);
  }

  let line = "{";
  let needsComma = false;
  const record = value as Record<string, unknown>;

  for (const entry of getShape(record)) {
    const serialized = serializeNestedValue(record[entry.key], seen, false);
    if (serialized !== undefined) {
      if (needsComma) {
        line += ",";
      }
      line += `${entry.quotedKey}:${serialized}`;
      needsComma = true;
    }
  }

  return `${line}}`;
}

function serializeArray(values: unknown[], seen: WeakSet<object>): string {
  let line = "[";
  for (let index = 0; index < values.length; index += 1) {
    if (index > 0) {
      line += ",";
    }
    line += serializeNestedValue(values[index], seen, true) ?? "null";
  }
  return `${line}]`;
}

function serializeNestedValue(
  value: unknown,
  seen: WeakSet<object>,
  inArray: boolean
): string | undefined {
  switch (typeof value) {
    case "string":
      return quote(value);
    case "number":
      return Number.isFinite(value) ? String(value) : "null";
    case "boolean":
      return value ? "true" : "false";
    case "bigint":
      return quote(value.toString());
    case "undefined":
    case "function":
    case "symbol":
      return inArray ? "null" : undefined;
    case "object":
      if (value === null) {
        return "null";
      }
      if (value instanceof Date) {
        return quote(value.toISOString());
      }
      if (value instanceof Error) {
        return serializeError(value);
      }
      return serializeObject(value, seen);
  }
}

function getShape(record: Record<string, unknown>): readonly ShapeEntry[] {
  const keys = Object.keys(record);
  const cacheKey = keys.join("\u001f");
  const cached = shapeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const entries = keys
    .filter((key) => !RESERVED.has(key))
    .map((key) => ({
      key,
      quotedKey: quote(key)
    }));

  if (shapeCache.size >= SHAPE_CACHE_LIMIT) {
    shapeCache.clear();
  }
  shapeCache.set(cacheKey, entries);
  return entries;
}
