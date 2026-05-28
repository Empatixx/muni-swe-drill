"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Home, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { OptionLabel } from "@/lib/questions/schema"

type StoredQuestion = {
  id: string
  topic: string
  question: string
  options: { label: OptionLabel; text: string }[]
  correct: OptionLabel[]
  explanation?: string
}

type Stored = {
  answers: { id: string; selected: OptionLabel[]; correct: boolean }[]
  questions: StoredQuestion[]
}

const SESSION_KEY = "swe-muni-drill:session"
const RETRY_KEY = "swe-muni-drill:retry-ids"

export function ResultsSummary() {
  const router = useRouter()
  const [data, setData] = React.useState<Stored | null>(null)
  const [missing, setMissing] = React.useState(false)

  React.useEffect(() => {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) {
      setMissing(true)
      return
    }
    setData(JSON.parse(raw) as Stored)
  }, [])

  if (missing) {
    return (
      <div className="space-y-4">
        <p>No session data found. Start a new drill from the landing page.</p>
        <Button onClick={() => router.push(`/`)}>
          <Home className="h-4 w-4" />
          Back to landing
        </Button>
      </div>
    )
  }

  if (!data) return null

  const total = data.answers.length
  const correctCount = data.answers.filter((a) => a.correct).length
  const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100)
  const wrong = data.answers.filter((a) => !a.correct)
  const wrongById = new Map(wrong.map((a) => [a.id, a]))
  const wrongQuestions = data.questions.filter((q) => wrongById.has(q.id))

  const retryWrong = () => {
    const ids = wrong.map((a) => a.id)
    window.sessionStorage.setItem(RETRY_KEY, JSON.stringify(ids))
    window.sessionStorage.removeItem(SESSION_KEY)
    router.push(`/drill/?seed=${Math.floor(Math.random() * 2 ** 30)}`)
  }

  const startOver = () => {
    window.sessionStorage.removeItem(SESSION_KEY)
    window.sessionStorage.removeItem(RETRY_KEY)
    router.push(`/`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            You answered {correctCount} of {total} correctly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold">{pct}%</span>
            <span className="text-[var(--color-muted-foreground)]">
              {correctCount} / {total}
            </span>
          </div>
        </CardContent>
      </Card>

      {wrongQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missed questions</CardTitle>
            <CardDescription>Review and drill again with just these.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {wrongQuestions.map((q) => {
              const a = wrongById.get(q.id)!
              return (
                <div
                  key={q.id}
                  className="rounded-md border border-[var(--color-border)] p-3 text-sm"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{q.topic}</Badge>
                    <Badge variant="destructive">
                      You: {a.selected.length ? a.selected.join(", ") : "—"}
                    </Badge>
                    <Badge variant="success">Correct: {q.correct.join(", ")}</Badge>
                  </div>
                  <p className="font-medium">{q.question}</p>
                  {q.explanation && (
                    <p className="mt-1 text-[var(--color-muted-foreground)]">
                      {q.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={startOver}>
          <Home className="h-4 w-4" />
          Back to landing
        </Button>
        {wrong.length > 0 && (
          <Button onClick={retryWrong}>
            <RotateCcw className="h-4 w-4" />
            Retry wrong ({wrong.length})
          </Button>
        )}
      </div>
    </div>
  )
}
