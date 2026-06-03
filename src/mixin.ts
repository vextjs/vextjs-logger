import type { LogRecord } from "./types";

export type LoggerMixin = () => LogRecord | void;

export function createStaticMixin(values: LogRecord): LoggerMixin {
  return () => values;
}

