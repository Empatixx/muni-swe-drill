# swe-muni-drill

A small Next.js app to drill MUNI Software Engineering exam questions.

ABCD multiple-choice with one or more correct answers per question.

## Stack

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind v4 + shadcn-style primitives (handrolled)
- Zod for question schema validation
- nuqs for URL-synced filter state
- next-themes for dark mode
- Vitest for unit tests
- Bun as the package manager

## Run

```bash
bun install
bun dev          # → http://localhost:3000
bun test         # run vitest
bun run typecheck
bun run build
```

## Adding questions

Drop a JSON file into `data/questions/`. Each file is an array of questions
matching the `QuestionSchema` in `src/lib/questions/schema.ts`:

```jsonc
[
  {
    "id": "2024-spring-q1",
    "exam": "2024-spring",
    "topic": "Testing",
    "tags": ["junit"],
    "question": "Which of the following are true about JUnit 5?",
    "options": [
      { "label": "A", "text": "..." },
      { "label": "B", "text": "..." },
      { "label": "C", "text": "..." },
      { "label": "D", "text": "..." }
    ],
    "correct": ["A", "C"],
    "explanation": "Optional context shown after Submit."
  }
]
```

Questions are read on the server, Zod-validated, and cached in module memory.
Restart `bun dev` to pick up new files (or clear the import cache).
