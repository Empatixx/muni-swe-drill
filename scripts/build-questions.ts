/**
 * Bundles every data/questions/*.json file into public/questions.json, which
 * the static-exported client fetches at runtime. Run before `next build`.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"

const ROOT = path.join(import.meta.dir, "..")
const SRC = path.join(ROOT, "data", "questions")
const OUT_DIR = path.join(ROOT, "public")
const OUT = path.join(OUT_DIR, "questions.json")

const files = readdirSync(SRC).filter((f) => f.endsWith(".json"))
const all = files.flatMap((file) => JSON.parse(readFileSync(path.join(SRC, file), "utf8")))

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, JSON.stringify(all) + "\n", "utf8")
console.log(`Bundled ${all.length} questions from ${files.length} file(s) → ${OUT}`)
