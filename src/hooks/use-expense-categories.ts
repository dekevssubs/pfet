'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { ExpenseCategory } from '@/types'
import { DEFAULT_EXPENSE_CATEGORIES } from '@/lib/constants'

interface ExpenseCategoryWithChildren extends ExpenseCategory {
  children?: ExpenseCategoryWithChildren[]
}

export function useExpenseCategories() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<ExpenseCategoryWithChildren[]>([])
  const [flatCategories, setFlatCategories] = useState<ExpenseCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Build tree structure from flat categories
  const buildCategoryTree = (flatList: ExpenseCategory[]): ExpenseCategoryWithChildren[] => {
    const map = new Map<string, ExpenseCategoryWithChildren>()
    const roots: ExpenseCategoryWithChildren[] = []

    // First pass: create map of all categories
    flatList.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] })
    })

    // Second pass: build tree
    flatList.forEach((cat) => {
      const node = map.get(cat.id)!
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children!.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  // Fetch all expense categories
  const fetchCategories = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await (supabase
        .from('expense_categories') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      const flat = data || []
      setFlatCategories(flat)
      setCategories(buildCategoryTree(flat))
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
      const categoriesToInsert: any[] = []

      // Process categories with their subcategories
      DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
        // Add parent category
        const parentId = crypto.randomUUID()
        categoriesToInsert.push({
          id: parentId,
          user_id: user.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          parent_id: null,
          is_system: true,
        })

        // Add subcategories if any
        if (cat.subcategories) {
          cat.subcategories.forEach((subcat) => {
            categoriesToInsert.push({
              id: crypto.randomUUID(),
              user_id: user.id,
              name: subcat,
              icon: cat.icon,
              color: cat.color,
              parent_id: parentId,
              is_system: true,
            })
          })
        }
      })

      const { data, error: insertError } = await (supabase
        .from('expense_categories') as any)
        .insert(categoriesToInsert)
        .select()

      if (insertError) throw insertError

      const flat = data || []
      setFlatCategories(flat)
      setCategories(buildCategoryTree(flat))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Create category
  const createCategory = async (category: {
    name: string
    icon?: string
    color?: string
    parent_id?: string | null
  }) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: insertError } = await (supabase
        .from('expense_categories') as any)
        .insert({
          user_id: user.id,
          name: category.name,
          icon: category.icon || 'Receipt',
          color: category.color || '#6B7280',
          parent_id: category.parent_id || null,
          is_system: false,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newFlat = [...flatCategories, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
      setFlatCategories(newFlat)
      setCategories(buildCategoryTree(newFlat))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  // Update category
  const updateCategory = async (
    id: string,
    updates: { name?: string; icon?: string; color?: string; parent_id?: string | null }
  ) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error: updateError } = await (supabase
        .from('expense_categories') as any)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      const newFlat = flatCategories.map((cat) =>
        cat.id === id ? data : cat
      )
      setFlatCategories(newFlat)
      setCategories(buildCategoryTree(newFlat))
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
        .from('expense_categories') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // Remove category and its children
      const idsToRemove = new Set<string>([id])
      flatCategories.forEach((cat) => {
        if (cat.parent_id && idsToRemove.has(cat.parent_id)) {
          idsToRemove.add(cat.id)
        }
      })

      const newFlat = flatCategories.filter((cat) => !idsToRemove.has(cat.id))
      setFlatCategories(newFlat)
      setCategories(buildCategoryTree(newFlat))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    categories,
    flatCategories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    seedDefaultCategories,
  }
}
