import type { TimestampMode } from "./types";
import { quote } from "./utils/json";

export function appendTimestamp(target: string[], mode: TimestampMode): void {
  if (mode === "none") {
    return;
  }

  if (mode === "iso") {
    target.push(",\"time\":", quote(new Date().toISOString()));
    return;
  }

  target.push(",\"time\":", String(Date.now()));
}

export function appendTimestampString(line: string, mode: TimestampMode): string {
  if (mode === "none") {
    return line;
  }

  if (mode === "iso") {
    return `${line},"time":${quote(new Date().toISOString())}`;
  }

  return `${line},"time":${Date.now()}`;
}
