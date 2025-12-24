'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Plus,
  HandCoins,
  Banknote,
  MoreHorizontal,
  Pencil,
  Trash2,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Phone,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useLoans } from '@/hooks'
import { LoanForm, PaymentForm } from '@/components/forms/loan-form'
import type { Loan } from '@/types'
import type { LoanFormData } from '@/lib/validations/loan'
import { LOAN_STATUSES } from '@/lib/validations/loan'

export default function LoansPage() {
  const {
    loans,
    isLoading,
    totalLent,
    totalBorrowed,
    overdueLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    addPayment,
  } = useLoans()

  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>()
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [loanToUpdateStatus, setLoanToUpdateStatus] = useState<{ id: string; status: string } | null>(null)
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleOpenLoanDialog = (loan?: Loan) => {
    setSelectedLoan(loan)
    setIsLoanDialogOpen(true)
  }

  const handleCloseLoanDialog = () => {
    setSelectedLoan(undefined)
    setIsLoanDialogOpen(false)
  }

  const handleOpenPaymentDialog = (loanId: string) => {
    setSelectedLoanForPayment(loanId)
    setIsPaymentDialogOpen(true)
  }

  const handleClosePaymentDialog = () => {
    setSelectedLoanForPayment(null)
    setIsPaymentDialogOpen(false)
  }

  const handleLoanSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedLoan) {
        const { error } = await updateLoan(selectedLoan.id, {
          person_name: data.person_name,
          person_contact: data.person_contact,
          principal_amount: data.principal_amount,
          interest_rate: data.interest_rate,
          date_issued: data.date_issued,
          due_date: data.due_date,
          notes: data.notes,
        })
        if (error) {
          toast.error(error.message || 'Failed to update loan')
          return
        }
        toast.success('Loan updated successfully')
      } else {
        const { error } = await createLoan(data)
        if (error) {
          toast.error(error.message || 'Failed to create loan')
          return
        }
        toast.success('Loan created successfully')
      }
      handleCloseLoanDialog()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSubmit = async (data: { amount: number; payment_date: string; notes?: string }) => {
    if (!selectedLoanForPayment) return

    setIsSubmitting(true)
    try {
      const { error } = await addPayment({
        loan_id: selectedLoanForPayment,
        ...data,
      })
      if (error) {
        toast.error(error.message || 'Failed to record payment')
        return
      }
      toast.success('Payment recorded successfully')
      handleClosePaymentDialog()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setLoanToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!loanToDelete) return

    const { error } = await deleteLoan(loanToDelete)
    if (error) {
      toast.error(error.message || 'Failed to delete loan')
    } else {
      toast.success('Loan deleted successfully')
    }
    setDeleteDialogOpen(false)
    setLoanToDelete(null)
  }

  const handleStatusClick = (id: string, currentStatus: string) => {
    setLoanToUpdateStatus({ id, status: currentStatus })
    setStatusDialogOpen(true)
  }

  const handleStatusChange = async (newStatus: 'active' | 'paid' | 'defaulted' | 'forgiven') => {
    if (!loanToUpdateStatus) return

    const { error } = await updateLoan(loanToUpdateStatus.id, { status: newStatus })
    if (error) {
      toast.error(error.message || 'Failed to update status')
    } else {
      toast.success('Loan status updated')
    }
    setStatusDialogOpen(false)
    setLoanToUpdateStatus(null)
  }

  const toggleLoanExpanded = (loanId: string) => {
    setExpandedLoans((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(loanId)) {
        newSet.delete(loanId)
      } else {
        newSet.add(loanId)
      }
      return newSet
    })
  }

  const getStatusBadge = (loan: any) => {
    if (loan.status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid Off</Badge>
    }
    if (loan.status === 'forgiven') {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Forgiven</Badge>
    }
    if (loan.status === 'defaulted') {
      return <Badge variant="destructive">Defaulted</Badge>
    }
    if (loan.is_overdue) {
      return <Badge variant="destructive">Overdue</Badge>
    }
    if (loan.days_until_due !== null && loan.days_until_due <= 7) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Due Soon</Badge>
    }
    return <Badge variant="outline">Active</Badge>
  }

  const renderLoanCard = (loan: any) => {
    const percentPaid = (loan.total_paid / loan.total_with_interest) * 100
    const isExpanded = expandedLoans.has(loan.id)

    return (
      <Card
        key={loan.id}
        className={
          loan.is_overdue
            ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
            : loan.status === 'paid'
            ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'
            : ''
        }
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {loan.type === 'lent' ? (
                <HandCoins className="h-5 w-5 text-green-600" />
              ) : (
                <Banknote className="h-5 w-5 text-orange-600" />
              )}
              <div>
                <CardTitle className="text-base">{loan.person_name}</CardTitle>
                {loan.person_contact && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {loan.person_contact}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(loan)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {loan.status === 'active' && (
                    <DropdownMenuItem onClick={() => handleOpenPaymentDialog(loan.id)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleOpenLoanDialog(loan)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusClick(loan.id, loan.status)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Change Status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(loan.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>
            {loan.type === 'lent' ? 'You lent' : 'You borrowed'} on{' '}
            {format(new Date(loan.date_issued), 'MMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Principal</p>
              <p className="font-medium">{formatCurrency(loan.principal_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Interest ({loan.interest_rate}%)</p>
              <p className="font-medium">
                {formatCurrency(loan.total_with_interest - loan.principal_amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Due</p>
              <p className="font-semibold">{formatCurrency(loan.total_with_interest)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Outstanding</p>
              <p className={`font-semibold ${loan.outstanding_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(loan.outstanding_balance)}
              </p>
            </div>
          </div>

          {loan.status === 'active' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Progress</span>
                <span className="font-medium">{percentPaid.toFixed(0)}%</span>
              </div>
              <Progress value={percentPaid} className="h-2" />
            </div>
          )}

          {loan.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Due: {format(new Date(loan.due_date), 'MMM dd, yyyy')}
                {loan.days_until_due !== null && loan.status === 'active' && (
                  <span className={loan.days_until_due < 0 ? 'text-red-600 ml-1' : 'ml-1'}>
                    ({loan.days_until_due < 0 ? `${Math.abs(loan.days_until_due)} days overdue` : `${loan.days_until_due} days left`})
                  </span>
                )}
              </span>
            </div>
          )}

          {loan.notes && (
            <p className="text-sm text-muted-foreground border-t pt-2">{loan.notes}</p>
          )}

          {/* Payment History */}
          {loan.loan_payments && loan.loan_payments.length > 0 && (
            <Collapsible open={isExpanded} onOpenChange={() => toggleLoanExpanded(loan.id)}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>Payment History ({loan.loan_payments.length})</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {loan.loan_payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between text-sm border-l-2 border-green-500 pl-3 py-1"
                  >
                    <div>
                      <p className="font-medium text-green-600">
                        +{formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    {payment.notes && (
                      <p className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {loan.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleOpenPaymentDialog(loan.id)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const lentLoans = loans.filter((l) => l.type === 'lent')
  const borrowedLoans = loans.filter((l) => l.type === 'borrowed')

  if (isLoading) {
    return <LoansPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Loans</h2>
          <p className="text-muted-foreground">
            Track money you&apos;ve lent or borrowed from friends and family.
          </p>
        </div>
        <Button onClick={() => handleOpenLoanDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Money You&apos;re Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalLent)}</div>
            <p className="text-xs text-muted-foreground">
              From {lentLoans.filter((l) => l.status === 'active').length} active loan(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Money You Owe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalBorrowed)}</div>
            <p className="text-xs text-muted-foreground">
              To {borrowedLoans.filter((l) => l.status === 'active').length} active loan(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {overdueLoans.length > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold text-red-600">{overdueLoans.length}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">0</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueLoans.length > 0 ? 'Loan(s) past due date' : 'All loans on schedule'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loans Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Loans ({loans.length})</TabsTrigger>
          <TabsTrigger value="lent">Money Lent ({lentLoans.length})</TabsTrigger>
          <TabsTrigger value="borrowed">Money Borrowed ({borrowedLoans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loans.map(renderLoanCard)}
            </div>
          ) : (
            <EmptyState onAdd={() => handleOpenLoanDialog()} />
          )}
        </TabsContent>

        <TabsContent value="lent">
          {lentLoans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lentLoans.map(renderLoanCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <HandCoins className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No money lent recorded</p>
                <Button variant="outline" onClick={() => handleOpenLoanDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Money Lent
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="borrowed">
          {borrowedLoans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {borrowedLoans.map(renderLoanCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <Banknote className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No money borrowed recorded</p>
                <Button variant="outline" onClick={() => handleOpenLoanDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Money Borrowed
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Loan Dialog */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedLoan ? 'Edit Loan' : 'Add Loan'}</DialogTitle>
            <DialogDescription>
              {selectedLoan ? 'Update loan details.' : 'Record a new loan transaction.'}
            </DialogDescription>
          </DialogHeader>
          <LoanForm
            loan={selectedLoan}
            onSubmit={handleLoanSubmit}
            onCancel={handleCloseLoanDialog}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Add a payment to this loan.
            </DialogDescription>
          </DialogHeader>
          {selectedLoanForPayment && (
            <PaymentForm
              loanId={selectedLoanForPayment}
              onSubmit={handlePaymentSubmit}
              onCancel={handleClosePaymentDialog}
              isLoading={isSubmitting}
              maxAmount={loans.find((l) => l.id === selectedLoanForPayment)?.outstanding_balance}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this loan? This will also delete all associated payments. This action cannot be undone.
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

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Change Loan Status</DialogTitle>
            <DialogDescription>
              Select a new status for this loan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {LOAN_STATUSES.map((status) => (
              <Button
                key={status.value}
                variant={loanToUpdateStatus?.status === status.value ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => handleStatusChange(status.value as any)}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Loans</CardTitle>
        <CardDescription>
          Keep track of money you&apos;ve lent or borrowed from friends, family, or colleagues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
          <div className="flex gap-4 mb-4">
            <HandCoins className="h-12 w-12 text-green-600" />
            <Banknote className="h-12 w-12 text-orange-600" />
          </div>
          <p className="text-muted-foreground mb-4">No loans recorded yet</p>
          <Button variant="outline" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Loan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function LoansPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-10 w-80" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  )
}
