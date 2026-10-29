# syntax=docker/dockerfile:1
# www.zyx.tw as a container: the Next.js standalone server on Node.
# Build from the repository root: docker build -f apps/web/Dockerfile .

# Bun installs; Node runs next build, which breaks under Bun's runtime.
FROM node:24-slim AS build
COPY --from=oven/bun:1.3.13 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /repo
COPY . .
RUN bun install --frozen-lockfile
ENV NEXT_OUTPUT=standalone NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && bun run build

FROM node:24-slim
LABEL org.opencontainers.image.source=https://github.com/zyx1121/www.zyx.tw
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/llms.txt').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "apps/web/server.js"]
