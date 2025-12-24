export * from './database'

// Additional app-specific types

export type AccountType = 'primary' | 'secondary' | 'savings' | 'investment' | 'sacco'

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

export type LoanType = 'lent' | 'borrowed'

export type LoanStatus = 'active' | 'paid' | 'defaulted' | 'forgiven'

export type GoalCategory = 'savings' | 'investment' | 'debt_payoff' | 'purchase' | 'emergency_fund' | 'other'

export type GoalPriority = 'low' | 'medium' | 'high'

export type GoalStatus = 'active' | 'completed' | 'cancelled'

export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type ReminderType = 'bill' | 'loan' | 'goal' | 'budget' | 'custom'

export type Theme = 'light' | 'dark' | 'system'

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

// Dashboard widget types
export interface DashboardWidget {
  id: string
  title: string
  type: 'balance' | 'income' | 'expense' | 'budget' | 'goal' | 'loan' | 'chart'
  size: 'small' | 'medium' | 'large'
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

// PAYE Calculator types
export interface PAYEInput {
  grossSalary: number
  basicSalary?: number
  housingAllowance?: number
  transportAllowance?: number
  otherAllowances?: number
  insuranceRelief?: number
}

export interface PAYEResult {
  grossSalary: number
  nssfContribution: number
  taxableIncome: number
  paye: number
  personalRelief: number
  insuranceRelief: number
  netPaye: number
  nhifContribution: number
  housingLevy: number
  netSalary: number
  breakdown: PAYETaxBand[]
}

export interface PAYETaxBand {
  band: string
  rate: number
  taxableAmount: number
  tax: number
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter types
export interface DateRangeFilter {
  startDate: string
  endDate: string
}

export interface TransactionFilters extends DateRangeFilter {
  accountId?: string
  categoryId?: string
  minAmount?: number
  maxAmount?: number
  isRecurring?: boolean
}
