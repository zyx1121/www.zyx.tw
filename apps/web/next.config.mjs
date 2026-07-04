/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/otel", "@workspace/ui"],
  serverExternalPackages: ["exifr"],
}

export default nextConfig
