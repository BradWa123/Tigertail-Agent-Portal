#!/usr/bin/env bash
# Checks a finished `next build`: no secrets in what browsers download, and the
# security headers are actually served. Run from the app directory after building.
# Optional: EXPECT_CONNECT_SRC — an origin the CSP's connect-src must allow.
set -euo pipefail
fail=0

echo "── Secrets in browser bundles"
# Anything under .next/static is downloaded by every visitor
patterns='sk-ant-[A-Za-z0-9_-]{20,}|SG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|postgres(ql)?://[^:/@" ]+:[^@" ]+@|-----BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}'
found=$(grep -rEoh "$patterns" .next/static 2>/dev/null || true)
if [ -n "$found" ]; then
  echo "$found" | head -5 | sed -E 's/(.{8}).*/\1… (redacted)/'
  echo "::error::Something that looks like a secret is in the browser bundle"; fail=1
else
  echo "none found"
fi
if grep -rq "up.railway.app" .next/static; then
  echo "::error::Bundle references a *.up.railway.app address — the API must be reached via api.tigertaillogistics.com"; fail=1
fi

echo "── Security headers"
PORT=3999
if [ -f .next/standalone/server.js ]; then
  cp -r .next/static .next/standalone/.next/static
  [ -d public ] && cp -r public .next/standalone/public
  PORT=$PORT HOSTNAME=127.0.0.1 node .next/standalone/server.js >/tmp/next.log 2>&1 &
else
  npx next start -p $PORT -H 127.0.0.1 >/tmp/next.log 2>&1 &
fi
pid=$!; trap 'kill $pid 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 1; done
headers=$(curl -s -D - -o /dev/null "http://127.0.0.1:$PORT/" | tr -d '\r' | tr 'A-Z' 'a-z')

for h in content-security-policy strict-transport-security x-content-type-options referrer-policy; do
  if echo "$headers" | grep -q "^$h:"; then echo "✓ $h"; else echo "::error::Missing header: $h"; fail=1; fi
done
csp=$(echo "$headers" | grep '^content-security-policy:' || true)
if echo "$csp" | grep -q "frame-ancestors 'none'" || echo "$headers" | grep -q '^x-frame-options: deny'; then echo "✓ clickjacking protection"; else echo "::error::No frame-ancestors 'none' / X-Frame-Options DENY"; fail=1; fi
if echo "$csp" | grep -q "unsafe-eval"; then echo "::error::CSP allows unsafe-eval"; fail=1; fi
if echo "$csp" | grep -q "railway.app"; then echo "::error::CSP still allows a railway.app address"; fail=1; fi
if [ -n "${EXPECT_CONNECT_SRC:-}" ]; then
  if echo "$csp" | grep -qi "connect-src[^;]*${EXPECT_CONNECT_SRC}"; then echo "✓ connect-src allows $EXPECT_CONNECT_SRC"; else echo "::error::connect-src does not allow $EXPECT_CONNECT_SRC"; fail=1; fi
fi

exit $fail
