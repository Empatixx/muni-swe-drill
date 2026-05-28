"use client"

import * as React from "react"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OptionLabel, Question } from "@/lib/questions/schema"

type Verdict = {
  selected: OptionLabel[]
  correct: OptionLabel[]
}

export function QuestionCard({
  question,
  selected,
  onToggle,
  revealed,
}: {
  question: Question
  selected: OptionLabel[]
  onToggle: (label: OptionLabel) => void
  revealed: boolean
}) {
  const correctSet = new Set(question.correct)
  const selectedSet = new Set(selected)

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{question.exam}</Badge>
          <span className="ml-auto text-xs text-[var(--color-muted-foreground)]">
            {question.correct.length > 1 ? "Multiple correct" : "Single correct"}
          </span>
        </div>
        <CardTitle className="text-lg font-medium leading-snug">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = selectedSet.has(opt.label)
          const isCorrect = correctSet.has(opt.label)
          const state = !revealed
            ? "neutral"
            : isCorrect && isSelected
              ? "right"
              : isSelected && !isCorrect
                ? "wrong"
                : isCorrect && !isSelected
                  ? "missed"
                  : "neutral"

          return (
            <label
              key={opt.label}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                state === "neutral" && "border-[var(--color-border)] hover:bg-[var(--color-muted)]",
                state === "right" &&
                  "border-[var(--color-success)] bg-[var(--color-success)]/10",
                state === "wrong" &&
                  "border-[var(--color-destructive)] bg-[var(--color-destructive)]/10",
                state === "missed" &&
                  "border-[var(--color-warning)] bg-[var(--color-warning)]/10",
                revealed && "cursor-default",
              )}
            >
              <Checkbox
                checked={isSelected}
                disabled={revealed}
                onCheckedChange={() => onToggle(opt.label)}
              />
              <span className="flex-1 text-sm">
                <strong className="mr-2 font-semibold">{opt.label}.</strong>
                {opt.text}
              </span>
              {revealed && state === "right" && (
                <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
              )}
              {revealed && state === "wrong" && (
                <XCircle className="h-5 w-5 text-[var(--color-destructive)]" />
              )}
              {revealed && state === "missed" && (
                <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />
              )}
            </label>
          )
        })}

        {revealed && question.explanation && (
          <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm">
            <p className="mb-1 font-medium">Explanation</p>
            <p className="text-[var(--color-muted-foreground)]">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { Verdict }
