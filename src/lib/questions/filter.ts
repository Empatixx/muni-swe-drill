import type { Question, OptionLabel } from "./schema"

export type Filters = {
  exam?: string | null
  topic?: string | null
  tag?: string | null
  ids?: string[] | null
}

export function filterQuestions(questions: Question[], filters: Filters): Question[] {
  return questions.filter((q) => {
    if (filters.ids && filters.ids.length > 0) {
      if (!filters.ids.includes(q.id)) return false
    }
    if (filters.exam && q.exam !== filters.exam) return false
    if (filters.topic && q.topic !== filters.topic) return false
    if (filters.tag && !q.tags.includes(filters.tag)) return false
    return true
  })
}

export function shuffle<T>(arr: T[], seed?: number): T[] {
  const out = [...arr]
  let s = seed ?? Math.floor(Math.random() * 2 ** 31)
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 2 ** 32
    const j = s % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function summarize(questions: Question[]) {
  const exams = new Set<string>()
  const topics = new Set<string>()
  const tags = new Set<string>()
  for (const q of questions) {
    exams.add(q.exam)
    topics.add(q.topic)
    for (const t of q.tags) tags.add(t)
  }
  return {
    exams: [...exams].sort(),
    topics: [...topics].sort(),
    tags: [...tags].sort(),
  }
}

export function isAnswerCorrect(selected: OptionLabel[], correct: OptionLabel[]): boolean {
  if (selected.length !== correct.length) return false
  const set = new Set(correct)
  return selected.every((label) => set.has(label))
}
