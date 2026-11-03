#!/usr/bin/env bash
# One app's image as deployed: start it, check its pages and its 404.
#   bash deploy/smoke.sh <app> <image>
# ci runs it once per app with the image loaded as <image>.
set -euo pipefail
app=$1
image=$2
trap 'docker logs app || true' EXIT

code() { curl -s -o /dev/null -w "%{http_code}" "localhost:3000$1"; }

docker run -d --name app -p 127.0.0.1:3000:3000 "$image" >/dev/null
for i in $(seq 1 30); do curl -s -o /dev/null localhost:3000/ && break; sleep 1; done

case $app in
  web) pages="/ /works /about /privacy /terms /llms.txt /about.md /og/0.gif" ;;
  ui) pages="/ /button /button.md /index.md /llms.txt /r/base.json /fonts/sarasa-mono-tc.css" ;;
  1909) pages="/auth/login" ;;
  *) pages="/" ;;
esac
for path in $pages; do
  echo "$path $(code "$path")"
  test "$(code "$path")" = 200
done

# link reads an unknown path as a short code, and 1909 needs a session.
case $app in
  link | 1909) ;;
  *) test "$(code /nope-not-a-page)" = 404 ;;
esac

case $app in
  web)
    curl -s -o /dev/null -w "%{redirect_url}\n" localhost:3000/og.gif | grep -q '^https://www.zyx.tw/og/'
    # The prerendered About has the heatmap when the build had the token.
    # A GitHub outage at build time must not block a deploy; ISR fills it in.
    about=$(curl -s localhost:3000/about)
    grep -q contributionLevel <<<"$about" || echo "::warning::About built without the heatmap"
    ;;
  ui)
    curl -sI localhost:3000/button.md | grep -qi '^content-type: text/markdown'
    curl -sI localhost:3000/r/base.json | grep -qi '^access-control-allow-origin: \*'
    test "$(code /button.html)" = 308
    test "$(code /button/)" = 308
    # Crafted paths must never redirect off the host.
    for path in /%5Cevil.com.html /%09/evil.com.html /%5Cevil.com/; do
      location=$(curl -s -o /dev/null -w "%{redirect_url}" "localhost:3000$path")
      echo "$path -> $location"
      case "$location" in "" | http://localhost:3000/*) ;; *) exit 1 ;; esac
    done
    ;;
esac
trap - EXIT
docker rm -f app >/dev/null
echo "smoke passed: $app"
