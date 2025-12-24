import { z } from 'zod'

export const accountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters'),
  type: z.enum(['primary', 'secondary', 'savings', 'investment', 'sacco'], {
    message: 'Please select an account type',
  }),
  bank_name: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
  balance: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 0, 'Balance cannot be negative'),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
})

export type AccountFormData = {
  name: string
  type: 'primary' | 'secondary' | 'savings' | 'investment' | 'sacco'
  bank_name?: string | null
  account_number?: string | null
  balance: number
  color?: string | null
  icon?: string | null
}
