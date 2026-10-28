#!/usr/bin/env node
/**
 * out/robots.txt 의 Sitemap 줄을 이 빌드의 주소로 맞춘다.
 * robots.txt 는 public/ 의 정적 파일이라(다음 웹마스터 확인 줄이 들어 있어 그대로 둔다)
 * 두 문 빌드에서도 본 주소가 박혀 나간다 — 빌드 끝에 한 줄만 갈아 끼운다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ssamzip.com').replace(/\/$/, '');
const p = 'out/robots.txt';
if (!existsSync(p)) { console.error('✖ out/robots.txt 가 없다'); process.exit(1); }
const before = readFileSync(p, 'utf8');
const after = before.replace(/^Sitemap: .*$/m, `Sitemap: ${SITE}/sitemap.xml`);
if (!/^Sitemap: /m.test(after)) { console.error('✖ robots.txt 에 Sitemap 줄이 없다'); process.exit(1); }
writeFileSync(p, after);
console.log(`✅ robots Sitemap → ${SITE}/sitemap.xml`);
