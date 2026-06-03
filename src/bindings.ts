import type { LogRecord } from "./types";
import { appendRecord } from "./utils/json";

export function compileBindings(bindings: LogRecord | undefined): string {
  if (!bindings) {
    return "";
  }

  const target: string[] = [];
  appendRecord(target, bindings);
  return target.join("");
}

