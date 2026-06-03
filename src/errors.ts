export class LoggerClosedError extends Error {
  constructor() {
    super("Logger is closed");
    this.name = "LoggerClosedError";
  }
}

