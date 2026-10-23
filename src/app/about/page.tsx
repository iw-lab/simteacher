'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Code2, Users } from 'lucide-react'

export default function AboutPage() {
  const timeline = [
    { year: '2013.9', title: '교직 시작', description: '초등학교 교사로 첫 발을 내딛다' },
    { year: '2025', title: '바이브코딩 시작', description: 'AI와 함께 코드를 만들기 시작하다' },
    { year: '2026', title: '알찬 운영', description: '학급 경제 SaaS를 만들어 실제 학급에서 운영 중' },
    { year: '현재', title: '선행쌤', description: '교실에서 쓰라고 만든 것들을 한곳에 모아 나누는 중' },
  ]

  const skills = [
    { category: '교육', items: ['학급 경영', '경제 교육', '게이미피케이션', 'PBL', '협동학습'] },
    { category: '바이브코딩', items: ['Claude Code', 'AI 페어 코딩', '프롬프트 설계'] },
    { category: '만들어 본 것', items: ['React', 'Next.js', 'Firebase', '웹 배포'] },
    { category: 'AI 도구', items: ['Claude', 'ChatGPT', 'Gemini', '이미지 생성 AI'] },
  ]

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-violet w-[420px] h-[420px] -top-20 right-[8%] opacity-70" />
        <div className="aurora-blob aurora-cyan w-[380px] h-[380px] top-[55%] -left-32 opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-primary-600 dark:text-primary-300 font-semibold">About Me</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-fg">
            안녕하세요, 선행쌤을 만든 <span className="gradient-text">심선생</span>입니다
          </h1>
          <p className="mt-6 text-lg text-muted-fg max-w-2xl mx-auto">
            초등학교 교사이자 바이브코딩 개발자.
            먼저 배워서 나누고, 선한 영향력을 전합니다.
          </p>
        </motion.div>

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-12 items-center mb-24"
        >
          <div className="relative aspect-square rounded-3xl glass overflow-hidden">
            <Image
              src="/images/simsem-avatar-c.webp"
              alt="심선생 웹툰 캐릭터"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-fg mb-6">
              교실에서 미래를 준비하는 교사
            </h2>
            <div className="space-y-4 text-muted-fg leading-relaxed">
              <p>
                2013년 9월부터 초등학교에서 아이들과 함께하며, 교육의 본질과
                혁신 사이에서 균형을 찾아가고 있습니다.
              </p>
              <p>
                2025년, AI와 함께 코드를 만드는 바이브코딩을 시작했습니다.
                개발을 전공하지 않았지만, 교실에서 필요한 것을 스스로 만들 수
                있는 시대가 왔다고 믿습니다. 그 믿음으로 학급 경제 SaaS
                &lsquo;알찬&rsquo;을 만들어 실제 학급에서 운영하고 있습니다.
              </p>
              <p>
                &quot;먼저 배워서 나누고, 선한 영향력을 전하다&quot;는 제 교육
                철학입니다. 새로운 것을 배우고, 이를 학생들과 나누는 것이 가장
                큰 보람입니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-24"
        >
          <h2 className="text-2xl font-bold text-fg text-center mb-12">
            교육 가치관
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: '학생 중심',
                description:
                  '모든 교육의 중심에는 학생이 있습니다. 아이들의 눈높이에서 생각하고 소통합니다.',
              },
              {
                icon: Code2,
                title: '만들며 배우기',
                description:
                  '필요한 것을 직접 만들어 보는 경험이 가장 깊은 배움입니다. 교사가 먼저 만들어 보여줍니다.',
              },
              {
                icon: Users,
                title: '함께 성장',
                description:
                  '교사도 학생도 함께 배우고 성장합니다. 배움에는 끝이 없습니다.',
              },
            ].map((value) => (
              <div key={value.title} className="glass rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-500/15 flex items-center justify-center text-primary-600 dark:text-primary-300">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-fg mb-4">{value.title}</h3>
                <p className="text-muted-fg leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-24"
        >
          <h2 className="text-2xl font-bold text-fg text-center mb-12">여정</h2>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-[7px] sm:left-1/2 sm:-translate-x-1/2 w-0.5 h-full bg-line" />
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-6 sm:gap-0 ${
                    index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
                >
                  <div
                    className={`hidden sm:block w-1/2 ${
                      index % 2 === 0 ? 'pr-10 text-right' : 'pl-10 text-left'
                    }`}
                  >
                    <div className="gradient-text font-extrabold text-lg">{item.year}</div>
                    <div className="text-xl font-bold text-fg">{item.title}</div>
                    <div className="text-muted-fg">{item.description}</div>
                  </div>
                  <div className="relative z-10 mt-1.5 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                    <div className="w-4 h-4 rounded-full bg-primary-500 ring-4 ring-primary-500/20" />
                  </div>
                  <div className="sm:hidden">
                    <div className="gradient-text font-extrabold text-lg">{item.year}</div>
                    <div className="text-xl font-bold text-fg">{item.title}</div>
                    <div className="text-muted-fg">{item.description}</div>
                  </div>
                  <div className="hidden sm:block w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-fg text-center mb-12">
            다루는 것들
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill) => (
              <div key={skill.category} className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-fg mb-4">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 text-sm bg-muted text-muted-fg rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
