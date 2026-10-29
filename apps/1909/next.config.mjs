/** @type {import('next').NextConfig} */
const nextConfig = {
  // The container image (root Dockerfile) builds with NEXT_OUTPUT=standalone.
  ...(process.env.NEXT_OUTPUT === "standalone"
    ? {
        output: "standalone",
        outputFileTracingRoot: new URL("../..", import.meta.url).pathname,
      }
    : {}),
  transpilePackages: ["@workspace/otel", "@workspace/ui"],
}

export default nextConfig
