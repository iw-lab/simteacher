#!/usr/bin/env bash
# ssamzip.com(선행쌤) 앞문 워커 전용 — korea 계정(simssijjang@korea.kr · b3d436cf…). ssamzip.com 이름 관리가 이 계정에 있다.
# 로그인 복사 금지(갱신 토큰이 서로를 무효로 만든다) — ~/.cf-homes/korea 의 로그인을 그대로 쓴다. 계정이 다르면 멈춘다.
set -euo pipefail
export HOME="$HOME/.cf-homes/korea" npm_config_cache="${npm_config_cache:-/Users/sim-insu/.npm}"
acct=$(npx -y wrangler@4.83.0 whoami 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -o 'b3d436cfca3fb9f2d1d7af777e23e8f1' | head -1 || true)
[ "$acct" = b3d436cfca3fb9f2d1d7af777e23e8f1 ] || { echo "❌ korea 계정 로그인이 아니다"; exit 3; }
exec npx -y wrangler@4.83.0 "$@"
