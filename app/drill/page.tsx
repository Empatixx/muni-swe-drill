import { Suspense } from "react"

import { DrillSession } from "@/components/drill-session"

export default function DrillPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <DrillSession />
    </Suspense>
  )
}
