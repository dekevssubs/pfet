import { z } from 'zod'

export const LOAN_TYPES = [
  { value: 'borrowed', label: 'Money I Borrowed' },
  { value: 'lent', label: 'Money I Lent' },
] as const

export const LOAN_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paid', label: 'Paid Off' },
  { value: 'defaulted', label: 'Defaulted' },
  { value: 'forgiven', label: 'Forgiven' },
] as const

export const loanSchema = z.object({
  type: z.enum(['lent', 'borrowed'], {
    message: 'Please select a loan type',
  }),
  person_name: z.string().min(1, 'Name is required'),
  person_contact: z.string().optional().nullable(),
  principal_amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Amount must be greater than 0'),
  interest_rate: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0 && val <= 100, 'Interest rate must be between 0 and 100')
    .default(0),
  date_issued: z.string().min(1, 'Issue date is required'),
  due_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const loanPaymentSchema = z.object({
  loan_id: z.string().min(1, 'Loan is required'),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val > 0, 'Payment amount must be greater than 0'),
  payment_date: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional().nullable(),
})

export type LoanFormData = {
  type: 'lent' | 'borrowed'
  person_name: string
  person_contact?: string | null
  principal_amount: number
  interest_rate: number
  date_issued: string
  due_date?: string | null
  notes?: string | null
}

export type LoanPaymentFormData = {
  loan_id: string
  amount: number
  payment_date: string
  notes?: string | null
}
