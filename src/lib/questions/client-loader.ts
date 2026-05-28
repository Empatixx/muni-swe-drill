import { QuestionFileSchema, type Question } from "./schema"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

let cache: Question[] | null = null
let inflight: Promise<Question[]> | null = null

export async function fetchAllQuestions(): Promise<Question[]> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = fetch(`${BASE}/questions.json`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load questions: HTTP ${res.status}`)
      const parsed = QuestionFileSchema.parse(await res.json())
      cache = parsed
      return parsed
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}
