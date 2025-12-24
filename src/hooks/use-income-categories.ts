'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { IncomeCategory } from '@/types'
import { DEFAULT_INCOME_CATEGORIES } from '@/lib/constants'

export function useIncomeCategories() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<IncomeCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all income categories
  const fetchCategories = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await (supabase
        .from('income_categories') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  // Initial fetch
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Seed default categories if none exist
  const seedDefaultCategories = async () => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const categoriesToInsert = DEFAULT_INCOME_CATEGORIES.map((cat) => ({
        user_id: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_system: true,
      }))

      const { data, error: insertError } = await (supabase
        .from('income_categories') as any)
        .insert(categoriesToInsert)
        .select()

      if (insertError) throw insertError

      setCategories(data || [])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Create category
  const createCategory = async (category: { name: string; icon?: string; color?: string }) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: insertError } = await (supabase
        .from('income_categories') as any)
        .insert({
          user_id: user.id,
          name: category.name,
          icon: category.icon || 'CircleDollarSign',
          color: category.color || '#6B7280',
          is_system: false,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Delete category
  const deleteCategory = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const { error: deleteError } = await (supabase
        .from('income_categories') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory,
    seedDefaultCategories,
  }
}
