'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground">
            Track all your income sources.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
          <CardDescription>
            You haven&apos;t recorded any income yet. Start by adding your salary or other income sources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No income records found</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Record Your First Income
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
