'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Target,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useBudgets, useExpenseCategories } from '@/hooks'
import { BudgetForm } from '@/components/forms/budget-form'
import type { Budget } from '@/types'
import type { BudgetFormData } from '@/lib/validations/budget'

export function useBudgetsHook() {
  return useBudgets()
}

export default function BudgetsPage() {
  const {
    budgets,
    alertBudgets,
    totalBudgeted,
    totalSpent,
    isLoading,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets()

  const {
    flatCategories: categories,
    isLoading: categoriesLoading,
    seedDefaultCategories,
  } = useExpenseCategories()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)

  // Seed default categories if none exist
  useEffect(() => {
    if (!categoriesLoading && categories.length === 0) {
      seedDefaultCategories()
    }
  }, [categoriesLoading, categories.length, seedDefaultCategories])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleOpenDialog = (budget?: Budget) => {
    setSelectedBudget(budget)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedBudget(undefined)
    setIsDialogOpen(false)
  }

  const handleSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedBudget) {
        const { error } = await updateBudget(selectedBudget.id, {
          amount: data.amount,
          period: data.period,
          start_date: data.start_date,
          end_date: data.end_date,
          alert_threshold: data.alert_threshold,
        })
        if (error) {
          toast.error(error.message || 'Failed to update budget')
          return
        }
        toast.success('Budget updated successfully')
      } else {
        const { error } = await createBudget({
          category_id: data.category_id,
          amount: data.amount,
          period: data.period,
          start_date: data.start_date,
          end_date: data.end_date,
          alert_threshold: data.alert_threshold,
        })
        if (error) {
          toast.error(error.message || 'Failed to create budget')
          return
        }
        toast.success('Budget created successfully')
      }
      handleCloseDialog()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return

    const { error } = await deleteBudget(budgetToDelete)
    if (error) {
      toast.error(error.message || 'Failed to delete budget')
    } else {
      toast.success('Budget deleted successfully')
    }
    setDeleteDialogOpen(false)
    setBudgetToDelete(null)
  }

  const existingCategoryIds = budgets.map((b) => b.category_id)

  if (isLoading) {
    return <BudgetsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Set spending limits and track your progress.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budgeted (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</div>
            <p className="text-xs text-muted-foreground">
              Across {budgets.filter((b) => b.period === 'monthly').length} monthly budget(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudgeted > 0
                ? `${Math.round((totalSpent / totalBudgeted) * 100)}% of budget used`
                : 'No budgets set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {alertBudgets.length > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="text-2xl font-bold text-amber-600">
                    {alertBudgets.length}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">0</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {alertBudgets.length > 0
                ? 'Budget(s) near or over limit'
                : 'All budgets on track'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget List */}
      {budgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card
              key={budget.id}
              className={
                budget.isOverBudget
                  ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                  : budget.isNearLimit
                  ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20'
                  : ''
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: budget.expense_categories?.color || '#6B7280',
                      }}
                    />
                    <CardTitle className="text-base">
                      {budget.expense_categories?.name || 'Unknown'}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(budget)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(budget.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="capitalize">
                  {budget.period} budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <Progress
                    value={budget.percentage}
                    className={`h-2 ${
                      budget.isOverBudget
                        ? '[&>div]:bg-red-500'
                        : budget.isNearLimit
                        ? '[&>div]:bg-amber-500'
                        : '[&>div]:bg-green-500'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {budget.percentage.toFixed(0)}% used
                    </span>
                    {budget.isOverBudget ? (
                      <Badge variant="destructive" className="text-xs">
                        Over Budget
                      </Badge>
                    ) : budget.isNearLimit ? (
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                        Near Limit
                      </Badge>
                    ) : (
                      <span className="text-xs text-green-600">
                        {formatCurrency(budget.remaining)} left
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Budgets</CardTitle>
            <CardDescription>
              You haven&apos;t set up any budgets yet. Create budgets to control your spending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No budgets created</p>
              <Button variant="outline" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Budget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBudget ? 'Edit Budget' : 'Create Budget'}
            </DialogTitle>
            <DialogDescription>
              {selectedBudget
                ? 'Update your budget settings.'
                : 'Set a spending limit for a category.'}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm
            budget={selectedBudget}
            categories={categories}
            existingCategoryIds={existingCategoryIds}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function BudgetsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}
