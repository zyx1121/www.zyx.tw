import { createOnRequestError } from "@workspace/otel/on-request-error"
import { registerSensorium } from "@workspace/otel/register"

/**
 * OpenTelemetry bootstrap for this app — see @workspace/otel/register for
 * the full Sensorium producer contract (env-driven, OTLP/JSON, no-op when
 * OTEL_EXPORTER_OTLP_ENDPOINT is unset).
 */
export function register() {
  registerSensorium({ defaultServiceName: "1909" })
}

export const onRequestError = createOnRequestError("1909")
