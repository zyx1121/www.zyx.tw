/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/3d", "@workspace/otel", "@workspace/ui"],
  // Other zyx.tw sites render scenes with <Scene3D>, which loads its
  // environment maps from here.
  async headers() {
    return [
      {
        source: "/env/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ]
  },
}

export default nextConfig
