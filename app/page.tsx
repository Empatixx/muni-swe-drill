import Link from "next/link"
import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { filterQuestions } from "@/lib/questions/filter"
import { loadAllQuestions } from "@/lib/questions/loader"

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const examParam = typeof sp.exam === "string" ? sp.exam : null

  const all = await loadAllQuestions()
  const matching = filterQuestions(all, { exam: examParam })
  const examLabel = examParam ?? "All exams"

  const seed = Math.floor(Math.random() * 2 ** 30)
  const drillHref = examParam
    ? `/drill?exam=${encodeURIComponent(examParam)}&seed=${seed}`
    : `/drill?seed=${seed}`

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
