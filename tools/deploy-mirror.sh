#!/usr/bin/env bash
# 두 문(sunhaengssam.web.app) 배포 — 학교 망이 ssamzip.com 을 막아도(10-26 DNS 127.0.0.1)
# 검색으로 찾아 들어갈 수 있게, 두 문을 «자기 주소로» 빌드해 올린다.
#
# 🔴 본 주소 빌드와 산출물이 섞이면 안 된다 — 끝나면 반드시 본 주소로 다시 빌드한다.
#    (out/ 하나를 두 곳이 같이 쓰기 때문이다. 안 되돌리면 ssamzip.com 에 두 문 주소가 박힌다.)
set -euo pipefail
cd "$(dirname "$0")/.."
MIRROR=https://sunhaengssam.web.app

echo "▶ 두 문 주소로 빌드: $MIRROR"
NEXT_PUBLIC_SITE_URL="$MIRROR" npm run build

# robots·두 문 검사는 빌드(postbuild)가 이미 했다 — 여기서 한 번 더 확인만 한다
grep -q "^Sitemap: $MIRROR/sitemap.xml" out/robots.txt || { echo "✖ robots 사이트맵이 두 문 주소가 아니다"; exit 1; }

echo "▶ 올린다"
npx -y firebase-tools@latest deploy --only hosting:main
node tools/check-two-doors.mjs --url "$MIRROR"
NEXT_PUBLIC_SITE_URL="$MIRROR" node tools/indexnow.mjs || echo "⚠ indexnow 실패(배포는 됨)"

echo "▶ 본 주소로 되돌려 빌드(out/ 오염 방지)"
npm run build
node tools/check-two-doors.mjs --dir out --expect https://ssamzip.com
echo "✅ 두 문 배포 끝 — $MIRROR · out/ 은 본 주소로 복구됨"
