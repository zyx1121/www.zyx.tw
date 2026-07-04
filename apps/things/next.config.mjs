/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/otel", "@workspace/ui"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
}

export default nextConfig
