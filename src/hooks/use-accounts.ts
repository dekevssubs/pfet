'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { Account } from '@/types'

type AccountInsert = {
  name: string
  type: 'primary' | 'secondary' | 'savings' | 'investment' | 'sacco'
  bank_name?: string | null
  account_number?: string | null
  balance?: number
  color?: string | null
  icon?: string | null
}

type AccountUpdate = Partial<AccountInsert> & { is_default?: boolean }

export function useAccounts() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all accounts
  const fetchAccounts = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await (supabase
        .from('accounts') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setAccounts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Initial fetch
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // Create account
  const createAccount = async (account: AccountInsert) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: insertError } = await (supabase
        .from('accounts') as any)
        .insert({ ...account, user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError

      setAccounts((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Update account
  const updateAccount = async (id: string, updates: AccountUpdate) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: updateError } = await (supabase
        .from('accounts') as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setAccounts((prev) =>
        prev.map((acc) => (acc.id === id ? data : acc))
      )
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Delete account
  const deleteAccount = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const { error: deleteError } = await (supabase
        .from('accounts') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setAccounts((prev) => prev.filter((acc) => acc.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Set default account
  const setDefaultAccount = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      // First, unset all defaults
      await (supabase
        .from('accounts') as any)
        .update({ is_default: false })
        .eq('user_id', user.id)

      // Then set the new default
      const { error: updateError } = await (supabase
        .from('accounts') as any)
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          is_default: acc.id === id,
        }))
      )
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Get total balance
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)

  // Get default account
  const defaultAccount = accounts.find((acc) => acc.is_default) || accounts[0]

  return {
    accounts,
    isLoading,
    error,
    totalBalance,
    defaultAccount,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
  }
}
