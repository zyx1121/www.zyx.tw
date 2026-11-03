#!/bin/sh
# carrel-deployd (from land) runs this from the release directory on every
# deploy and rollback. Every app of the stack in /opt/www-zyx-tw moves to the
# release in VERSION together; it reports ready once they are all up, then
# follows the web logs. The unit needs Type=notify and NotifyAccess=all.
set -eu

version=$(cat VERSION)
# The release carries the stack's compose.yaml, so the repo is its source.
if [ -f compose.yaml ]; then
  cp compose.yaml /opt/www-zyx-tw/compose.yaml.new
  mv /opt/www-zyx-tw/compose.yaml.new /opt/www-zyx-tw/compose.yaml
fi
cd /opt/www-zyx-tw

tmp=$(mktemp .env.XXXXXX)
grep -vE '^(WEB|UI|GOOD|TIME|LINK|APP_1909|PLUMP)_VERSION=' .env >"$tmp" || true
for name in WEB UI GOOD TIME LINK APP_1909 PLUMP; do
  echo "${name}_VERSION=$version" >>"$tmp"
done
chmod 600 "$tmp"
mv "$tmp" .env

# Another stack on the VM may pull at the same moment, and containerd then
# fails a commit now and then; a second try gets it.
for try in 1 2 3; do
  docker compose pull --quiet && break
  [ "$try" = 3 ] && exit 1
  sleep 2
done
docker compose up -d --wait --remove-orphans
docker image prune -f --filter label=org.opencontainers.image.source=https://github.com/zyx1121/www.zyx.tw >/dev/null
systemd-notify --ready
exec docker compose logs -f --since 1s web
