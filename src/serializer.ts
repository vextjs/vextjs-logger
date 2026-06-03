import type { CompiledLoggerOptions, LogRecord, TimestampMode } from "./types";
import { appendRecord, appendRecordString, quote, serializeError, serializeValue } from "./utils/json";
import { appendTimestamp, appendTimestampString } from "./timestamp";

export function serializeLogLine(
  options: CompiledLoggerOptions,
  levelName: string,
  messageOrRecord?: unknown,
  text?: string
): string {
  let record: LogRecord | undefined;
  let message: string | undefined;

  if (messageOrRecord === undefined) {
    message = text;
  } else if (typeof messageOrRecord === "string") {
    message = messageOrRecord;
  } else if (messageOrRecord instanceof Error) {
    record = { err: messageOrRecord };
    message = text ?? messageOrRecord.message;
  } else if (isRecord(messageOrRecord)) {
    record = messageOrRecord;
    message = text;
  } else {
    const serialized = serializeValue(messageOrRecord);
    message = serialized === undefined ? String(messageOrRecord) : serialized;
  }

  let line = `{"level":"${levelName}"`;

  line = appendTimestampString(line, options.timestamp);

  if (options.name) {
    line += `,"name":${quote(options.name)}`;
  }

  if (options.bindings) {
    line += options.bindings;
  }

  line = appendProviderRecord(line, options.contextProvider);
  line = appendProviderRecord(line, options.mixin);
  line = appendRecordString(line, record);

  if (message !== undefined) {
    line += `,"msg":${quote(message)}`;
  }

  return `${line}}\n`;
}

function appendProviderRecord(line: string, provider: (() => LogRecord | void) | undefined): string {
  if (!provider) {
    return line;
  }

  try {
    const value = provider();
    if (isRecord(value) && !isPromiseLike(value)) {
      return appendRecordString(line, value);
    }
  } catch {
    // Provider failures must not break the logging path.
  }

  return line;
}

function isRecord(value: unknown): value is LogRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPromiseLike(value: unknown): boolean {
  return Boolean(
    value &&
      typeof value === "object" &&
      "then" in value &&
      typeof (value as { then?: unknown }).then === "function"
  );
}

export function appendManualTimestamp(target: string[], mode: TimestampMode): void {
  appendTimestamp(target, mode);
}
