'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import type { Goal, GoalContribution } from '@/types'

interface GoalWithContributions extends Goal {
  goal_contributions?: GoalContribution[]
  total_contributed: number
  progress_percentage: number
  remaining_amount: number
  days_until_target: number | null
  is_overdue: boolean
  monthly_target: number | null
}

interface ContributionWithGoal extends GoalContribution {
  goals?: Goal
}

export function useGoals() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const [goals, setGoals] = useState<GoalWithContributions[]>([])
  const [contributions, setContributions] = useState<ContributionWithGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateGoalDetails = useCallback((goal: Goal, goalContributions: GoalContribution[]): GoalWithContributions => {
    const total_contributed = goalContributions.reduce((sum, c) => sum + Number(c.amount), 0)
    const current_total = Number(goal.current_amount) + total_contributed
    const target = Number(goal.target_amount)

    const progress_percentage = target > 0 ? Math.min((current_total / target) * 100, 100) : 0
    const remaining_amount = Math.max(target - current_total, 0)

    // Calculate days until target date
    let days_until_target: number | null = null
    let is_overdue = false
    let monthly_target: number | null = null

    if (goal.target_date && goal.status === 'active') {
      const targetDate = new Date(goal.target_date)
      const today = new Date()
      const diffTime = targetDate.getTime() - today.getTime()
      days_until_target = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      is_overdue = days_until_target < 0 && remaining_amount > 0

      // Calculate monthly target needed to reach goal
      if (days_until_target > 0 && remaining_amount > 0) {
        const monthsRemaining = days_until_target / 30
        monthly_target = monthsRemaining > 0 ? remaining_amount / monthsRemaining : remaining_amount
      }
    }

    return {
      ...goal,
      current_amount: current_total,
      goal_contributions: goalContributions,
      total_contributed,
      progress_percentage,
      remaining_amount,
      days_until_target,
      is_overdue,
      monthly_target,
    }
  }, [])

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch goals
      const { data: goalsData, error: goalsError } = await (supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any)

      if (goalsError) throw goalsError

      // Fetch all contributions
      const { data: contributionsData, error: contributionsError } = await (supabase
        .from('goal_contributions')
        .select('*, goals(*)')
        .order('contribution_date', { ascending: false }) as any)

      if (contributionsError) throw contributionsError

      // Group contributions by goal
      const contributionsByGoal: Record<string, GoalContribution[]> = {}
      ;(contributionsData || []).forEach((contribution: ContributionWithGoal) => {
        if (!contributionsByGoal[contribution.goal_id]) {
          contributionsByGoal[contribution.goal_id] = []
        }
        contributionsByGoal[contribution.goal_id].push(contribution)
      })

      // Calculate details for each goal
      const goalsWithDetails = (goalsData || []).map((goal: Goal) =>
        calculateGoalDetails(goal, contributionsByGoal[goal.id] || [])
      )

      setGoals(goalsWithDetails)
      setContributions(contributionsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user, calculateGoalDetails])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Summary calculations
  const activeGoals = useMemo(() =>
    goals.filter(g => g.status === 'active'),
    [goals]
  )

  const completedGoals = useMemo(() =>
    goals.filter(g => g.status === 'completed'),
    [goals]
  )

  const totalTargetAmount = useMemo(() =>
    activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0),
    [activeGoals]
  )

  const totalCurrentAmount = useMemo(() =>
    activeGoals.reduce((sum, g) => sum + Number(g.current_amount), 0),
    [activeGoals]
  )

  const overdueGoals = useMemo(() =>
    activeGoals.filter(g => g.is_overdue),
    [activeGoals]
  )

  const upcomingGoals = useMemo(() =>
    activeGoals
      .filter(g => g.days_until_target !== null && g.days_until_target >= 0 && g.days_until_target <= 30)
      .sort((a, b) => (a.days_until_target || 0) - (b.days_until_target || 0)),
    [activeGoals]
  )

  const createGoal = async (data: {
    name: string
    description?: string | null
    target_amount: number
    current_amount?: number
    target_date?: string | null
    category?: 'savings' | 'investment' | 'debt_payoff' | 'purchase' | 'emergency_fund' | 'other' | null
    priority?: 'low' | 'medium' | 'high'
    color?: string | null
    icon?: string | null
  }) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data: goal, error } = await (supabase
        .from('goals') as any)
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          target_amount: data.target_amount,
          current_amount: data.current_amount || 0,
          target_date: data.target_date,
          category: data.category || 'savings',
          priority: data.priority || 'medium',
          status: 'active',
          color: data.color,
          icon: data.icon,
        })
        .select()
        .single()

      if (error) return { data: null, error }

      await fetchGoals()
      return { data: goal, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateGoal = async (
    id: string,
    data: Partial<{
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
    }>
  ) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data: goal, error } = await (supabase
        .from('goals') as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { data: null, error }

      await fetchGoals()
      return { data: goal, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteGoal = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      // First delete associated contributions
      await (supabase
        .from('goal_contributions') as any)
        .delete()
        .eq('goal_id', id)

      const { error } = await (supabase
        .from('goals') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) return { error }

      await fetchGoals()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const addContribution = async (data: {
    goal_id: string
    amount: number
    contribution_date: string
    notes?: string | null
  }) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data: contribution, error } = await (supabase
        .from('goal_contributions') as any)
        .insert({
          goal_id: data.goal_id,
          amount: data.amount,
          contribution_date: data.contribution_date,
          notes: data.notes,
        })
        .select()
        .single()

      if (error) return { data: null, error }

      // Check if goal should be marked as completed
      const goal = goals.find(g => g.id === data.goal_id)
      if (goal) {
        const newTotal = goal.current_amount + data.amount
        if (newTotal >= goal.target_amount) {
          await (supabase
            .from('goals') as any)
            .update({
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.goal_id)
        }
      }

      await fetchGoals()
      return { data: contribution, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteContribution = async (contributionId: string) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const contribution = contributions.find(c => c.id === contributionId)
      if (!contribution) return { error: new Error('Contribution not found') }

      const { error } = await (supabase
        .from('goal_contributions') as any)
        .delete()
        .eq('id', contributionId)

      if (error) return { error }

      // Check if goal should be reactivated
      const goal = goals.find(g => g.id === contribution.goal_id)
      if (goal && goal.status === 'completed') {
        const newTotal = goal.current_amount - Number(contribution.amount)
        if (newTotal < goal.target_amount) {
          await (supabase
            .from('goals') as any)
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', contribution.goal_id)
        }
      }

      await fetchGoals()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    goals,
    contributions,
    isLoading,
    error,
    activeGoals,
    completedGoals,
    overdueGoals,
    upcomingGoals,
    totalTargetAmount,
    totalCurrentAmount,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
    refetch: fetchGoals,
  }
}
