#!/usr/bin/env node
/**
 * 🔒 빌드 전에 Firebase 공개 설정이 있는가.
 *
 * 왜 생겼나 — 2026-11-21 셈틀 시험지 등재를 깨끗한 git worktree 에서 배포했더니 .env.local 이 없어
 * Firebase 가 auth/invalid-api-key 로 죽은 채 빌드됐다. 머리말이 통째로 안 그려져 check-home-logo 가
 * «선행쌤 링크를 못 찾았다»로 막았지만, 까닭이 멀어 한참 헤맸다. 처음부터 이름을 대고 멈춘다.
 *
 * 쓰기: node tools/check-env.mjs            (rc 1 = 빠진 값 있음)
 *       node tools/check-env.mjs --selftest
 */
import { readFileSync, existsSync } from 'node:fs';

export const NEED = ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID'];

export function missing(env, files) {
  const seen = { ...env };
  for (const f of files) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (m && m[2].trim()) seen[m[1]] = m[2].trim();
    }
  }
  return NEED.filter((k) => !seen[k]);
}

if (process.argv.includes('--selftest')) {
  const a = missing({}, []).length === NEED.length;
  const b = missing(Object.fromEntries(NEED.map((k) => [k, 'x'])), []).length === 0;
  console.log(a && b ? 'check-env selftest PASS 2칸' : 'check-env selftest FAIL');
  process.exit(a && b ? 0 : 1);
}
const lack = missing(process.env, ['.env.local', '.env.production.local', '.env.production', '.env']);
if (lack.length) {
  console.error(`✖ Firebase 설정이 없다: ${lack.join(', ')}\n  git worktree 에서 배포하면 .env.local 이 따라오지 않는다 — 본 저장소의 .env.local 을 복사(커밋 금지)하고 다시.`);
  process.exit(1);
}
console.log('check-env: ✅ Firebase 공개 설정 있음');
