/**
 * Parses /home/krokviak/Downloads/PA165.txt into data/questions/PV165-2026.json.
 *
 * The source has three sections (no header, "2023", "2025") of free-form Q's
 * with 2-6 options. Some sections use "1. opt" numbering, the 2025 section uses
 * "A: opt". Correct answers carry a "+N" / "(+N)" marker. We:
 *
 *   1. Classify each "N. text" line as Question vs Option by looking at the
 *      next non-blank line:
 *        - if it starts with "1. " or "A:"/"B:" -> it's a question
 *        - if the line ends with "?"            -> it's a question
 *        - otherwise it's an option line.
 *   2. Skip questions with <2 options or no marked correct answer.
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const SRC = "/home/krokviak/Downloads/PA165.txt"
const DST = path.join(import.meta.dir, "..", "data", "questions", "PV165-2026.json")

const EXAM = "PV165-2026"
const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const

type Question = {
  id: string
  exam: string
  topic: string
  tags: string[]
  question: string
  options: { label: (typeof LABELS)[number]; text: string }[]
  correct: (typeof LABELS)[number][]
}

const raw = readFileSync(SRC, "utf8").replace(/^﻿/, "")

const lines = raw
  .split(/\r?\n/)
  .map((l) => l.replace(/ /g, " ")) // nbsp
  .map((l) => l.replace(/^\s*\*\s+/, "1. ")) // bullet → option

const stripFootnotes = (s: string) => s.replace(/\[[a-z]\]/g, "")

const NUM_LINE_RE = /^\s*(\d{1,3})\.\s+(.*\S)\s*$/
const LETTER_OPTION_RE = /^\s*([A-F]):\s+(.*\S)\s*$/

const nextNonBlank = (from: number): string | null => {
  for (let i = from; i < lines.length; i++) {
    if (lines[i].trim() !== "") return lines[i]
  }
  return null
}

const isLetterOption = (line: string) => LETTER_OPTION_RE.test(line)
const isFirstNumOption = (line: string) => /^\s*1\.\s+\S/.test(line)
const isSectionMarker = (line: string) => {
  const t = line.trim()
  return /^_{3,}$/.test(t) || /^20\d{2}$/.test(t) || /PA\s*165/i.test(t)
}

type Block = {
  questionText: string
  startLine: number
  optionLines: string[]
  letterStyle: boolean
}

const blocks: Block[] = []
let current: Block | null = null

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const cleaned = stripFootnotes(line)

  if (cleaned.trim() === "") continue

  if (isSectionMarker(cleaned)) {
    if (current) blocks.push(current)
    current = null
    continue
  }

  // Note lines in 2025 header
  if (/^\(.+\)\s*$/.test(cleaned.trim()) && !current) continue

  const nm = cleaned.match(NUM_LINE_RE)
  if (nm) {
    const text = nm[2].trim()
    // classify
    const next = nextNonBlank(i + 1) ?? ""
    const nextTrim = next.trim()
    const looksLikeQuestion =
      text.endsWith("?") ||
      isFirstNumOption(nextTrim) ||
      isLetterOption(nextTrim) ||
      /^[A-F]\)\s+/.test(nextTrim)

    if (looksLikeQuestion) {
      if (current) blocks.push(current)
      current = {
        questionText: text,
        startLine: i,
        optionLines: [],
        letterStyle: isLetterOption(nextTrim),
      }
      continue
    }
    // option line
    if (current) current.optionLines.push(text)
    continue
  }

  const lm = cleaned.match(LETTER_OPTION_RE)
  if (lm) {
    if (current) {
      current.optionLines.push(`__LETTER__${lm[1]}__${lm[2].trim()}`)
      current.letterStyle = true
    }
    continue
  }

  // Skip prose / "Answer:" lines — but they end the current option's wrap.
  if (/^Answer\s*:/i.test(cleaned.trim())) continue
  // Continuation of last option (wrapped line). Skip code, prose, and Foo:Bar annotations.
  if (current && current.optionLines.length > 0) {
    const t = cleaned.trim()
    if (/[{};()=]/.test(t) || t.length > 200) continue
    if (/^[A-Z][a-zA-Z]+\s*:/.test(t)) continue
    if (/^[a-zšťďřčžýáíéúů].{40,}/.test(t)) continue // long lowercase = prose
    current.optionLines[current.optionLines.length - 1] += " " + t
  }
}
if (current) blocks.push(current)

function extractCorrect(text: string): { cleaned: string; correct: boolean } {
  // Match "(+N)" or trailing "+N" markers (with optional spaces)
  let cleaned = text
  let correct = false
  const reParen = /\(\+\s*\d+\)/g
  if (reParen.test(cleaned)) {
    correct = true
    cleaned = cleaned.replace(reParen, "").trim()
  }
  const reTrail = /\s\+\s*\d+\s*$/
  if (reTrail.test(cleaned)) {
    correct = true
    cleaned = cleaned.replace(reTrail, "").trim()
  }
  // Also: stray "+1" in middle followed by bracketed note
  const reLoose = /\s\+\s*\d+(\s|$)/g
  if (reLoose.test(cleaned)) {
    correct = true
    cleaned = cleaned.replace(reLoose, " ").trim()
  }
  return { cleaned: cleaned.replace(/\s+/g, " ").trim(), correct }
}

const out: Question[] = []
let kept = 0
const skipReasons: Record<string, number> = {}
const skip = (why: string) => {
  skipReasons[why] = (skipReasons[why] ?? 0) + 1
}

for (const b of blocks) {
  // build options
  const opts: { text: string; correct: boolean }[] = []
  for (const line of b.optionLines) {
    let text = line
    if (line.startsWith("__LETTER__")) {
      text = line.replace(/^__LETTER__[A-F]__/, "")
    }
    const { cleaned, correct } = extractCorrect(text)
    if (cleaned.length === 0) continue
    opts.push({ text: cleaned, correct })
  }

  if (opts.length < 2) {
    skip(`<2 options (${opts.length})`)
    continue
  }
  if (opts.length > LABELS.length) {
    skip(`>8 options (${opts.length})`)
    continue
  }
  const correctIdxs = opts
    .map((o, i) => (o.correct ? i : -1))
    .filter((x) => x >= 0)
  if (correctIdxs.length === 0) {
    skip("no marked correct")
    continue
  }

  out.push({
    id: `pv165-2026-q${kept + 1}`,
    exam: EXAM,
    topic: "PV165",
    tags: [],
    question: b.questionText,
    options: opts.map((o, i) => ({ label: LABELS[i], text: o.text })),
    correct: correctIdxs.map((i) => LABELS[i]),
  })
  kept++
}

writeFileSync(DST, JSON.stringify(out, null, 2) + "\n", "utf8")
console.log(`Wrote ${kept} questions → ${DST}`)
console.log(`Skipped block reasons:`)
for (const [r, n] of Object.entries(skipReasons).sort()) console.log(`  ${r}: ${n}`)
