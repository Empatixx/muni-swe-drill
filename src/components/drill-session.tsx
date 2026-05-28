"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, CheckCircle2, Loader2, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { QuestionCard } from "@/components/question-card"
import { fetchAllQuestions } from "@/lib/questions/client-loader"
import { filterQuestions, isAnswerCorrect, shuffle } from "@/lib/questions/filter"
import type { OptionLabel, Question } from "@/lib/questions/schema"

type Answer = {
  id: string
  selected: OptionLabel[]
  correct: boolean
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const SESSION_KEY = "swe-muni-drill:session"
const RETRY_KEY = "swe-muni-drill:retry-ids"

export function DrillSession() {
  const router = useRouter()
  const params = useSearchParams()

  const [questions, setQuestions] = React.useState<Question[] | null>(null)
  const [index, setIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<OptionLabel[]>([])
  const [revealed, setRevealed] = React.useState(false)
  const [answers, setAnswers] = React.useState<Answer[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const retryRaw =
          typeof window !== "undefined" ? window.sessionStorage.getItem(RETRY_KEY) : null
        const retryIds = retryRaw ? (JSON.parse(retryRaw) as string[]) : null
        if (retryIds && retryIds.length > 0) {
          window.sessionStorage.removeItem(RETRY_KEY)
        }

        const exam = params.get("exam")
        const seedParam = params.get("seed")
        const seed = seedParam ? Number(seedParam) : undefined

        const all = await fetchAllQuestions()
        const filtered = filterQuestions(all, { exam, ids: retryIds })
        const ordered = shuffle(filtered, seed)
        if (cancelled) return
        if (ordered.length === 0) {
          setError("No questions match this filter.")
        } else {
          setQuestions(ordered)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load questions")
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [params])

  const total = questions?.length ?? 0
  const current = questions?.[index] ?? null

  const onToggle = (label: OptionLabel) => {
    if (revealed) return
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    )
  }

  const onSubmit = () => {
    if (!current || selected.length === 0) return
    const correct = isAnswerCorrect(selected, current.correct)
    setAnswers((prev) => [...prev, { id: current.id, selected, correct }])
    setRevealed(true)
  }

  const onNext = () => {
    if (!questions) return
    if (index + 1 >= questions.length) {
      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          answers,
          questions: questions.map((q) => ({
            id: q.id,
            topic: q.topic,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
          })),
        }),
      )
      router.push(`${BASE}/drill/results/`)
      return
    }
    setIndex((i) => i + 1)
    setSelected([])
    setRevealed(false)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-destructive)]">{error}</p>
        <Button variant="outline" onClick={() => router.push(`${BASE}/`)}>
          Back to filters
        </Button>
      </div>
    )
  }

  if (!questions || !current) {
    return (
      <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading questions…</span>
      </div>
    )
  }

  const progress = ((index + (revealed ? 1 : 0)) / total) * 100
  const lastQuestion = index + 1 === total

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
          <span>
            Question {index + 1} / {total}
          </span>
          <span>
            {answers.filter((a) => a.correct).length} correct so far
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <QuestionCard
        question={current}
        selected={selected}
        onToggle={onToggle}
        revealed={revealed}
      />

      <div className="flex justify-end gap-2">
        {!revealed ? (
          <Button onClick={onSubmit} disabled={selected.length === 0}>
            <CheckCircle2 className="h-4 w-4" />
            Submit answer
          </Button>
        ) : (
          <Button onClick={onNext}>
            {lastQuestion ? (
              <>
                <RotateCcw className="h-4 w-4" />
                See results
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Next question
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
