import assert from "node:assert/strict";
import test from "node:test";
import * as api from "../../src";

test("public exports include logger and sink factories", () => {
  assert.equal(typeof api.createLogger, "function");
  assert.equal(typeof api.createMemorySink, "function");
  assert.equal(typeof api.createNoopSink, "function");
  assert.equal(typeof api.createStdoutSink, "function");
  assert.equal(typeof api.createFileSink, "function");
});
