import type { LogSink } from "../types";

export interface MemorySink extends LogSink {
  readonly lines: string[];
  clear(): void;
}

export function createMemorySink(): MemorySink {
  const lines: string[] = [];

  return {
    lines,
    write(line: string): void {
      lines.push(line);
    },
    clear(): void {
      lines.length = 0;
    }
  };
}

