"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchAllQuestions } from "@/lib/questions/client-loader"
import { filterQuestions } from "@/lib/questions/filter"
import type { Question } from "@/lib/questions/schema"

function LandingInner() {
  const sp = useSearchParams()
  const examParam = sp.get("exam")
  const [questions, setQuestions] = React.useState<Question[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchAllQuestions()
      .then(setQuestions)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load questions"))
  }, [])

  if (error) {
    return <p className="text-sm text-[var(--color-destructive)]">{error}</p>
  }
  if (!questions) {
    return (
      <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading questions…</span>
      </div>
    )
  }

  const matching = filterQuestions(questions, { exam: examParam })
  const examLabel = examParam ?? "All exams"
  const seed = Math.floor(Math.random() * 2 ** 30)
  const drillHref = examParam
    ? `/drill/?exam=${encodeURIComponent(examParam)}&seed=${seed}`
    : `/drill/?seed=${seed}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{examLabel}</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          ABCD multiple-choice with one or more correct answers. Pick an exam from the sidebar
          and start drilling.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Ready to start</span>
            <Badge variant="secondary">{matching.length} questions</Badge>
          </CardTitle>
          <CardDescription>
            Questions are shuffled. Submit each answer to see whether you got it right, then move
            on. At the end you&apos;ll see your score and can re-drill the ones you missed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end">
          <Button asChild disabled={matching.length === 0}>
            <Link href={drillHref}>
              <Play className="h-4 w-4" />
              Start drill
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LandingPage() {
  return (
    <React.Suspense fallback={<div>Loading…</div>}>
      <LandingInner />
    </React.Suspense>
  )
}
