/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/otel", "@workspace/ui"],
  serverExternalPackages: ["exifr"],
  images: {
    // GitHub's OpenGraph card is the preview for repo entries in Projects.
    remotePatterns: [{ hostname: "opengraph.githubassets.com" }],
  },
}

export default nextConfig
