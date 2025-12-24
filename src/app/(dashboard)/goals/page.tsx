'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Goals</h2>
          <p className="text-muted-foreground">
            Set and track your savings and investment goals.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>
            You haven&apos;t set any financial goals yet. Start planning for your future!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No goals created</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
