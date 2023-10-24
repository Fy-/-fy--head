#!/usr/bin/env sh

set -e
pnpm run build:head
cd packages/fy-head/dist

npm publish --access public