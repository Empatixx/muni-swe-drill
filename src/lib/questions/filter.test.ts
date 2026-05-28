import { describe, expect, it } from "vitest"

import { filterQuestions, isAnswerCorrect, shuffle, summarize } from "./filter"
import type { Question } from "./schema"

const sample: Question[] = [
  {
    id: "a",
    exam: "2023-fall",
    topic: "TDD",
    tags: ["tdd"],
    question: "?",
    options: [
      { label: "A", text: "a" },
      { label: "B", text: "b" },
      { label: "C", text: "c" },
      { label: "D", text: "d" },
    ],
    correct: ["A", "C"],
  },
  {
    id: "b",
    exam: "2023-fall",
    topic: "SOLID",
    tags: ["solid", "design"],
    question: "?",
    options: [
      { label: "A", text: "a" },
      { label: "B", text: "b" },
      { label: "C", text: "c" },
      { label: "D", text: "d" },
    ],
    correct: ["B"],
  },
  {
    id: "c",
    exam: "2022-spring",
    topic: "TDD",
    tags: ["tdd"],
    question: "?",
    options: [
      { label: "A", text: "a" },
      { label: "B", text: "b" },
      { label: "C", text: "c" },
      { label: "D", text: "d" },
    ],
    correct: ["D"],
  },
]

describe("filterQuestions", () => {
  it("filters by exam", () => {
    expect(filterQuestions(sample, { exam: "2023-fall" }).map((q) => q.id)).toEqual(["a", "b"])
  })

  it("filters by topic", () => {
    expect(filterQuestions(sample, { topic: "TDD" }).map((q) => q.id)).toEqual(["a", "c"])
  })

  it("filters by tag", () => {
    expect(filterQuestions(sample, { tag: "design" }).map((q) => q.id)).toEqual(["b"])
  })

  it("filters by ids list", () => {
    expect(filterQuestions(sample, { ids: ["a", "c"] }).map((q) => q.id)).toEqual(["a", "c"])
  })

  it("combines filters", () => {
    expect(filterQuestions(sample, { exam: "2023-fall", topic: "TDD" }).map((q) => q.id)).toEqual(["a"])
  })
})

describe("shuffle", () => {
  it("returns same elements", () => {
    const out = shuffle(["a", "b", "c", "d"], 42)
    expect(out.sort()).toEqual(["a", "b", "c", "d"])
  })

  it("is deterministic with seed", () => {
    expect(shuffle([1, 2, 3, 4, 5], 7)).toEqual(shuffle([1, 2, 3, 4, 5], 7))
  })
})

describe("summarize", () => {
  it("collects exams, topics, tags", () => {
    expect(summarize(sample)).toEqual({
      exams: ["2022-spring", "2023-fall"],
      topics: ["SOLID", "TDD"],
      tags: ["design", "solid", "tdd"],
    })
  })
})

describe("isAnswerCorrect", () => {
  it("returns true when selection matches exactly", () => {
    expect(isAnswerCorrect(["A", "C"], ["A", "C"])).toBe(true)
    expect(isAnswerCorrect(["C", "A"], ["A", "C"])).toBe(true)
  })

  it("returns false when missing a correct answer", () => {
    expect(isAnswerCorrect(["A"], ["A", "C"])).toBe(false)
  })

  it("returns false when including a wrong answer", () => {
    expect(isAnswerCorrect(["A", "B", "C"], ["A", "C"])).toBe(false)
  })

  it("returns false on empty selection vs non-empty correct", () => {
    expect(isAnswerCorrect([], ["A"])).toBe(false)
  })
})
