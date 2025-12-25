'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Smartphone, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccounts, useExpenseCategories, useIncomeCategories, useExpenses, useIncome } from '@/hooks'

interface MpesaFormData {
  type: 'send' | 'receive'
  amount: number
  mpesaCode: string
  recipient: string
  account_id: string
  category_id: string
}

export function MpesaQuickEntry() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionType, setTransactionType] = useState<'send' | 'receive'>('send')

  const { accounts } = useAccounts()
  const { flatCategories: expenseCategories } = useExpenseCategories()
  const { categories: incomeCategories } = useIncomeCategories()
  const { createExpense } = useExpenses()
  const { createIncome } = useIncome()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<MpesaFormData>({
    defaultValues: {
      type: 'send',
      amount: 0,
      mpesaCode: '',
      recipient: '',
      account_id: '',
      category_id: '',
    },
  })

  const watchAccountId = watch('account_id')
  const watchCategoryId = watch('category_id')

  const handleMpesaSubmit = async (data: MpesaFormData) => {
    setIsSubmitting(true)
    try {
      const mpesaDescription = `M-Pesa ${transactionType === 'send' ? 'to' : 'from'} ${data.recipient}${data.mpesaCode ? ` - Code: ${data.mpesaCode}` : ''}`

      if (transactionType === 'send') {
        // Create expense
        const { error } = await createExpense({
          amount: data.amount,
          description: mpesaDescription,
          date: format(new Date(), 'yyyy-MM-dd'),
          account_id: data.account_id || null,
          category_id: data.category_id || null,
          is_recurring: false,
          recurring_frequency: null,
        })
        if (error) {
          toast.error(error.message || 'Failed to record M-Pesa transaction')
          return
        }
        toast.success('M-Pesa Send recorded successfully')
      } else {
        // Create income
        const { error } = await createIncome({
          amount: data.amount,
          description: mpesaDescription,
          date: format(new Date(), 'yyyy-MM-dd'),
          account_id: data.account_id || null,
          category_id: data.category_id || null,
          is_recurring: false,
          recurring_frequency: null,
        })
        if (error) {
          toast.error(error.message || 'Failed to record M-Pesa transaction')
          return
        }
        toast.success('M-Pesa Receive recorded successfully')
      }

      reset()
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find M-Pesa account or mobile money account
  const mpesaAccount = accounts.find(
    (a) => a.name.toLowerCase().includes('mpesa') || a.name.toLowerCase().includes('m-pesa')
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Smartphone className="h-4 w-4 text-green-600" />
          M-Pesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-Pesa Transaction
          </DialogTitle>
          <DialogDescription>
            Quickly log your M-Pesa send money or receive transactions.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as 'send' | 'receive')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send" className="gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-500" />
              Send Money
            </TabsTrigger>
            <TabsTrigger value="receive" className="gap-2">
              <ArrowDownLeft className="h-4 w-4 text-green-500" />
              Receive Money
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(handleMpesaSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                min="1"
                placeholder="0"
                {...register('amount', { required: 'Amount is required', min: 1 })}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">
                {transactionType === 'send' ? 'Sent To' : 'Received From'}
              </Label>
              <Input
                id="recipient"
                placeholder={transactionType === 'send' ? 'Name or phone number' : 'Name or phone number'}
                {...register('recipient', { required: 'This field is required' })}
              />
              {errors.recipient && (
                <p className="text-sm text-red-500">{errors.recipient.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mpesaCode">M-Pesa Code (Optional)</Label>
              <Input
                id="mpesaCode"
                placeholder="e.g., SLK8XXXXXX"
                {...register('mpesaCode')}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                The confirmation code from your M-Pesa message
              </p>
            </div>

            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                value={watchAccountId || 'none'}
                onValueChange={(value) => setValue('account_id', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No account</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: account.color || '#3B82F6' }}
                        />
                        {account.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={watchCategoryId || 'none'}
                onValueChange={(value) => setValue('category_id', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {transactionType === 'send'
                    ? expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))
                    : incomeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color || '#10B981' }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Transaction
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
