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
import {
  goalSchema,
  type GoalFormData,
  GOAL_CATEGORIES,
  GOAL_PRIORITIES,
} from '@/lib/validations/goal'
import type { Goal } from '@/types'

interface GoalFormProps {
  goal?: Goal
  onSubmit: (data: GoalFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function GoalForm({ goal, onSubmit, onCancel, isLoading }: GoalFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: {
      name: goal?.name || '',
      description: goal?.description || '',
      target_amount: goal?.target_amount || 0,
      current_amount: goal?.current_amount || 0,
      target_date: goal?.target_date || '',
      category: goal?.category || 'savings',
      priority: goal?.priority || 'medium',
      color: goal?.color || '#10B981',
      icon: goal?.icon || 'Target',
    },
  })

  const watchCategory = watch('category')
  const watchPriority = watch('priority')
  const watchTargetDate = watch('target_date')

  const handleFormSubmit = async (data: GoalFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Emergency Fund, New Car, Vacation"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe your goal..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_amount">Target Amount (KES)</Label>
          <Input
            id="target_amount"
            type="number"
            step="0.01"
            min="0"
            {...register('target_amount')}
            placeholder="0.00"
          />
          {errors.target_amount && (
            <p className="text-sm text-red-500">{errors.target_amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_amount">Starting Amount (KES)</Label>
          <Input
            id="current_amount"
            type="number"
            step="0.01"
            min="0"
            {...register('current_amount')}
            placeholder="0.00"
          />
          {errors.current_amount && (
            <p className="text-sm text-red-500">{errors.current_amount.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={watchCategory || 'savings'}
            onValueChange={(value: any) => setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {GOAL_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={watchPriority || 'medium'}
            onValueChange={(value: 'low' | 'medium' | 'high') => setValue('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {GOAL_PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !watchTargetDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchTargetDate
                ? format(new Date(watchTargetDate), 'PPP')
                : 'No target date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watchTargetDate ? new Date(watchTargetDate) : undefined}
              onSelect={(date) =>
                setValue('target_date', date ? format(date, 'yyyy-MM-dd') : '')
              }
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2">
          {['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                watch('color') === color ? 'border-foreground scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
              onClick={() => setValue('color', color)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
        </Button>
      </div>
    </form>
  )
}

// Contribution form component
interface ContributionFormProps {
  goalId: string
  onSubmit: (data: { amount: number; contribution_date: string; notes?: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  remainingAmount?: number
}

export function ContributionForm({
  goalId,
  onSubmit,
  onCancel,
  isLoading,
  remainingAmount,
}: ContributionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: 0,
      contribution_date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  })

  const watchContributionDate = watch('contribution_date')

  const handleFormSubmit = async (data: { amount: number; contribution_date: string; notes?: string }) => {
    await onSubmit({
      amount: Number(data.amount),
      contribution_date: data.contribution_date,
      notes: data.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Contribution Amount (KES)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register('amount', { required: 'Amount is required' })}
          placeholder="0.00"
        />
        {remainingAmount !== undefined && remainingAmount > 0 && (
          <p className="text-xs text-muted-foreground">
            Amount remaining: KES {remainingAmount.toLocaleString()}
          </p>
        )}
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Contribution Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !watchContributionDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watchContributionDate
                ? format(new Date(watchContributionDate), 'PPP')
                : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={watchContributionDate ? new Date(watchContributionDate) : undefined}
              onSelect={(date) =>
                setValue('contribution_date', date ? format(date, 'yyyy-MM-dd') : '')
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
          placeholder="M-Pesa reference, etc."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Add Contribution'}
        </Button>
      </div>
    </form>
  )
}
