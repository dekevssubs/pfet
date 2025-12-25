'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Calculator,
  Wallet,
  Building2,
  HeartPulse,
  Home,
  PiggyBank,
  Shield,
  Info,
  Download,
  RotateCcw,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import {
  calculateNetSalary,
  formatKES,
  type PAYEResult,
  PAYE_BANDS,
  PERSONAL_RELIEF,
  HOUSING_LEVY_RATE,
  NSSF_RATE,
} from '@/lib/paye-calculator'
import { payeCalculatorSchema, type PAYECalculatorFormData } from '@/lib/validations/paye'

const DEDUCTION_COLORS = {
  paye: '#EF4444',
  nhif: '#3B82F6',
  nssf: '#10B981',
  housingLevy: '#F59E0B',
  pension: '#8B5CF6',
  netSalary: '#22C55E',
}

export default function CalculatorPage() {
  const [result, setResult] = useState<PAYEResult | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PAYECalculatorFormData>({
    resolver: zodResolver(payeCalculatorSchema) as any,
    defaultValues: {
      grossSalary: 0,
      allowances: 0,
      benefits: 0,
      pension: 0,
      insurance: 0,
      disability: false,
    },
  })

  const watchDisability = watch('disability')

  const onSubmit = (data: PAYECalculatorFormData) => {
    const calculationResult = calculateNetSalary({
      grossSalary: data.grossSalary,
      allowances: data.allowances || 0,
      benefits: data.benefits || 0,
      pension: data.pension || 0,
      insurance: data.insurance || 0,
      disability: data.disability || false,
    })
    setResult(calculationResult)
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  const handleExport = () => {
    if (!result) return

    const data = {
      date: new Date().toISOString(),
      ...result,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paye-calculation-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Prepare chart data
  const pieData = result
    ? [
        { name: 'PAYE', value: result.paye, color: DEDUCTION_COLORS.paye },
        { name: 'NHIF', value: result.nhif, color: DEDUCTION_COLORS.nhif },
        { name: 'NSSF', value: result.nssf, color: DEDUCTION_COLORS.nssf },
        { name: 'Housing Levy', value: result.housingLevy, color: DEDUCTION_COLORS.housingLevy },
        ...(result.pension > 0
          ? [{ name: 'Pension', value: result.pension, color: DEDUCTION_COLORS.pension }]
          : []),
      ].filter((item) => item.value > 0)
    : []

  const salaryBreakdown = result
    ? [
        { name: 'Net Salary', value: result.netSalary, color: DEDUCTION_COLORS.netSalary },
        { name: 'Deductions', value: result.totalDeductions, color: DEDUCTION_COLORS.paye },
      ]
    : []

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">PAYE Calculator</h2>
            <p className="text-muted-foreground">
              Calculate your net salary with Kenya tax deductions (PAYE, NHIF, NSSF, Housing Levy).
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            {result && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Salary Input
              </CardTitle>
              <CardDescription>
                Enter your salary details to calculate deductions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Gross Salary */}
                <div className="space-y-2">
                  <Label htmlFor="grossSalary" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Gross Monthly Salary (KES)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your total salary before any deductions</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="grossSalary"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g., 100000"
                    {...register('grossSalary')}
                    className="text-lg"
                  />
                  {errors.grossSalary && (
                    <p className="text-sm text-red-500">{errors.grossSalary.message}</p>
                  )}
                </div>

                {/* Advanced Options Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Show Advanced Options</Label>
                  <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                </div>

                {showAdvanced && (
                  <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                    {/* Non-taxable Allowances */}
                    <div className="space-y-2">
                      <Label htmlFor="allowances" className="flex items-center gap-2">
                        Non-taxable Allowances (KES)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Allowances exempt from tax (e.g., per diem, travel)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="allowances"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        {...register('allowances')}
                      />
                    </div>

                    {/* Taxable Benefits */}
                    <div className="space-y-2">
                      <Label htmlFor="benefits" className="flex items-center gap-2">
                        Taxable Benefits (KES)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Benefits in kind (car, housing benefit, etc.)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="benefits"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        {...register('benefits')}
                      />
                    </div>

                    {/* Pension Contribution */}
                    <div className="space-y-2">
                      <Label htmlFor="pension" className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Pension Contribution (KES)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tax-deductible pension contributions (max KES 20,000/month)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="pension"
                        type="number"
                        step="1"
                        min="0"
                        max="20000"
                        placeholder="0"
                        {...register('pension')}
                      />
                    </div>

                    {/* Insurance Premium */}
                    <div className="space-y-2">
                      <Label htmlFor="insurance" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Insurance Premium (KES)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>For insurance relief (15% of premium, max KES 5,000/month)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="insurance"
                        type="number"
                        step="1"
                        min="0"
                        placeholder="0"
                        {...register('insurance')}
                      />
                    </div>

                    {/* Disability */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="disability">Person with Disability</Label>
                        <p className="text-xs text-muted-foreground">
                          50% tax exemption on income
                        </p>
                      </div>
                      <Switch
                        id="disability"
                        checked={watchDisability}
                        onCheckedChange={(checked) => {
                          const event = { target: { value: checked } }
                          register('disability').onChange(event as any)
                        }}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Net Salary
                </Button>
              </form>

              {/* Tax Rates Info */}
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="rates">
                  <AccordionTrigger className="text-sm">
                    View Current Tax Rates (2024)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">PAYE Tax Bands</h4>
                        <div className="space-y-1">
                          {PAYE_BANDS.map((band, i) => (
                            <div key={i} className="flex justify-between text-muted-foreground">
                              <span>
                                {band.max === Infinity
                                  ? `Above KES ${band.min.toLocaleString()}`
                                  : `KES ${band.min.toLocaleString()} - ${band.max.toLocaleString()}`}
                              </span>
                              <span>{(band.rate * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Personal Relief</h4>
                          <p className="text-muted-foreground">{formatKES(PERSONAL_RELIEF)}/month</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Housing Levy</h4>
                          <p className="text-muted-foreground">{(HOUSING_LEVY_RATE * 100).toFixed(1)}% of gross</p>
                        </div>
                        <div>
                          <h4 className="font-medium">NSSF Rate</h4>
                          <p className="text-muted-foreground">{(NSSF_RATE * 100)}% (max KES 2,160)</p>
                        </div>
                        <div>
                          <h4 className="font-medium">NHIF</h4>
                          <p className="text-muted-foreground">KES 150 - 1,700</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Calculation Results
                </CardTitle>
                <CardDescription>
                  Your salary breakdown and deductions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    {/* Net Salary Highlight */}
                    <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Net Monthly Salary</p>
                      <p className="text-4xl font-bold text-green-600">
                        {formatKES(result.netSalary)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {((result.netSalary / result.grossSalary) * 100).toFixed(1)}% of gross salary
                      </p>
                    </div>

                    {/* Salary Breakdown Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gross Salary</span>
                        <span className="font-medium">{formatKES(result.grossSalary)}</span>
                      </div>
                      <div className="h-8 rounded-lg overflow-hidden flex">
                        <div
                          className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(result.netSalary / result.grossSalary) * 100}%` }}
                        >
                          Net
                        </div>
                        <div
                          className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(result.totalDeductions / result.grossSalary) * 100}%` }}
                        >
                          Deductions
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Deductions Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Statutory Deductions</h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEDUCTION_COLORS.paye }} />
                            <span className="text-sm">PAYE (Income Tax)</span>
                          </div>
                          <span className="font-medium text-red-600">-{formatKES(result.paye)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEDUCTION_COLORS.nhif }} />
                            <span className="text-sm flex items-center gap-1">
                              <HeartPulse className="h-3 w-3" />
                              NHIF
                            </span>
                          </div>
                          <span className="font-medium">-{formatKES(result.nhif)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEDUCTION_COLORS.nssf }} />
                            <span className="text-sm flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              NSSF
                            </span>
                          </div>
                          <span className="font-medium">-{formatKES(result.nssf)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEDUCTION_COLORS.housingLevy }} />
                            <span className="text-sm flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              Housing Levy
                            </span>
                          </div>
                          <span className="font-medium">-{formatKES(result.housingLevy)}</span>
                        </div>

                        {result.pension > 0 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEDUCTION_COLORS.pension }} />
                              <span className="text-sm flex items-center gap-1">
                                <PiggyBank className="h-3 w-3" />
                                Pension
                              </span>
                            </div>
                            <span className="font-medium">-{formatKES(result.pension)}</span>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between font-medium">
                        <span>Total Deductions</span>
                        <span className="text-red-600">-{formatKES(result.totalDeductions)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Tax Relief */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Tax Relief Applied
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Personal Relief</span>
                          <span className="text-green-600">+{formatKES(result.personalRelief)}</span>
                        </div>
                        {result.insuranceRelief > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Insurance Relief</span>
                            <span className="text-green-600">+{formatKES(result.insuranceRelief)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium">
                          <span>Total Relief</span>
                          <span className="text-green-600">+{formatKES(result.taxRelief)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions Chart */}
                    {pieData.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-4">Deductions Breakdown</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                formatter={(value) => formatKES(Number(value))}
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                    <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Enter your gross salary and click calculate<br />
                      to see your net salary breakdown
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Band Breakdown */}
            {result && result.taxByBand.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">PAYE Tax Calculation</CardTitle>
                  <CardDescription>
                    Breakdown by tax band
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Taxable Income</span>
                      <span>{formatKES(result.taxableIncome)}</span>
                    </div>
                    <Separator />
                    {result.taxByBand.map((band, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{band.band}</span>
                          <Badge variant="outline">{band.rate}%</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatKES(band.taxableAmount)} x {band.rate}%
                          </span>
                          <span className="font-medium">{formatKES(band.tax)}</span>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span>Gross Tax</span>
                      <span>{formatKES(result.grossTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Less: Tax Relief</span>
                      <span>-{formatKES(result.taxRelief)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Net PAYE</span>
                      <span className="text-red-600">{formatKES(result.netTax)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
