import { Suspense } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppSidebar, type ExamEntry } from "@/components/app-sidebar"
import { loadAllQuestions } from "@/lib/questions/loader"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    default: "SWE Muni Drill",
    template: "%s | SWE Muni Drill",
  },
  description: "Drill MUNI Software Engineering exam questions",
}

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

async function getExamList(): Promise<{ exams: ExamEntry[]; total: number }> {
  const questions = await loadAllQuestions()
  const counts = new Map<string, number>()
  for (const q of questions) counts.set(q.exam, (counts.get(q.exam) ?? 0) + 1)
  const exams = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return { exams, total: questions.length }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { exams, total } = await getExamList()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body className="min-h-screen font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NuqsAdapter>
            <div className="flex min-h-screen flex-col">
              <header className="border-b border-[var(--color-border)]">
                <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-5 w-5 text-[var(--color-primary)]" />
                    <span>SWE Muni Drill</span>
                  </Link>
                  <ThemeToggle />
                </div>
              </header>
              <div className="flex flex-1 flex-col md:flex-row">
                <Suspense
                  fallback={<aside className="w-full md:w-64 md:border-r md:border-[var(--color-border)]" />}
                >
                  <AppSidebar exams={exams} total={total} />
                </Suspense>
                <main className="flex-1 px-6 py-8">
                  <div className="mx-auto w-full max-w-3xl">{children}</div>
                </main>
              </div>
              <footer className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-muted-foreground)]">
                Drill mode for MUNI SWE exams. Multiple correct answers per question are possible.
              </footer>
            </div>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  )
}
