import { createOnRequestError } from "@workspace/otel/on-request-error";
import { registerSensorium } from "@workspace/otel/register";

/**
 * OpenTelemetry bootstrap for this app — see @workspace/otel/register for
 * the full Sensorium producer contract (env-driven, OTLP/JSON, no-op when
 * OTEL_EXPORTER_OTLP_ENDPOINT is unset).
 *
 * This app builds with `output: "export"` (fully static — see
 * next.config.ts), so in production there is no Next.js server handling
 * requests and this never actually fires; kept for parity with the other
 * 7 apps and in case that ever changes. See app/layout.tsx for why the
 * client-attribution geo helper is skipped here.
 */
export function register() {
  registerSensorium({ defaultServiceName: "ui" });
}

export const onRequestError = createOnRequestError("ui");
