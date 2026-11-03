import { learningSites } from '@/data/projects'

export const dynamic = 'force-static'

// 학교 대항전 판(ssam-ranks 워커)이 10분마다 읽는 게임 목록 — 등재하면 저절로 따라간다(따로 적는 목록 0).
//   워커가 각 게임의 /api/hub/schools 를 물어 학교 허브가 있는 게임만 남긴다. 🔒 ~/Documents/dev/ssam-ranks/tests
export function GET() {
  const list = learningSites.filter((s) => s.url).map((s) => ({ slug: s.slug, url: s.url }))
  return Response.json(list)
}
