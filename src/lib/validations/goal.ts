import { z } from 'zod'

export const GOAL_CATEGORIES = [
  { value: 'savings', label: 'Savings', icon: 'PiggyBank' },
  { value: 'investment', label: 'Investment', icon: 'TrendingUp' },
  { value: 'debt_payoff', label: 'Debt Payoff', icon: 'CreditCard' },
  { value: 'purchase', label: 'Purchase', icon: 'ShoppingBag' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: 'Shield' },
  { value: 'other', label: 'Other', icon: 'Target' },
] as const

export const GOAL_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6B7280' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
] as const

export const GOAL_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Name is too long'),
  description: z.string().optional().nullable(),
  target_amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Target amount must be greater than 0'),
  current_amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'Current amount cannot be negative')
    .default(0),
  target_date: z.string().optional().nullable(),
  category: z.enum(['savings', 'investment', 'debt_payoff', 'purchase', 'emergency_fund', 'other']).nullable().default('savings'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
})

export const goalContributionSchema = z.object({
  goal_id: z.string().min(1, 'Goal is required'),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Contribution amount must be greater than 0'),
  contribution_date: z.string().min(1, 'Contribution date is required'),
  notes: z.string().optional().nullable(),
})

export type GoalFormData = {
  name: string
  description?: string | null
  target_amount: number
  current_amount?: number
  target_date?: string | null
  category?: 'savings' | 'investment' | 'debt_payoff' | 'purchase' | 'emergency_fund' | 'other' | null
  priority?: 'low' | 'medium' | 'high'
  color?: string | null
  icon?: string | null
}

export type GoalContributionFormData = {
  goal_id: string
  amount: number
  contribution_date: string
  notes?: string | null
}
