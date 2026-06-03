import type { LogSink } from "../types";

export function createNoopSink(): LogSink {
  return {
    write(): void {}
  };
}

