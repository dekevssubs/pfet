'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Plus,
  Target,
  PiggyBank,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Shield,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  History,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { useGoals } from '@/hooks'
import { GoalForm, ContributionForm } from '@/components/forms/goal-form'
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from '@/lib/validations/goal'
import type { Goal, GoalContribution } from '@/types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount)

const getCategoryIcon = (category: string | null) => {
  switch (category) {
    case 'savings':
      return PiggyBank
    case 'investment':
      return TrendingUp
    case 'debt_payoff':
      return CreditCard
    case 'purchase':
      return ShoppingBag
    case 'emergency_fund':
      return Shield
    default:
      return Target
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }
}

const getPriorityBadge = (priority: string) => {
  const p = GOAL_PRIORITIES.find(pr => pr.value === priority)
  return (
    <Badge variant="outline" className="text-xs">
      <div
        className="h-2 w-2 rounded-full mr-1"
        style={{ backgroundColor: p?.color || '#6B7280' }}
      />
      {p?.label || priority}
    </Badge>
  )
}

export default function GoalsPage() {
  const {
    goals,
    contributions,
    isLoading,
    activeGoals,
    completedGoals,
    totalTargetAmount,
    totalCurrentAmount,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
  } = useGoals()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateGoal = async (data: any) => {
    setIsSubmitting(true)
    const { error } = await createGoal(data)
    setIsSubmitting(false)
    if (!error) {
      setIsCreateDialogOpen(false)
    }
  }

  const handleUpdateGoal = async (data: any) => {
    if (!selectedGoal) return
    setIsSubmitting(true)
    const { error } = await updateGoal(selectedGoal.id, data)
    setIsSubmitting(false)
    if (!error) {
      setIsEditDialogOpen(false)
      setSelectedGoal(null)
    }
  }

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return
    setIsSubmitting(true)
    const { error } = await deleteGoal(selectedGoal.id)
    setIsSubmitting(false)
    if (!error) {
      setIsDeleteDialogOpen(false)
      setSelectedGoal(null)
    }
  }

  const handleAddContribution = async (data: { amount: number; contribution_date: string; notes?: string }) => {
    if (!selectedGoal) return
    setIsSubmitting(true)
    const { error } = await addContribution({
      goal_id: selectedGoal.id,
      ...data,
    })
    setIsSubmitting(false)
    if (!error) {
      setIsContributionDialogOpen(false)
      setSelectedGoal(null)
    }
  }

  const handleStatusChange = async (goal: any, newStatus: 'active' | 'completed' | 'cancelled') => {
    await updateGoal(goal.id, { status: newStatus })
  }

  const handleDeleteContribution = async (contributionId: string) => {
    await deleteContribution(contributionId)
  }

  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Goals</h2>
          <p className="text-muted-foreground">
            Set and track your savings and investment goals.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoals.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTargetAmount)}</div>
            <p className="text-xs text-muted-foreground">Across all active goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalTargetAmount - totalCurrentAmount)} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
          <TabsTrigger value="all">All Goals ({goals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No active goals</p>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  contributions={contributions.filter(c => c.goal_id === goal.id)}
                  isExpanded={expandedGoal === goal.id}
                  onToggleExpand={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  onEdit={() => {
                    setSelectedGoal(goal)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => {
                    setSelectedGoal(goal)
                    setIsDeleteDialogOpen(true)
                  }}
                  onAddContribution={() => {
                    setSelectedGoal(goal)
                    setIsContributionDialogOpen(true)
                  }}
                  onStatusChange={(status) => handleStatusChange(goal, status)}
                  onDeleteContribution={handleDeleteContribution}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[200px]">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed goals yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  contributions={contributions.filter(c => c.goal_id === goal.id)}
                  isExpanded={expandedGoal === goal.id}
                  onToggleExpand={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  onEdit={() => {
                    setSelectedGoal(goal)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => {
                    setSelectedGoal(goal)
                    setIsDeleteDialogOpen(true)
                  }}
                  onAddContribution={() => {
                    setSelectedGoal(goal)
                    setIsContributionDialogOpen(true)
                  }}
                  onStatusChange={(status) => handleStatusChange(goal, status)}
                  onDeleteContribution={handleDeleteContribution}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No goals created</p>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  contributions={contributions.filter(c => c.goal_id === goal.id)}
                  isExpanded={expandedGoal === goal.id}
                  onToggleExpand={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  onEdit={() => {
                    setSelectedGoal(goal)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={() => {
                    setSelectedGoal(goal)
                    setIsDeleteDialogOpen(true)
                  }}
                  onAddContribution={() => {
                    setSelectedGoal(goal)
                    setIsContributionDialogOpen(true)
                  }}
                  onStatusChange={(status) => handleStatusChange(goal, status)}
                  onDeleteContribution={handleDeleteContribution}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Goal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a financial goal to track your progress.
            </DialogDescription>
          </DialogHeader>
          <GoalForm
            onSubmit={handleCreateGoal}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your goal details.
            </DialogDescription>
          </DialogHeader>
          {selectedGoal && (
            <GoalForm
              goal={selectedGoal}
              onSubmit={handleUpdateGoal}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedGoal(null)
              }}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Contribution Dialog */}
      <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Record a contribution to &quot;{selectedGoal?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          {selectedGoal && (
            <ContributionForm
              goalId={selectedGoal.id}
              onSubmit={handleAddContribution}
              onCancel={() => {
                setIsContributionDialogOpen(false)
                setSelectedGoal(null)
              }}
              isLoading={isSubmitting}
              remainingAmount={selectedGoal.remaining_amount}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Goal Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedGoal?.name}&quot;? This will also delete
              all contribution history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Goal Card Component
interface GoalCardProps {
  goal: any
  contributions: GoalContribution[]
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  onAddContribution: () => void
  onStatusChange: (status: 'active' | 'completed' | 'cancelled') => void
  onDeleteContribution: (id: string) => void
}

function GoalCard({
  goal,
  contributions,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddContribution,
  onStatusChange,
  onDeleteContribution,
}: GoalCardProps) {
  const Icon = getCategoryIcon(goal.category)
  const categoryInfo = GOAL_CATEGORIES.find(c => c.value === goal.category)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              <Icon className="h-5 w-5" style={{ color: goal.color }} />
            </div>
            <div>
              <CardTitle className="text-lg">{goal.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {categoryInfo?.label || 'Other'}
                {getPriorityBadge(goal.priority)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(goal.status)}>
              {goal.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {goal.status === 'active' && (
                  <DropdownMenuItem onClick={onAddContribution}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contribution
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {goal.status === 'active' && (
                  <>
                    <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Goal
                    </DropdownMenuItem>
                  </>
                )}
                {goal.status !== 'active' && (
                  <DropdownMenuItem onClick={() => onStatusChange('active')}>
                    <Target className="mr-2 h-4 w-4" />
                    Reactivate Goal
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        )}

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{goal.progress_percentage.toFixed(1)}%</span>
          </div>
          <Progress
            value={goal.progress_percentage}
            className="h-3"
            style={{
              ['--progress-background' as any]: goal.color,
            }}
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(goal.current_amount)} saved
            </span>
            <span className="font-medium">
              {formatCurrency(goal.target_amount)} target
            </span>
          </div>
        </div>

        {/* Timeline Info */}
        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Target:</span>
            <span>{format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
            {goal.is_overdue && goal.status === 'active' && (
              <Badge variant="destructive" className="ml-auto">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
            {goal.days_until_target !== null && goal.days_until_target >= 0 && goal.status === 'active' && (
              <Badge variant="outline" className="ml-auto">
                {goal.days_until_target} days left
              </Badge>
            )}
          </div>
        )}

        {/* Monthly Target */}
        {goal.monthly_target && goal.status === 'active' && (
          <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-lg">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Monthly target:</span>
            <span className="font-medium">{formatCurrency(goal.monthly_target)}</span>
          </div>
        )}

        {/* Contribution History */}
        {contributions.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>Contribution History ({contributions.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {contributions.slice(0, 5).map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded-lg"
                >
                  <div>
                    <span className="font-medium">
                      {formatCurrency(Number(contribution.amount))}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {format(new Date(contribution.contribution_date), 'MMM d, yyyy')}
                    </span>
                    {contribution.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {contribution.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeleteContribution(contribution.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {contributions.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  And {contributions.length - 5} more contributions...
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Quick Add Button */}
        {goal.status === 'active' && (
          <Button variant="outline" className="w-full" onClick={onAddContribution}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contribution
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
