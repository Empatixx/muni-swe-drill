"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { BookOpen, Layers } from "lucide-react"

import { cn } from "@/lib/utils"

export type ExamEntry = {
  name: string
  count: number
}

export function AppSidebar({ exams, total }: { exams: ExamEntry[]; total: number }) {
  const params = useSearchParams()
  const current = params.get("exam")

  return (
    <aside className="w-full shrink-0 border-b border-[var(--color-border)] md:w-64 md:border-b-0 md:border-r">
      <nav className="flex flex-col gap-1 p-4">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Exams
        </p>
        <ExamLink href="/" active={current === null}>
          <Layers className="h-4 w-4" />
          <span className="flex-1">All exams</span>
          <span className="text-xs opacity-70">{total}</span>
        </ExamLink>
        {exams.map((e) => (
          <ExamLink
            key={e.name}
            href={`/?exam=${encodeURIComponent(e.name)}`}
            active={current === e.name}
          >
            <BookOpen className="h-4 w-4" />
            <span className="flex-1 truncate">{e.name}</span>
            <span className="text-xs opacity-70">{e.count}</span>
          </ExamLink>
        ))}
      </nav>
    </aside>
  )
}

function ExamLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        active
          ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
          : "hover:bg-[var(--color-muted)]",
      )}
    >
      {children}
    </Link>
  )
}
