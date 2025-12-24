import { z } from 'zod'

export const budgetSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  amount: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Budget amount must be greater than 0'),
  period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], {
    message: 'Please select a budget period',
  }),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
  alert_threshold: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0 && val <= 100, 'Alert threshold must be between 0 and 100')
    .default(80),
})

export type BudgetFormData = {
  category_id: string
  amount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string | null
  alert_threshold: number
}

export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const
