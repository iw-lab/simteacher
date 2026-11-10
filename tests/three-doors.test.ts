// 선행쌤 배포 = 세 문 모두(.kr · .com · web.app) — 2026-11-10 사용자 «항상 셋다 올리도록해» (.kr 만 올리고 끝냈다)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
describe('세 문 배포', () => {
  it('npm run deploy 가 .kr·.com·web.app 을 모두 올리고 세 문을 확인한다', () => {
    const d: string = pkg.scripts.deploy;
    for (const part of ['cf-korea.sh deploy', 'deploy-com.sh', 'deploy-mirror.sh', 'check-three-doors.mjs']) expect(d, part).toContain(part);
  });
});
