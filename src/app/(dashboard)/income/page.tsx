'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Plus,
  TrendingUp,
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
import { useIncome, useIncomeCategories, useAccounts } from '@/hooks'
import { IncomeForm } from '@/components/forms'
import type { Income } from '@/types'
import type { IncomeFormData } from '@/lib/validations/income'

export default function IncomePage() {
  const {
    incomes,
    isLoading,
    currentMonthTotal,
    createIncome,
    updateIncome,
    deleteIncome,
  } = useIncome()

  const {
    categories,
    isLoading: categoriesLoading,
    seedDefaultCategories,
  } = useIncomeCategories()

  const { accounts } = useAccounts()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<Income | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null)

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

  const handleOpenDialog = (income?: Income) => {
    setSelectedIncome(income)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedIncome(undefined)
    setIsDialogOpen(false)
  }

  const handleSubmit = async (data: IncomeFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedIncome) {
        const { error } = await updateIncome(selectedIncome.id, {
          amount: data.amount,
          description: data.description,
          date: data.date,
          account_id: data.account_id || null,
          category_id: data.category_id || null,
          is_recurring: data.is_recurring,
          recurring_frequency: data.is_recurring ? data.recurring_frequency : null,
        })
        if (error) {
          toast.error(error.message || 'Failed to update income')
          return
        }
        toast.success('Income updated successfully')
      } else {
        const { error } = await createIncome({
          amount: data.amount,
          description: data.description,
          date: data.date,
          account_id: data.account_id || null,
          category_id: data.category_id || null,
          is_recurring: data.is_recurring,
          recurring_frequency: data.is_recurring ? data.recurring_frequency : null,
        })
        if (error) {
          toast.error(error.message || 'Failed to add income')
          return
        }
        toast.success('Income added successfully')
      }
      handleCloseDialog()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setIncomeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!incomeToDelete) return

    const { error } = await deleteIncome(incomeToDelete)
    if (error) {
      toast.error(error.message || 'Failed to delete income')
    } else {
      toast.success('Income deleted successfully')
    }
    setDeleteDialogOpen(false)
    setIncomeToDelete(null)
  }

  if (isLoading) {
    return <IncomePageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground">
            Track all your income sources.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Month&apos;s Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(currentMonthTotal)}
              </p>
              <p className="text-sm text-muted-foreground">
                {incomes.filter((inc) => {
                  const d = new Date(inc.date)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length} transaction(s) this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Table */}
      {incomes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Income Records</CardTitle>
            <CardDescription>
              All your income transactions
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
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {format(new Date(income.date), 'dd MMM yyyy')}
                        {income.is_recurring && (
                          <RefreshCw className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {income.income_categories ? (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: income.income_categories.color || '#6B7280',
                            color: income.income_categories.color || '#6B7280',
                          }}
                        >
                          {income.income_categories.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {income.description || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {income.accounts ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: income.accounts.color || '#3B82F6' }}
                          />
                          {income.accounts.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +{formatCurrency(Number(income.amount))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(income)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(income.id)}
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
            <CardTitle>Income Records</CardTitle>
            <CardDescription>
              You haven&apos;t recorded any income yet. Start by adding your salary or other income sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No income records found</p>
              <Button variant="outline" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Record Your First Income
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Income Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedIncome ? 'Edit Income' : 'Add Income'}
            </DialogTitle>
            <DialogDescription>
              {selectedIncome
                ? 'Update your income record.'
                : 'Record a new income transaction.'}
            </DialogDescription>
          </DialogHeader>
          <IncomeForm
            income={selectedIncome}
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
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income record? This action cannot be undone.
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

function IncomePageSkeleton() {
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
