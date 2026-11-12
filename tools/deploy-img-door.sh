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
printf 'not found\n' > "$D/404.html"   # 없으면 Pages 가 없는 그림에도 첫 페이지를 200 으로 준다(깨진 그림·검사 속음 · 2026-11-12 알찬에서 발견)
bash tools/cf-korea.sh pages project list 2>/dev/null | grep -q 'ssam-img' || bash tools/cf-korea.sh pages project create ssam-img --production-branch main
bash tools/cf-korea.sh pages deploy "$D" --project-name ssam-img --branch main --commit-dirty=true 2>&1 | grep -E "Deployment complete|rror" || true
# 확인: 그림 전부가 새 문에서 200·같은 크기(200 만 보면 없는 파일에도 속는다)
check() { local bad=0 f n; while read -r f; do n=$(curl -s -o /dev/null -w '%{http_code} %{size_download}' "https://ssam-img.pages.dev/$f"); [ "$n" = "200 $(stat -f %z "out/$f")" ] || bad=$((bad+1)); done < <(cd out && find images -type f | sort); echo $bad; }
for i in $(seq 1 20); do b=$(check); [ "$b" = 0 ] && { echo "✅ 그림 문 전부 일치"; exit 0; }; sleep 6; done
echo "❌ 그림 문에 없거나 다른 그림 $b 장"; exit 1
