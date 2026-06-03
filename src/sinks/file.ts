import { createWriteStream, type WriteStream } from "node:fs";
import type { LogSink } from "../types";

export interface FileSinkOptions {
  flags?: string;
}

export function createFileSink(path: string, options: FileSinkOptions = {}): LogSink {
  const stream = createWriteStream(path, {
    flags: options.flags ?? "a",
    encoding: "utf8"
  });

  return {
    write(line: string): void {
      stream.write(line);
    },
    flush(): Promise<void> {
      return flushStream(stream);
    },
    close(): Promise<void> {
      return new Promise((resolve, reject) => {
        stream.end(() => resolve());
        stream.once("error", reject);
      });
    }
  };
}

function flushStream(stream: WriteStream): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!stream.writableNeedDrain) {
      resolve();
      return;
    }
    stream.once("drain", resolve);
    stream.once("error", reject);
  });
}

