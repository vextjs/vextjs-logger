import assert from "node:assert/strict";
import test from "node:test";
import { createLogger, createMemorySink } from "../../src";
import { createCircularFixture } from "../fixtures/circular";
import { createFixtureError } from "../fixtures/errors";

function parse(line: string): Record<string, unknown> {
  return JSON.parse(line);
}

test("serializer serializes Error payloads", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, timestamp: "none" });

    logger.error(createFixtureError());

    const line = parse(sink.lines[0] ?? "");
  assert.equal(line.level, "error");
  assert.equal(line.msg, "fixture failed");
  assert.deepEqual(
    {
      type: (line.err as { type: string }).type,
      message: (line.err as { message: string }).message
    },
    {
      type: "Error",
      message: "fixture failed"
    }
  );
});

test("serializer serializes BigInt and Date values", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, timestamp: "none" });
    const date = new Date("2026-06-03T00:00:00.000Z");

    logger.info({ id: 10n, date });

  assert.deepEqual(parse(sink.lines[0] ?? ""), {
      level: "info",
      id: "10",
      date: "2026-06-03T00:00:00.000Z"
    });
});

test("serializer handles circular nested objects", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, timestamp: "none" });

    logger.info({ payload: createCircularFixture() });

  assert.deepEqual(parse(sink.lines[0] ?? ""), {
      level: "info",
      payload: {
        name: "root",
        self: "[Circular]"
      }
    });
});

test("serializer handles nested arrays and skipped object values", () => {
  const sink = createMemorySink();
  const logger = createLogger({ sink, timestamp: "none" });

  logger.info({
    values: [1, undefined, "ok"],
    nested: {
      keep: true,
      skip: undefined
    }
  });

  assert.deepEqual(parse(sink.lines[0] ?? ""), {
    level: "info",
    values: [1, null, "ok"],
    nested: {
      keep: true
    }
  });
});

test("serializer protects core fields from payload overrides", () => {
    const sink = createMemorySink();
    const logger = createLogger({ sink, timestamp: "none" });

    logger.info({ level: "fatal", msg: "override", time: 1, ok: true }, "real");

  assert.deepEqual(parse(sink.lines[0] ?? ""), {
      level: "info",
      ok: true,
      msg: "real"
    });
});

test("serializer escapes strings that need JSON escaping", () => {
  const sink = createMemorySink();
  const logger = createLogger({ sink, timestamp: "none" });

  logger.info({ value: "quote \" and slash \\" }, "line\nbreak");

  assert.deepEqual(parse(sink.lines[0] ?? ""), {
    level: "info",
    value: "quote \" and slash \\",
    msg: "line\nbreak"
  });
});
