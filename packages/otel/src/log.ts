import {
  type LogAttributes,
  SeverityNumber,
  logs,
} from "@opentelemetry/api-logs"

/**
 * Emit an OTel log record through whatever LoggerProvider `register.ts`'s
 * `registerSensorium()` set up for this app.
 *
 * Safe to call from any server-side path regardless of whether OTel was
 * actually wired up: when `OTEL_EXPORTER_OTLP_ENDPOINT` is unset (e.g. plain
 * `bun run dev`), `registerSensorium()` never runs, so
 * `@opentelemetry/api-logs` stays on its built-in no-op LoggerProvider —
 * `logger.emit()` is then a harmless no-op, never a throw.
 *
 * `loggerName` becomes the OTel instrumentation-scope name attached to every
 * record — pass the app's service name (web/good/link/...) so records are
 * distinguishable per-producer in Sensorium even though they all flow
 * through this one shared function.
 */
export function emitErrorLog(
  loggerName: string,
  input: {
    message: string
    digest?: string
    attributes?: LogAttributes
  }
): void {
  const logger = logs.getLogger(loggerName)
  logger.emit({
    severityNumber: SeverityNumber.ERROR,
    severityText: "ERROR",
    body: input.message,
    attributes: {
      ...(input.digest ? { "error.digest": input.digest } : {}),
      ...input.attributes,
    },
  })
}
