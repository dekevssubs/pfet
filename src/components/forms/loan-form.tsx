'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { loanSchema, type LoanFormData, LOAN_TYPES } from '@/lib/validations/loan'
import type { Loan } from '@/types'

interface LoanFormProps {
  loan?: Loan
  onSubmit: (data: LoanFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function LoanForm({ loan, onSubmit, onCancel, isLoading }: LoanFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema) as any,
    defaultValues: {
      type: loan?.type || 'borrowed',
      person_name: loan?.person_name || '',
      person_contact: loan?.person_contact || '',
      principal_amount: loan?.principal_amount || 0,
      interest_rate: loan?.interest_rate || 0,
      date_issued: loan?.date_issued || format(new Date(), 'yyyy-MM-dd'),
      due_date: loan?.due_date || '',
      notes: loan?.notes || '',
    },
  })

  const watchType = watch('type')
  const watchDateIssued = watch('date_issued')
  const watchDueDate = watch('due_date')

  const handleFormSubmit = async (data: LoanFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Loan Type</Label>
        <Select
          value={watchType}
          onValueChange={(value: 'lent' | 'borrowed') => setValue('type', value)}
          disabled={!!loan}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select loan type" />
          </SelectTrigger>
          <SelectContent>
            {LOAN_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="person_name">
          {watchType === 'borrowed' ? 'Lender Name' : 'Borrower Name'}
        </Label>
        <Input
          id="person_name"
          {...register('person_name')}
          placeholder={watchType === 'borrowed' ? 'Who did you borrow from?' : 'Who did you lend to?'}
        />
        {errors.person_name && (
          <p className="text-sm text-red-500">{errors.person_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="person_contact">Contact (Optional)</Label>
        <Input
          id="person_contact"
          {...register('person_contact')}
          placeholder="Phone number or email"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="principal_amount">Principal Amount (KES)</Label>
          <Input
            id="principal_amount"
            type="number"
            step="0.01"
            min="0"
            {...register('principal_amount')}
            placeholder="0.00"
          />
          {errors.principal_amount && (
            <p className="text-sm text-red-500">{errors.principal_amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="interest_rate">Interest Rate (%)</Label>
          <Input
            id="interest_rate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            {...register('interest_rate')}
            placeholder="0"
          />
          {errors.interest_rate && (
            <p className="text-sm text-red-500">{errors.interest_rate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date Issued</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !watchDateIssued && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchDateIssued
                  ? format(new Date(watchDateIssued), 'PPP')
                  : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={watchDateIssued ? new Date(watchDateIssued) : undefined}
                onSelect={(date) =>
                  setValue('date_issued', date ? format(date, 'yyyy-MM-dd') : '')
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date_issued && (
            <p className="text-sm text-red-500">{errors.date_issued.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Due Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !watchDueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchDueDate
                  ? format(new Date(watchDueDate), 'PPP')
                  : 'No due date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={watchDueDate ? new Date(watchDueDate) : undefined}
                onSelect={(date) =>
                  setValue('due_date', date ? format(date, 'yyyy-MM-dd') : '')
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add any additional details..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : loan ? 'Update Loan' : 'Create Loan'}
        </Button>
      </div>
    </form>
  )
}

// Payment form component
interface PaymentFormProps {
  loanId: string
  onSubmit: (data: { amount: number; payment_date: string; notes?: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  maxAmount?: number
}

export function PaymentForm({ loanId, onSubmit, onCancel, isLoading, maxAmount }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: 0,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  })

  const watchPaymentDate = watch('payment_date')

  const handleFormSubmit = async (data: { amount: number; payment_date: string; notes?: string }) => {
    await onSubmit({
      amount: Number(data.amount),
      payment_date: data.payment_date,
      notes: data.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Payment Amount (KES)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          max={maxAmount}
          {...register('amount', { required: 'Amount is required' })}
          placeholder="0.00"
        />
        {maxAmount && (
          <p className="text-xs text-muted-foreground">
            Outstanding balance: KES {maxAmount.toLocaleString()}
          </p>
        )}
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Payment Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !watchPaymentDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchPaymentDate
                ? format(new Date(watchPaymentDate), 'PPP')
                : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watchPaymentDate ? new Date(watchPaymentDate) : undefined}
              onSelect={(date) =>
                setValue('payment_date', date ? format(date, 'yyyy-MM-dd') : '')
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          {...register('notes')}
          placeholder="Payment reference, etc."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  )
}
