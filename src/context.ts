import type { LogRecord } from "./types";

export type ContextProvider = () => LogRecord | void;

export function createStaticContextProvider(context: LogRecord): ContextProvider {
  return () => context;
}

