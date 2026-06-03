import { runLoggerBenchmarks } from "../test/benchmark/logger.mjs";

const result = await runLoggerBenchmarks();

console.log(JSON.stringify(result, null, 2));

if (result.summary.vextjsLoggerOpsPerSecond <= result.summary.pinoOpsPerSecond) {
  process.exitCode = 1;
}

