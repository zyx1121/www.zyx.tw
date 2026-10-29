# syntax=docker/dockerfile:1
# One zyx.tw Next.js app as a container: its standalone server on Node.
# Build from the repository root:
#   docker build --build-arg APP=web --build-arg HEALTH=/llms.txt .
# apps/ui is a static export and has its own apps/ui/Dockerfile.

ARG APP=web

# Bun installs; Node runs next build, which breaks under Bun's runtime.
FROM node:24-slim AS build
ARG APP
COPY --from=oven/bun:1.3.13 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /repo
COPY . .
RUN bun install --frozen-lockfile
ENV NEXT_OUTPUT=standalone NEXT_TELEMETRY_DISABLED=1
# Apps without a public/ folder still get one, for the COPY below.
RUN cd "apps/$APP" && bun run build && mkdir -p public

FROM node:24-slim
ARG APP
# The path the health check fetches: a page that answers 200 with nothing
# outside the container (no database, no secrets).
ARG HEALTH=/
LABEL org.opencontainers.image.source=https://github.com/zyx1121/www.zyx.tw
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 \
    APP=$APP HEALTH=$HEALTH
COPY --from=build --chown=node:node /repo/apps/$APP/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/$APP/.next/static ./apps/$APP/.next/static
COPY --from=build --chown=node:node /repo/apps/$APP/public ./apps/$APP/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000' + process.env.HEALTH).then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["sh", "-c", "exec node apps/$APP/server.js"]
