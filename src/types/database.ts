// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'primary' | 'secondary' | 'savings' | 'investment' | 'sacco'
          bank_name: string | null
          account_number: string | null
          balance: number
          is_default: boolean
          color: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'primary' | 'secondary' | 'savings' | 'investment' | 'sacco'
          bank_name?: string | null
          account_number?: string | null
          balance?: number
          is_default?: boolean
          color?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'primary' | 'secondary' | 'savings' | 'investment' | 'sacco'
          bank_name?: string | null
          account_number?: string | null
          balance?: number
          is_default?: boolean
          color?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      income_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          color: string | null
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string | null
          color?: string | null
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          color?: string | null
          is_system?: boolean
          created_at?: string
        }
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          category_id: string | null
          amount: number
          description: string | null
          date: string
          is_recurring: boolean
          recurring_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          category_id?: string | null
          amount: number
          description?: string | null
          date: string
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          category_id?: string | null
          amount?: number
          description?: string | null
          date?: string
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          created_at?: string
          updated_at?: string
        }
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          color: string | null
          parent_id: string | null
          is_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          is_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          color?: string | null
          parent_id?: string | null
          is_system?: boolean
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          account_id: string | null
          category_id: string | null
          amount: number
          description: string | null
          date: string
          is_recurring: boolean
          recurring_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id?: string | null
          category_id?: string | null
          amount: number
          description?: string | null
          date: string
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string | null
          category_id?: string | null
          amount?: number
          description?: string | null
          date?: string
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string | null
          alert_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date?: string | null
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string | null
          alert_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          user_id: string
          type: 'lent' | 'borrowed'
          person_name: string
          person_contact: string | null
          principal_amount: number
          interest_rate: number
          amount_paid: number
          date_issued: string
          due_date: string | null
          status: 'active' | 'paid' | 'defaulted' | 'forgiven'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'lent' | 'borrowed'
          person_name: string
          person_contact?: string | null
          principal_amount: number
          interest_rate?: number
          amount_paid?: number
          date_issued: string
          due_date?: string | null
          status?: 'active' | 'paid' | 'defaulted' | 'forgiven'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'lent' | 'borrowed'
          person_name?: string
          person_contact?: string | null
          principal_amount?: number
          interest_rate?: number
          amount_paid?: number
          date_issued?: string
          due_date?: string | null
          status?: 'active' | 'paid' | 'defaulted' | 'forgiven'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loan_payments: {
        Row: {
          id: string
          loan_id: string
          amount: number
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          loan_id: string
          amount: number
          payment_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          loan_id?: string
          amount?: number
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string | null
          category: 'savings' | 'investment' | 'debt_payoff' | 'purchase' | 'emergency_fund' | 'other' | null
          priority: 'low' | 'medium' | 'high'
          status: 'active' | 'completed' | 'cancelled'
          color: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          target_date?: string | null
          category?: 'savings' | 'investment' | 'debt_payoff' | 'purchase' | 'emergency_fund' | 'other' | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'active' | 'completed' | 'cancelled'
          color?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          category?: 'savings' | 'investment' | 'debt_payoff' | 'purchase' | 'emergency_fund' | 'other' | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'active' | 'completed' | 'cancelled'
          color?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goal_contributions: {
        Row: {
          id: string
          goal_id: string
          amount: number
          contribution_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          amount: number
          contribution_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          amount?: number
          contribution_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      paye_calculations: {
        Row: {
          id: string
          user_id: string
          gross_salary: number
          basic_salary: number | null
          housing_allowance: number
          transport_allowance: number
          other_allowances: number
          nssf_contribution: number | null
          nhif_contribution: number | null
          housing_levy: number | null
          taxable_income: number | null
          paye: number | null
          personal_relief: number | null
          insurance_relief: number
          net_paye: number | null
          net_salary: number | null
          calculation_date: string
          year: number
          month: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gross_salary: number
          basic_salary?: number | null
          housing_allowance?: number
          transport_allowance?: number
          other_allowances?: number
          nssf_contribution?: number | null
          nhif_contribution?: number | null
          housing_levy?: number | null
          taxable_income?: number | null
          paye?: number | null
          personal_relief?: number | null
          insurance_relief?: number
          net_paye?: number | null
          net_salary?: number | null
          calculation_date: string
          year: number
          month?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gross_salary?: number
          basic_salary?: number | null
          housing_allowance?: number
          transport_allowance?: number
          other_allowances?: number
          nssf_contribution?: number | null
          nhif_contribution?: number | null
          housing_levy?: number | null
          taxable_income?: number | null
          paye?: number | null
          personal_relief?: number | null
          insurance_relief?: number
          net_paye?: number | null
          net_salary?: number | null
          calculation_date?: string
          year?: number
          month?: number | null
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          reminder_date: string
          reminder_type: 'bill' | 'loan' | 'goal' | 'budget' | 'custom' | null
          related_id: string | null
          is_recurring: boolean
          recurring_frequency: string | null
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          reminder_date: string
          reminder_type?: 'bill' | 'loan' | 'goal' | 'budget' | 'custom' | null
          related_id?: string | null
          is_recurring?: boolean
          recurring_frequency?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          reminder_date?: string
          reminder_type?: 'bill' | 'loan' | 'goal' | 'budget' | 'custom' | null
          related_id?: string | null
          is_recurring?: boolean
          recurring_frequency?: string | null
          is_completed?: boolean
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          notifications_enabled: boolean
          email_notifications: boolean
          weekly_report: boolean
          monthly_report: boolean
          default_account_id: string | null
          fiscal_month_start: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          email_notifications?: boolean
          weekly_report?: boolean
          monthly_report?: boolean
          default_account_id?: string | null
          fiscal_month_start?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          email_notifications?: boolean
          weekly_report?: boolean
          monthly_report?: boolean
          default_account_id?: string | null
          fiscal_month_start?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type Account = Tables<'accounts'>
export type IncomeCategory = Tables<'income_categories'>
export type Income = Tables<'incomes'>
export type ExpenseCategory = Tables<'expense_categories'>
export type Expense = Tables<'expenses'>
export type Budget = Tables<'budgets'>
export type Loan = Tables<'loans'>
export type LoanPayment = Tables<'loan_payments'>
export type Goal = Tables<'goals'>
export type GoalContribution = Tables<'goal_contributions'>
export type PAYECalculation = Tables<'paye_calculations'>
export type Reminder = Tables<'reminders'>
export type UserSettings = Tables<'user_settings'>
