#!/bin/sh
set -eu

TARGET="${HERMES_HOME:-$HOME/.hermes}/desktop-plugins/custom-wallpaper-glass"
mkdir -p "$TARGET"
cp "$(dirname "$0")/plugin.js" "$TARGET/plugin.js"
printf 'Installed to %s\n' "$TARGET/plugin.js"
printf 'In Hermes Desktop run: Cmd+K -> Reload desktop plugins\n'
