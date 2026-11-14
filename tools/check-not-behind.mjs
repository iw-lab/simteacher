// 배포 전: 원격보다 뒤처진 폴더에서 배포하지 않는다 — node tools/check-not-behind.mjs [--selftest]
//   2026-11-14 23:17 다른 세션이 올린 등재 2건(주차탈출·바둑)을 받지 않은 폴더에서 배포해 사이트에서 두 게임이 사라졌다.
//   (5분 뒤 rebase 로 소스엔 들어왔지만 재배포가 없었다 — 사용자 «바둑이랑 주차는 어디로 감?»)
import { execFileSync } from 'node:child_process';

/** 뒤처진 커밋 수 → 판정. fetch 실패(null)는 막지 않고 알리기만(오프라인 배포는 어차피 뒤에서 실패한다). */
export function verdict(behind) {
  if (behind === null) return { ok: true, msg: '⚠️ 원격을 확인하지 못했다 — 뒤처졌는지 모른 채 진행' };
  if (behind > 0) return { ok: false, msg: `🛑 원격에 안 받은 커밋 ${behind}개 — 이대로 배포하면 그 등재·수정이 사이트에서 사라진다. git pull --rebase 후 다시.` };
  return { ok: true, msg: '✅ 원격과 같거나 앞섬' };
}

if (process.argv.includes('--selftest')) {
  const cases = [[0, true], [2, false], [null, true]];
  const bad = cases.filter(([b, want]) => verdict(b).ok !== want);
  console.log(bad.length ? `❌ selftest ${JSON.stringify(bad)}` : '✅ check-not-behind selftest 3칸(뒤처짐 2 → 빨강)');
  process.exit(bad.length ? 1 : 0);
}
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
let behind = null;
try { git('fetch', '-q', 'origin'); behind = Number(git('rev-list', '--count', 'HEAD..@{u}')); } catch { behind = null; }
const v = verdict(Number.isNaN(behind) ? null : behind);
console.log(`check-not-behind: ${v.msg}`);
process.exit(v.ok ? 0 : 1);
