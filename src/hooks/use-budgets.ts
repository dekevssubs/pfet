'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { Budget, Expense } from '@/types'

type BudgetInsert = {
  category_id: string
  amount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string | null
  alert_threshold?: number
}

type BudgetUpdate = Partial<BudgetInsert>

interface BudgetWithCategory extends Budget {
  expense_categories?: {
    name: string
    icon: string | null
    color: string | null
  } | null
}

interface BudgetWithSpending extends BudgetWithCategory {
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
  isNearLimit: boolean
}

export function useBudgets() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all budgets
  const fetchBudgets = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await (supabase
        .from('budgets') as any)
        .select(`
          *,
          expense_categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setBudgets(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  // Fetch expenses for budget calculations
  const fetchExpenses = useCallback(async () => {
    if (!user) return

    try {
      const { data, error: fetchError } = await (supabase
        .from('expenses') as any)
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) throw fetchError

      setExpenses(data || [])
    } catch (err) {
      console.error('Failed to fetch expenses for budget:', err)
    }
  }, [supabase, user])

  // Initial fetch
  useEffect(() => {
    fetchBudgets()
    fetchExpenses()
  }, [fetchBudgets, fetchExpenses])

  // Calculate spending for each budget
  const budgetsWithSpending: BudgetWithSpending[] = useMemo(() => {
    return budgets.map((budget) => {
      // Get date range based on period
      const now = new Date()
      let startDate: Date
      let endDate: Date = now

      switch (budget.period) {
        case 'weekly':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          break
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      // Calculate spent amount for this category in the period
      const spent = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date)
          return (
            exp.category_id === budget.category_id &&
            expDate >= startDate &&
            expDate <= endDate
          )
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0)

      const remaining = Math.max(0, budget.amount - spent)
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      const isOverBudget = spent > budget.amount
      const isNearLimit = percentage >= budget.alert_threshold && !isOverBudget

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget,
        isNearLimit,
      }
    })
  }, [budgets, expenses])

  // Create budget
  const createBudget = async (budget: BudgetInsert) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      // Check if budget already exists for this category
      const existing = budgets.find((b) => b.category_id === budget.category_id)
      if (existing) {
        return { data: null, error: new Error('A budget already exists for this category') }
      }

      const { data, error: insertError } = await (supabase
        .from('budgets') as any)
        .insert({
          ...budget,
          user_id: user.id,
          alert_threshold: budget.alert_threshold || 80,
        })
        .select(`
          *,
          expense_categories(name, icon, color)
        `)
        .single()

      if (insertError) throw insertError

      setBudgets((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Update budget
  const updateBudget = async (id: string, updates: BudgetUpdate) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: updateError } = await (supabase
        .from('budgets') as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          expense_categories(name, icon, color)
        `)
        .single()

      if (updateError) throw updateError

      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? data : b))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Delete budget
  const deleteBudget = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const { error: deleteError } = await (supabase
        .from('budgets') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setBudgets((prev) => prev.filter((b) => b.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Get budgets that are over or near limit
  const alertBudgets = budgetsWithSpending.filter(
    (b) => b.isOverBudget || b.isNearLimit
  )

  // Get total budgeted amount for current month
  const totalBudgeted = budgets
    .filter((b) => b.period === 'monthly')
    .reduce((sum, b) => sum + Number(b.amount), 0)

  // Get total spent across all budgets
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0)

  return {
    budgets: budgetsWithSpending,
    alertBudgets,
    totalBudgeted,
    totalSpent,
    isLoading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    refetchExpenses: fetchExpenses,
  }
}
