import { z } from "zod"

export const OptionLabelSchema = z.enum(["A", "B", "C", "D", "E", "F", "G", "H"])
export type OptionLabel = z.infer<typeof OptionLabelSchema>

export const QuestionSchema = z.object({
  id: z.string().min(1),
  exam: z.string().min(1),
  topic: z.string().min(1),
  tags: z.array(z.string()).default([]),
  question: z.string().min(1),
  options: z
    .array(
      z.object({
        label: OptionLabelSchema,
        text: z.string().min(1),
      }),
    )
    .min(2)
    .max(8),
  correct: z.array(OptionLabelSchema).min(1),
  explanation: z.string().optional(),
})

export type Question = z.infer<typeof QuestionSchema>

export const QuestionFileSchema = z.array(QuestionSchema)
