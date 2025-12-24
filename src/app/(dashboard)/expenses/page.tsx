'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Track and categorize your spending.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>
            You haven&apos;t recorded any expenses yet. Start tracking your spending habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No expenses recorded</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Record Your First Expense
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
