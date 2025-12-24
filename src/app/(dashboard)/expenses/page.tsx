'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Plus,
  TrendingDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses, useExpenseCategories, useAccounts } from '@/hooks'
import { ExpenseForm } from '@/components/forms'
import type { Expense } from '@/types'
import type { ExpenseFormData } from '@/lib/validations/expense'

export default function ExpensesPage() {
  const {
    expenses,
    isLoading,
    currentMonthTotal,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses()

  const {
    flatCategories: categories,
    isLoading: categoriesLoading,
    seedDefaultCategories,
  } = useExpenseCategories()

  const { accounts } = useAccounts()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

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
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleOpenDialog = (expense?: Expense) => {
    setSelectedExpense(expense)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedExpense(undefined)
    setIsDialogOpen(false)
  }

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedExpense) {
        const { error } = await updateExpense(selectedExpense.id, {
          amount: data.amount,
          description: data.description,
          date: data.date,
          account_id: data.account_id || null,
          category_id: data.category_id || null,
          is_recurring: data.is_recurring,
          recurring_frequency: data.is_recurring ? data.recurring_frequency : null,
        })
        if (error) {
          toast.error(error.message || 'Failed to update expense')
          return
        }
        toast.success('Expense updated successfully')
      } else {
        const { error } = await createExpense({
          amount: data.amount,
          description: data.description,
          date: data.date,
          account_id: data.account_id || null,
          category_id: data.category_id || null,
          is_recurring: data.is_recurring,
          recurring_frequency: data.is_recurring ? data.recurring_frequency : null,
        })
        if (error) {
          toast.error(error.message || 'Failed to add expense')
          return
        }
        toast.success('Expense added successfully')
      }
      handleCloseDialog()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return

    const { error } = await deleteExpense(expenseToDelete)
    if (error) {
      toast.error(error.message || 'Failed to delete expense')
    } else {
      toast.success('Expense deleted successfully')
    }
    setDeleteDialogOpen(false)
    setExpenseToDelete(null)
  }

  if (isLoading) {
    return <ExpensesPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Track and categorize your spending.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Month&apos;s Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(currentMonthTotal)}
              </p>
              <p className="text-sm text-muted-foreground">
                {expenses.filter((exp) => {
                  const d = new Date(exp.date)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length} transaction(s) this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      {expenses.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Expense Records</CardTitle>
            <CardDescription>
              All your expense transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {format(new Date(expense.date), 'dd MMM yyyy')}
                        {expense.is_recurring && (
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {expense.expense_categories ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: expense.expense_categories.color || '#6B7280',
                            color: expense.expense_categories.color || '#6B7280',
                          }}
                        >
                          {expense.expense_categories.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.description || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.accounts ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: expense.accounts.color || '#3B82F6' }}
                          />
                          {expense.accounts.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      -{formatCurrency(Number(expense.amount))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(expense)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(expense.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Expense Records</CardTitle>
            <CardDescription>
              You haven&apos;t recorded any expenses yet. Start tracking your spending habits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
              <TrendingDown className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No expense records found</p>
              <Button variant="outline" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Record Your First Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedExpense ? 'Edit Expense' : 'Add Expense'}
            </DialogTitle>
            <DialogDescription>
              {selectedExpense
                ? 'Update your expense record.'
                : 'Record a new expense transaction.'}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            expense={selectedExpense}
            accounts={accounts}
            categories={categories}
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
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense record? This action cannot be undone.
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

function ExpensesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
