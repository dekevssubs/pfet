'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unofficial Loans</h2>
          <p className="text-muted-foreground">
            Track money you&apos;ve lent or borrowed from friends and family.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="lent">Money Lent</TabsTrigger>
          <TabsTrigger value="borrowed">Money Borrowed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Loans</CardTitle>
              <CardDescription>
                View all your unofficial loans in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No loans recorded</p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Loan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lent">
          <Card>
            <CardHeader>
              <CardTitle>Money Lent</CardTitle>
              <CardDescription>
                Track money you&apos;ve lent to others.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No money lent recorded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="borrowed">
          <Card>
            <CardHeader>
              <CardTitle>Money Borrowed</CardTitle>
              <CardDescription>
                Track money you&apos;ve borrowed from others.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No money borrowed recorded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
