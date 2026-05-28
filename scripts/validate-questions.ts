import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { QuestionFileSchema } from "../src/lib/questions/schema"

const DIR = path.join(import.meta.dir, "..", "data", "questions")
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"))

let total = 0
let failed = 0
for (const f of files) {
  const raw = readFileSync(path.join(DIR, f), "utf8")
  try {
    const parsed = QuestionFileSchema.parse(JSON.parse(raw))
    console.log(`✓ ${f}: ${parsed.length}`)
    total += parsed.length
  } catch (e) {
    failed++
    console.log(`✗ ${f}: ${e instanceof Error ? e.message.split("\n")[0] : e}`)
    if (e instanceof Error && "issues" in e) {
      // zod error
      // @ts-expect-error - zod error issues are not typed
      for (const i of e.issues.slice(0, 3)) {
        console.log(`    ${i.path.join(".")}: ${i.message}`)
      }
    }
  }
}
console.log(`\nTotal: ${total} questions across ${files.length} files (failed: ${failed})`)
process.exit(failed > 0 ? 1 : 0)
