'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { Income } from '@/types'

type IncomeInsert = {
  amount: number
  date: string
  description?: string | null
  account_id?: string | null
  category_id?: string | null
  is_recurring?: boolean
  recurring_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | null
}

type IncomeUpdate = Partial<IncomeInsert>

interface IncomeWithRelations extends Income {
  accounts?: { name: string; color: string | null } | null
  income_categories?: { name: string; icon: string | null; color: string | null } | null
}

export function useIncome() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [incomes, setIncomes] = useState<IncomeWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all income records
  const fetchIncomes = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await (supabase
        .from('incomes') as any)
        .select(`
          *,
          accounts(name, color),
          income_categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      setIncomes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch income records')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  // Initial fetch
  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  // Create income
  const createIncome = async (income: IncomeInsert) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: insertError } = await (supabase
        .from('incomes') as any)
        .insert({ ...income, user_id: user.id })
        .select(`
          *,
          accounts(name, color),
          income_categories(name, icon, color)
        `)
        .single()

      if (insertError) throw insertError

      // Update account balance if account is linked
      if (income.account_id) {
        await (supabase as any).rpc('increment_account_balance', {
          account_id: income.account_id,
          amount: income.amount,
        }).catch(() => {
          // Fallback if RPC doesn't exist - update directly
          (supabase.from('accounts') as any)
            .select('balance')
            .eq('id', income.account_id)
            .single()
            .then(({ data: account }: { data: any }) => {
              if (account) {
                (supabase.from('accounts') as any)
                  .update({ balance: Number(account.balance) + Number(income.amount) })
                  .eq('id', income.account_id)
              }
            })
        })
      }

      setIncomes((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Update income
  const updateIncome = async (id: string, updates: IncomeUpdate) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: updateError } = await (supabase
        .from('incomes') as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          accounts(name, color),
          income_categories(name, icon, color)
        `)
        .single()

      if (updateError) throw updateError

      setIncomes((prev) =>
        prev.map((inc) => (inc.id === id ? data : inc))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Delete income
  const deleteIncome = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      // Get the income first to update account balance
      const incomeToDelete = incomes.find((inc) => inc.id === id)

      const { error: deleteError } = await (supabase
        .from('incomes') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // Update account balance if account was linked
      if (incomeToDelete?.account_id) {
        const { data: account } = await (supabase
          .from('accounts') as any)
          .select('balance')
          .eq('id', incomeToDelete.account_id)
          .single()

        if (account) {
          await (supabase
            .from('accounts') as any)
            .update({ balance: Number(account.balance) - Number(incomeToDelete.amount) })
            .eq('id', incomeToDelete.account_id)
        }
      }

      setIncomes((prev) => prev.filter((inc) => inc.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Get total income for current month
  const currentMonthTotal = incomes
    .filter((inc) => {
      const incomeDate = new Date(inc.date)
      const now = new Date()
      return (
        incomeDate.getMonth() === now.getMonth() &&
        incomeDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, inc) => sum + Number(inc.amount), 0)

  // Get income by category for current month
  const incomeByCategory = incomes
    .filter((inc) => {
      const incomeDate = new Date(inc.date)
      const now = new Date()
      return (
        incomeDate.getMonth() === now.getMonth() &&
        incomeDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((acc, inc) => {
      const categoryName = inc.income_categories?.name || 'Uncategorized'
      const existing = acc.find((item) => item.name === categoryName)
      if (existing) {
        existing.value += Number(inc.amount)
      } else {
        acc.push({
          name: categoryName,
          value: Number(inc.amount),
          color: inc.income_categories?.color || '#6B7280',
        })
      }
      return acc
    }, [] as { name: string; value: number; color: string }[])

  return {
    incomes,
    isLoading,
    error,
    currentMonthTotal,
    incomeByCategory,
    fetchIncomes,
    createIncome,
    updateIncome,
    deleteIncome,
  }
}
