# syntax=docker/dockerfile:1
# ui.zyx.tw as a container: the static export behind Caddy (apps/ui/Caddyfile).
# Build from the repository root: docker build -f apps/ui/Dockerfile .

FROM node:24-slim AS build
COPY --from=oven/bun:1.3.13 /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /repo
COPY . .
RUN bun install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/ui && bun run build

FROM caddy:2.10-alpine
LABEL org.opencontainers.image.source=https://github.com/zyx1121/www.zyx.tw
COPY apps/ui/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/apps/ui/out /srv
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:3000/llms.txt"]
