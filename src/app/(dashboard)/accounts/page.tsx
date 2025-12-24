'use client'

import { useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/hooks'
import { AccountForm } from '@/components/forms'
import { AccountCard } from '@/components/shared'
import type { Account } from '@/types'
import type { AccountFormData } from '@/lib/validations/account'

export default function AccountsPage() {
  const {
    accounts,
    isLoading,
    totalBalance,
    createAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
  } = useAccounts()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleOpenDialog = (account?: Account) => {
    setSelectedAccount(account)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setSelectedAccount(undefined)
    setIsDialogOpen(false)
  }

  const handleSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true)
    try {
      if (selectedAccount) {
        // Update existing account
        const { error } = await updateAccount(selectedAccount.id, data)
        if (error) {
          toast.error(error.message || 'Failed to update account')
          return
        }
        toast.success('Account updated successfully')
      } else {
        // Create new account
        const { error } = await createAccount(data)
        if (error) {
          toast.error(error.message || 'Failed to create account')
          return
        }
        toast.success('Account created successfully')
      }
      handleCloseDialog()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await deleteAccount(id)
    if (error) {
      toast.error(error.message || 'Failed to delete account')
      return
    }
    toast.success('Account deleted successfully')
  }

  const handleSetDefault = async (id: string) => {
    const { error } = await setDefaultAccount(id)
    if (error) {
      toast.error(error.message || 'Failed to set default account')
      return
    }
    toast.success('Default account updated')
  }

  if (isLoading) {
    return <AccountsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your bank accounts and track balances.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
                <p className="text-sm text-muted-foreground">
                  Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Grid */}
      {accounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>
              You haven&apos;t added any accounts yet. Add your first account to start tracking your finances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No accounts found</p>
              <Button variant="outline" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAccount ? 'Edit Account' : 'Add New Account'}
            </DialogTitle>
            <DialogDescription>
              {selectedAccount
                ? 'Update your account details below.'
                : 'Create a new account to track your finances.'}
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            account={selectedAccount}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AccountsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  )
}
