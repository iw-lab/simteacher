// 🚫 게임 복사는 그만둔다(2026-10-24) — 게임은 edge/games.json 한 줄로 ssamzip.com/<길>/ 에 이어진다(edge/worker.js 가 원본 pages.dev 에서 받아 온다).
// 복사본(public/<길>, out/<길>)은 게임을 고쳐도 옛판을 내보내던 원인이었다. 🔒 tools/check-edge-games.mjs
console.error('sync-games: 쓰지 않는다 — 게임은 edge/games.json 에 한 줄 추가(복사 0)')
process.exit(0)
