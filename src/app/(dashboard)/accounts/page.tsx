'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">
            Manage your bank accounts and track balances.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>
            You haven&apos;t added any accounts yet. Add your first account to start tracking your finances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No accounts found</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
