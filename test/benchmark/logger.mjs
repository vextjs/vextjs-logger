import { performance } from "node:perf_hooks";
import pino from "pino";
import {
  createLogger,
  createNoopSink
} from "../../dist/index.mjs";
import { childBindings, fixtureError, nestedPayload, smallPayload } from "./fixtures/payloads.mjs";

const ITERATIONS = Number(process.env.BENCH_ITERATIONS ?? 100_000);
const WARMUP = 10_000;

export async function runLoggerBenchmarks() {
  const scenarios = [
    createScenario("message-only", createLogger({ sink: createNoopSink() }), pino({ base: null }, noopStream()), (logger) => {
      logger.info("hello");
    }),
    createScenario("object-payload", createLogger({ sink: createNoopSink() }), pino({ base: null }, noopStream()), (logger) => {
      logger.info(smallPayload, "done");
    }),
    createScenario("nested-object", createLogger({ sink: createNoopSink() }), pino({ base: null }, noopStream()), (logger) => {
      logger.info(nestedPayload, "done");
    }),
    createScenario("error-payload", createLogger({ sink: createNoopSink() }), pino({ base: null }, noopStream()), (logger) => {
      logger.error(fixtureError);
    }),
    createScenario("disabled-level", createLogger({ sink: createNoopSink(), level: "warn" }), pino({ level: "warn", base: null }, noopStream()), (logger) => {
      logger.debug(smallPayload, "skip");
    }),
    createScenario(
      "child-bindings",
      createLogger({ sink: createNoopSink() }).child(childBindings),
      pino({ base: null }, noopStream()).child(childBindings),
      (logger) => {
        logger.info({ statusCode: 200 }, "done");
      }
    )
  ];

  const results = scenarios.map((scenario) => ({
    name: scenario.name,
    vextjsLoggerOpsPerSecond: measure(() => scenario.runVext(scenario.vext)),
    pinoOpsPerSecond: measure(() => scenario.runPino(scenario.pino))
  }));

  const summary = results.reduce(
    (acc, item) => {
      acc.vextjsLoggerOpsPerSecond += item.vextjsLoggerOpsPerSecond;
      acc.pinoOpsPerSecond += item.pinoOpsPerSecond;
      return acc;
    },
    { vextjsLoggerOpsPerSecond: 0, pinoOpsPerSecond: 0 }
  );

  return {
    iterations: ITERATIONS,
    node: process.version,
    results,
    summary: {
      ...summary,
      ratio: summary.vextjsLoggerOpsPerSecond / summary.pinoOpsPerSecond
    }
  };
}

function createScenario(name, vext, pinoLogger, run) {
  return {
    name,
    vext,
    pino: pinoLogger,
    runVext: run,
    runPino: run
  };
}

function measure(run) {
  for (let index = 0; index < WARMUP; index += 1) {
    run();
  }

  const start = performance.now();
  for (let index = 0; index < ITERATIONS; index += 1) {
    run();
  }
  const elapsed = performance.now() - start;

  return Math.round((ITERATIONS / elapsed) * 1000);
}

function noopStream() {
  return {
    write() {}
  };
}
