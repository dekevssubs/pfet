'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { accountSchema, type AccountFormData } from '@/lib/validations/account'
import { ACCOUNT_TYPES } from '@/lib/constants'
import type { Account } from '@/types'

interface AccountFormProps {
  account?: Account
  onSubmit: (data: AccountFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function AccountForm({ account, onSubmit, onCancel, isLoading }: AccountFormProps) {
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'primary',
      bank_name: account?.bank_name || '',
      account_number: account?.account_number || '',
      balance: account?.balance || 0,
      color: account?.color || ACCOUNT_TYPES.primary.color,
    },
  })

  const selectedType = form.watch('type')

  // Update color when type changes
  const handleTypeChange = (value: Account['type']) => {
    form.setValue('type', value)
    form.setValue('color', ACCOUNT_TYPES[value].color)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Account, Emergency Fund" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select
                onValueChange={handleTypeChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: value.color }}
                        />
                        {value.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank/Institution Name (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Equity Bank, KCB, Safaricom"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Last 4 digits for reference"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                For your reference only. We recommend storing only the last 4 digits.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance (KSh)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter your current account balance.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden color field */}
        <input type="hidden" {...form.register('color')} />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {account ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
