import { z } from 'zod'

export const expenseSchema = z.object({
  amount: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Amount must be greater than 0'),
  description: z.string().optional().nullable(),
  date: z.string().min(1, 'Date is required'),
  account_id: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  is_recurring: z.boolean(),
  recurring_frequency: z
    .enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
    .optional()
    .nullable(),
})

export type ExpenseFormData = {
  amount: number
  description?: string | null
  date: string
  account_id?: string | null
  category_id?: string | null
  is_recurring: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
}

export const expenseCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters'),
  icon: z.string().optional(),
  color: z.string().optional(),
  parent_id: z.string().optional().nullable(),
})

export type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>
