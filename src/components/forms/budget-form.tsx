'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { budgetSchema, type BudgetFormData, BUDGET_PERIODS } from '@/lib/validations/budget'
import type { Budget, ExpenseCategory } from '@/types'

interface BudgetFormProps {
  budget?: Budget
  categories: ExpenseCategory[]
  existingCategoryIds: string[]
  onSubmit: (data: BudgetFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function BudgetForm({
  budget,
  categories,
  existingCategoryIds,
  onSubmit,
  onCancel,
  isLoading,
}: BudgetFormProps) {
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      category_id: budget?.category_id || '',
      amount: budget?.amount || 0,
      period: budget?.period || 'monthly',
      start_date: budget?.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: budget?.end_date || null,
      alert_threshold: budget?.alert_threshold || 80,
    },
  })

  // Filter out categories that already have budgets (unless editing)
  const availableCategories = categories.filter(
    (cat) => !existingCategoryIds.includes(cat.id) || cat.id === budget?.category_id
  )

  // Group categories by parent
  const parentCategories = availableCategories.filter((c) => !c.parent_id)
  const getSubcategories = (parentId: string) =>
    availableCategories.filter((c) => c.parent_id === parentId)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!budget}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category to budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parentCategories.map((category) => {
                    const subcats = getSubcategories(category.id)
                    return (
                      <div key={category.id}>
                        <SelectItem value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color || '#6B7280' }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </SelectItem>
                        {subcats.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.id}>
                            <div className="flex items-center gap-2 pl-4">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: subcat.color || '#6B7280' }}
                              />
                              {subcat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    )
                  })}
                </SelectContent>
              </Select>
              {budget && (
                <FormDescription>
                  Category cannot be changed after creation.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount (KSh)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="0"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Maximum amount you want to spend in this category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Period</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BUDGET_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How often this budget resets.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alert_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert Threshold: {field.value}%</FormLabel>
              <FormControl>
                <Slider
                  min={50}
                  max={100}
                  step={5}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>
                Get alerted when spending reaches this percentage of your budget.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
