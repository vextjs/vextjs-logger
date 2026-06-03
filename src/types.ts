export type LogLevelName =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal"
  | "silent";

export type TimestampMode = "epoch" | "iso" | "none";

export type LogRecord = Record<string, unknown>;

export interface LogSink {
  write(line: string): void;
  flush?(): void | Promise<void>;
  close?(): void | Promise<void>;
}

export interface LoggerOptions {
  level?: LogLevelName;
  name?: string;
  sink?: LogSink;
  timestamp?: TimestampMode;
  mixin?: () => LogRecord | void;
  contextProvider?: () => LogRecord | void;
}

export interface Logger {
  readonly level: LogLevelName;
  isLevelEnabled(level: LogLevelName): boolean;
  child(bindings: LogRecord): Logger;
  trace(message?: unknown, text?: string): void;
  debug(message?: unknown, text?: string): void;
  info(message?: unknown, text?: string): void;
  warn(message?: unknown, text?: string): void;
  error(message?: unknown, text?: string): void;
  fatal(message?: unknown, text?: string): void;
  flush(): Promise<void>;
  close(): Promise<void>;
}

export interface CompiledLoggerOptions {
  level: LogLevelName;
  levelValue: number;
  name?: string;
  sink: LogSink;
  timestamp: TimestampMode;
  mixin?: () => LogRecord | void;
  contextProvider?: () => LogRecord | void;
  bindings: string;
}

