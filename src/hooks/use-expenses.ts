'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { Expense } from '@/types'

type ExpenseInsert = {
  amount: number
  date: string
  description?: string | null
  account_id?: string | null
  category_id?: string | null
  is_recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
}

type ExpenseUpdate = Partial<ExpenseInsert>

interface ExpenseWithRelations extends Expense {
  accounts?: { name: string; color: string | null } | null
  expense_categories?: { name: string; icon: string | null; color: string | null; parent_id: string | null } | null
}

export function useExpenses() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all expense records
  const fetchExpenses = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await (supabase
        .from('expenses') as any)
        .select(`
          *,
          accounts(name, color),
          expense_categories(name, icon, color, parent_id)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      setExpenses(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expense records')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  // Initial fetch
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Create expense
  const createExpense = async (expense: ExpenseInsert) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: insertError } = await (supabase
        .from('expenses') as any)
        .insert({ ...expense, user_id: user.id })
        .select(`
          *,
          accounts(name, color),
          expense_categories(name, icon, color, parent_id)
        `)
        .single()

      if (insertError) throw insertError

      // Update account balance if account is linked (subtract expense)
      if (expense.account_id) {
        const { data: account } = await (supabase
          .from('accounts') as any)
          .select('balance')
          .eq('id', expense.account_id)
          .single()

        if (account) {
          await (supabase
            .from('accounts') as any)
            .update({ balance: Number(account.balance) - Number(expense.amount) })
            .eq('id', expense.account_id)
        }
      }

      setExpenses((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Update expense
  const updateExpense = async (id: string, updates: ExpenseUpdate) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: updateError } = await (supabase
        .from('expenses') as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          accounts(name, color),
          expense_categories(name, icon, color, parent_id)
        `)
        .single()

      if (updateError) throw updateError

      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? data : exp))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Delete expense
  const deleteExpense = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      // Get the expense first to update account balance
      const expenseToDelete = expenses.find((exp) => exp.id === id)

      const { error: deleteError } = await (supabase
        .from('expenses') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // Restore account balance if account was linked
      if (expenseToDelete?.account_id) {
        const { data: account } = await (supabase
          .from('accounts') as any)
          .select('balance')
          .eq('id', expenseToDelete.account_id)
          .single()

        if (account) {
          await (supabase
            .from('accounts') as any)
            .update({ balance: Number(account.balance) + Number(expenseToDelete.amount) })
            .eq('id', expenseToDelete.account_id)
        }
      }

      setExpenses((prev) => prev.filter((exp) => exp.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Get total expenses for current month
  const currentMonthTotal = expenses
    .filter((exp) => {
      const expenseDate = new Date(exp.date)
      const now = new Date()
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  // Get expenses by category for current month
  const expensesByCategory = expenses
    .filter((exp) => {
      const expenseDate = new Date(exp.date)
      const now = new Date()
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((acc, exp) => {
      const categoryName = exp.expense_categories?.name || 'Uncategorized'
      const existing = acc.find((item) => item.name === categoryName)
      if (existing) {
        existing.value += Number(exp.amount)
      } else {
        acc.push({
          name: categoryName,
          value: Number(exp.amount),
          color: exp.expense_categories?.color || '#6B7280',
        })
      }
      return acc
    }, [] as { name: string; value: number; color: string }[])

  return {
    expenses,
    isLoading,
    error,
    currentMonthTotal,
    expensesByCategory,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
