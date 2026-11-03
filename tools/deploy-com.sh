#!/usr/bin/env bash
# 옛 주소 ssamzip.com 문 배포 — 2026-11-03 사용자 «.com 에서 사이트 그대로».
#   .com 전용 빌드(대표 주소 .com · 전부 noindex · .kr 글자 0) → out-com 에 떼어 두고 → 검사 → 올림 → 본 주소로 다시 빌드.
# 🔴 out/ 은 본 주소(.kr) 것이다 — 끝나면 반드시 본 주소로 되돌려 빌드한다(deploy-mirror.sh 와 같은 규칙).
set -euo pipefail
cd "$(dirname "$0")/.."
COM=https://ssamzip.com

echo "▶ .com 문 주소로 빌드: $COM"
NEXT_PUBLIC_SITE_URL="$COM" NEXT_PUBLIC_COM_DOOR=1 npm run build      # postbuild 의 check-two-doors 가 .com 모드(noindex·.kr 0)로 돈다
rm -rf out-com && cp -R out out-com
node tools/check-two-doors.mjs --dir out-com --expect "$COM"

echo "▶ 올린다(ssamzip-com 워커)"
bash tools/cf-korea.sh deploy -c wrangler.com.jsonc

echo "▶ 본 주소로 되돌려 빌드(out/ 오염 방지)"
npm run build
node tools/check-two-doors.mjs --dir out --expect https://ssamzip.kr
echo "✅ .com 문 배포 끝 — $COM · out/ 은 본 주소로 복구됨"
