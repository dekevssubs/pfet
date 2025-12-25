import { z } from 'zod'

export const payeCalculatorSchema = z.object({
  grossSalary: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Gross salary must be greater than 0'),
  allowances: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'Allowances cannot be negative')
    .default(0),
  benefits: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'Benefits cannot be negative')
    .default(0),
  pension: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'Pension contribution cannot be negative')
    .default(0),
  insurance: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'Insurance premium cannot be negative')
    .default(0),
  disability: z.boolean().default(false),
})

export type PAYECalculatorFormData = {
  grossSalary: number
  allowances?: number
  benefits?: number
  pension?: number
  insurance?: number
  disability?: boolean
}
