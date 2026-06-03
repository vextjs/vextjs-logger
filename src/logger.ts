import { compileBindings } from "./bindings";
import { isLevelEnabled, LEVEL_VALUES, levelValue, normalizeLevel } from "./levels";
import { serializeLogLine } from "./serializer";
import { createStdoutSink } from "./sinks/stdout";
import type { CompiledLoggerOptions, Logger, LoggerOptions, LogLevelName, LogRecord } from "./types";

const METHODS: Exclude<LogLevelName, "silent">[] = ["trace", "debug", "info", "warn", "error", "fatal"];

class VextLogger implements Logger {
  readonly level: LogLevelName;
  private readonly options: CompiledLoggerOptions;
  private closed = false;

  constructor(options: CompiledLoggerOptions) {
    this.options = options;
    this.level = options.level;

    for (const method of METHODS) {
      this[method] =
        LEVEL_VALUES[method] < options.levelValue
          ? noop
          : (((message?: unknown, text?: string) => {
              if (!this.closed) {
                options.sink.write(serializeLogLine(options, method, message, text));
              }
            }) as Logger[typeof method]);
    }
  }

  trace(_message?: unknown, _text?: string): void {}
  debug(_message?: unknown, _text?: string): void {}
  info(_message?: unknown, _text?: string): void {}
  warn(_message?: unknown, _text?: string): void {}
  error(_message?: unknown, _text?: string): void {}
  fatal(_message?: unknown, _text?: string): void {}

  isLevelEnabled(level: LogLevelName): boolean {
    return isLevelEnabled(this.options.levelValue, level);
  }

  child(bindings: LogRecord): Logger {
    return new VextLogger({
      ...this.options,
      bindings: this.options.bindings + compileBindings(bindings)
    });
  }

  async flush(): Promise<void> {
    await this.options.sink.flush?.();
  }

  async close(): Promise<void> {
    if (this.closed) {
      return;
    }
    this.closed = true;
    await this.flush();
    await this.options.sink.close?.();
  }
}

function noop(): void {}

/**
 * Creates a JSON logger with zero runtime dependencies.
 *
 * The logger checks the configured level before touching serialization, so
 * disabled levels are designed to return quickly on hot paths.
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  const level = normalizeLevel(options.level);
  const compiled: CompiledLoggerOptions = {
    level,
    levelValue: levelValue(level),
    sink: options.sink ?? createStdoutSink(),
    timestamp: options.timestamp ?? "epoch",
    bindings: ""
  };

  if (options.name !== undefined) {
    compiled.name = options.name;
  }
  if (options.mixin !== undefined) {
    compiled.mixin = options.mixin;
  }
  if (options.contextProvider !== undefined) {
    compiled.contextProvider = options.contextProvider;
  }

  return new VextLogger(compiled);
}
