import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import { QuestionFileSchema, type Question } from "./schema"

const DATA_DIR = path.join(process.cwd(), "data", "questions")

let cache: Question[] | null = null

export async function loadAllQuestions(): Promise<Question[]> {
  if (cache) return cache

  const entries = await readdir(DATA_DIR)
  const jsonFiles = entries.filter((name) => name.endsWith(".json"))

  const all: Question[] = []
  for (const file of jsonFiles) {
    const raw = await readFile(path.join(DATA_DIR, file), "utf8")
    const parsed = QuestionFileSchema.parse(JSON.parse(raw))
    all.push(...parsed)
  }

  cache = all
  return all
}

export function clearQuestionCache() {
  cache = null
}
