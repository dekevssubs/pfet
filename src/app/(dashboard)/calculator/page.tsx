'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">PAYE Calculator</h2>
        <p className="text-muted-foreground">
          Calculate your net salary with Kenya tax deductions (PAYE, NHIF, NSSF, Housing Levy).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Salary Input</CardTitle>
            <CardDescription>
              Enter your salary details to calculate deductions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Calculator form coming soon in Phase 5
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
            <CardDescription>
              Your salary breakdown and deductions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                Results will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
