#!/usr/bin/env bash
# 그림 문(ssam-img.pages.dev) — web.app(Firebase Hosting)의 /images/** 를 301 로 여기로 넘긴다(firebase.json redirects).
# 왜(2026-11-11 «50% of budget reached» · 사용자 «파이어베이스 돈 안 나가게»): Hosting 전송 무료 = 하루 360MB 인데
#   처방(썸네일) 뒤에도 하루 ~650MB(방문당 2.4MB 중 그림 1.9MB). Cloudflare Pages 정적 전송은 무료·무제한이다.
# pages.dev 는 학교 망에서 열린다(게임 70여 개가 모두 pages.dev). korea 계정. out/ 을 빌드한 뒤 부른다.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d out/images/portfolio ] || { echo "❌ out/images 없음 — 먼저 빌드"; exit 1; }
D=.img-door; rm -rf "$D"; mkdir -p "$D"; cp -R out/images "$D/images"
cat > "$D/_headers" <<'H'
/images/*
  Cache-Control: public, max-age=86400
  Access-Control-Allow-Origin: *
H
printf '<!doctype html><meta charset="utf-8"><title>선행쌤 그림</title><a href="https://sunhaengssam.web.app">선행쌤</a>\n' > "$D/index.html"
bash tools/cf-korea.sh pages project list 2>/dev/null | grep -q 'ssam-img' || bash tools/cf-korea.sh pages project create ssam-img --production-branch main
bash tools/cf-korea.sh pages deploy "$D" --project-name ssam-img --branch main --commit-dirty=true 2>&1 | grep -E "Deployment complete|rror" || true
# 확인: 아무 썸네일 하나가 새 문에서 200
f=$(cd out && ls images/portfolio/*.thumb.webp | head -1)
for i in $(seq 1 20); do c=$(curl -s -o /dev/null -w '%{http_code}' "https://ssam-img.pages.dev/$f"); [ "$c" = 200 ] && { echo "✅ 그림 문 200 ($f)"; exit 0; }; sleep 3; done
echo "❌ 그림 문이 $f 를 못 준다($c)"; exit 1
