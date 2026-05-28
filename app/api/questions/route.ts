import { NextResponse } from "next/server"

import { loadAllQuestions } from "@/lib/questions/loader"
import { filterQuestions, shuffle } from "@/lib/questions/filter"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const exam = url.searchParams.get("exam")
  const topic = url.searchParams.get("topic")
  const tag = url.searchParams.get("tag")
  const seedParam = url.searchParams.get("seed")
  const idsParam = url.searchParams.get("ids")
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : null

  const seed = seedParam ? Number(seedParam) : undefined

  const all = await loadAllQuestions()
  const filtered = filterQuestions(all, { exam, topic, tag, ids })
  const ordered = shuffle(filtered, seed)

  return NextResponse.json({ questions: ordered })
}
