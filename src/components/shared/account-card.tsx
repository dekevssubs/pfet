'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Landmark,
  Building,
  PiggyBank,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { ACCOUNT_TYPES } from '@/lib/constants'
import type { Account } from '@/types'

const iconMap = {
  Landmark,
  Building,
  PiggyBank,
  TrendingUp,
  Users,
}

interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export function AccountCard({ account, onEdit, onDelete, onSetDefault }: AccountCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const accountType = ACCOUNT_TYPES[account.type]
  const IconComponent = iconMap[accountType.icon as keyof typeof iconMap] || Landmark

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <>
      <Card className="relative overflow-hidden">
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: account.color || accountType.color }}
        />

        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${account.color || accountType.color}20` }}
            >
              <IconComponent
                className="h-5 w-5"
                style={{ color: account.color || accountType.color }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{account.name}</h3>
                {account.is_default && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{accountType.label}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {!account.is_default && (
                <DropdownMenuItem onClick={() => onSetDefault(account.id)}>
                  <Star className="mr-2 h-4 w-4" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(Number(account.balance))}</p>
              <p className="text-xs text-muted-foreground">Current Balance</p>
            </div>

            {(account.bank_name || account.account_number) && (
              <div className="pt-2 border-t text-sm text-muted-foreground">
                {account.bank_name && <span>{account.bank_name}</span>}
                {account.bank_name && account.account_number && <span> • </span>}
                {account.account_number && <span>****{account.account_number}</span>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{account.name}&quot;? This action cannot be undone.
              All transactions linked to this account will have their account reference removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(account.id)
                setShowDeleteDialog(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
