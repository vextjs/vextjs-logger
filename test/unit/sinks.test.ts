import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { createFileSink, createLogger, createMemorySink, createNoopSink } from "../../src";

test("memory sink captures lines", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, timestamp: "none" });

    logger.info("one");
    logger.info("two");

  assert.equal(sink.lines.length, 2);
  sink.clear();
  assert.equal(sink.lines.length, 0);
});

test("noop sink discards lines", () => {
    const sink = createNoopSink();
    const logger = createLogger({ sink });

    logger.info("discarded");

  assert.doesNotThrow(() => logger.info("again"));
});

test("file sink writes output", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vextjs-logger-"));
    const file = join(dir, "log.ndjson");

    try {
      const logger = createLogger({
        sink: createFileSink(file),
        timestamp: "none"
      });

      logger.info("file");
      await logger.close();

    assert.match(await readFile(file, "utf8"), /"msg":"file"/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
});
