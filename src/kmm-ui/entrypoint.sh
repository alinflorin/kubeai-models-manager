#!/bin/sh
set -e

# Generate runtime env file
envsubst < /usr/share/caddy/env-config.js.template > /usr/share/caddy/env-config.js

# Start Caddy
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
