'use client'

import { useState, useMemo } from 'react'
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns'
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useIncome, useExpenses, useBudgets, useAccounts } from '@/hooks'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'

type DateRange = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'last_year'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('this_month')
  const [activeReport, setActiveReport] = useState<string>('overview')

  const { incomes, isLoading: incomesLoading } = useIncome()
  const { expenses, isLoading: expensesLoading } = useExpenses()
  const { budgets, isLoading: budgetsLoading } = useBudgets()
  const { accounts, totalBalance, isLoading: accountsLoading } = useAccounts()

  const isLoading = incomesLoading || expensesLoading || budgetsLoading || accountsLoading

  // Get date range boundaries
  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    switch (dateRange) {
      case 'this_month':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) }
      case 'last_month':
        return { startDate: startOfMonth(subMonths(now, 1)), endDate: endOfMonth(subMonths(now, 1)) }
      case 'last_3_months':
        return { startDate: startOfMonth(subMonths(now, 2)), endDate: endOfMonth(now) }
      case 'last_6_months':
        return { startDate: startOfMonth(subMonths(now, 5)), endDate: endOfMonth(now) }
      case 'this_year':
        return { startDate: startOfYear(now), endDate: endOfYear(now) }
      case 'last_year':
        return { startDate: startOfYear(subMonths(now, 12)), endDate: endOfYear(subMonths(now, 12)) }
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) }
    }
  }, [dateRange])

  // Filter data by date range
  const filteredIncomes = useMemo(() => {
    return incomes.filter((inc) => {
      const date = new Date(inc.date)
      return date >= startDate && date <= endDate
    })
  }, [incomes, startDate, endDate])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const date = new Date(exp.date)
      return date >= startDate && date <= endDate
    })
  }, [expenses, startDate, endDate])

  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0)
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  const netIncome = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((netIncome / totalIncome) * 100) : 0

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    return months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const monthIncomes = incomes.filter((inc) => {
        const date = new Date(inc.date)
        return date >= monthStart && date <= monthEnd
      })

      const monthExpenses = expenses.filter((exp) => {
        const date = new Date(exp.date)
        return date >= monthStart && date <= monthEnd
      })

      const income = monthIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0)
      const expense = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

      return {
        month: format(month, 'MMM yy'),
        income,
        expenses: expense,
        net: income - expense,
      }
    })
  }, [incomes, expenses, startDate, endDate])

  // Income by category
  const incomeByCategory = useMemo(() => {
    const categoryTotals: Record<string, { name: string; value: number; color: string }> = {}

    filteredIncomes.forEach((inc) => {
      const catName = inc.income_categories?.name || 'Uncategorized'
      const catColor = inc.income_categories?.color || '#10B981'

      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { name: catName, value: 0, color: catColor }
      }
      categoryTotals[catName].value += Number(inc.amount)
    })

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value)
  }, [filteredIncomes])

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const categoryTotals: Record<string, { name: string; value: number; color: string }> = {}

    filteredExpenses.forEach((exp) => {
      const catName = exp.expense_categories?.name || 'Uncategorized'
      const catColor = exp.expense_categories?.color || '#EF4444'

      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { name: catName, value: 0, color: catColor }
      }
      categoryTotals[catName].value += Number(exp.amount)
    })

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value)
  }, [filteredExpenses])

  // Budget vs Actual data
  const budgetVsActual = useMemo(() => {
    return budgets.map((budget) => {
      const spent = filteredExpenses
        .filter((exp) => exp.category_id === budget.category_id)
        .reduce((sum, exp) => sum + Number(exp.amount), 0)

      return {
        category: budget.expense_categories?.name || 'Unknown',
        budget: budget.amount,
        actual: spent,
        remaining: Math.max(budget.amount - spent, 0),
        percentUsed: budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0,
      }
    })
  }, [budgets, filteredExpenses])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = ''
    let filename = ''

    switch (activeReport) {
      case 'income':
        csvContent = 'Date,Category,Amount,Description\n'
        filteredIncomes.forEach((inc) => {
          csvContent += `${inc.date},${inc.income_categories?.name || 'N/A'},${inc.amount},"${inc.description || ''}"\n`
        })
        filename = `income_report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`
        break

      case 'expenses':
        csvContent = 'Date,Category,Amount,Description\n'
        filteredExpenses.forEach((exp) => {
          csvContent += `${exp.date},${exp.expense_categories?.name || 'N/A'},${exp.amount},"${exp.description || ''}"\n`
        })
        filename = `expense_report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`
        break

      case 'budget':
        csvContent = 'Category,Budget,Actual,Remaining,% Used\n'
        budgetVsActual.forEach((item) => {
          csvContent += `${item.category},${item.budget},${item.actual},${item.remaining},${item.percentUsed}%\n`
        })
        filename = `budget_report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`
        break

      default:
        csvContent = 'Month,Income,Expenses,Net\n'
        monthlyTrendData.forEach((item) => {
          csvContent += `${item.month},${item.income},${item.expenses},${item.net}\n`
        })
        filename = `financial_summary_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    toast.success('Report exported successfully')
  }

  if (isLoading) {
    return <ReportsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Analyze your financial data with detailed reports.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredIncomes.length} transaction(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} transaction(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {netIncome >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              {netIncome >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {savingsRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : savingsRate >= 0 ? 'Needs improvement' : 'Negative'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="income" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Income
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Budget
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Trend</CardTitle>
                <CardDescription>Monthly comparison over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data for selected period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Net Income Trend</CardTitle>
                <CardDescription>Monthly savings/deficit trend</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="net"
                        name="Net Income"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data for selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
                <CardDescription>Distribution of income sources</CardDescription>
              </CardHeader>
              <CardContent>
                {incomeByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={incomeByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {incomeByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No income recorded
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
                <CardDescription>Detailed income by category</CardDescription>
              </CardHeader>
              <CardContent>
                {incomeByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {incomeByCategory.map((cat, index) => (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color || CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{cat.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(cat.value)}</span>
                        </div>
                        <Progress
                          value={(cat.value / totalIncome) * 100}
                          className="h-2 [&>div]:bg-green-500"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {((cat.value / totalIncome) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No income recorded
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Where your money goes</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expenses recorded
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Detailed expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseByCategory.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {expenseByCategory.map((cat, index) => (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color || CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{cat.name}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(cat.value)}</span>
                        </div>
                        <Progress
                          value={(cat.value / totalExpenses) * 100}
                          className="h-2 [&>div]:bg-red-500"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {((cat.value / totalExpenses) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No expenses recorded
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
              <CardDescription>Compare your budgets with actual spending</CardDescription>
            </CardHeader>
            <CardContent>
              {budgetVsActual.length > 0 ? (
                <div className="space-y-6">
                  {budgetVsActual.map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <span className={`text-sm ${item.percentUsed > 100 ? 'text-red-600' : item.percentUsed > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                          {item.percentUsed}% used
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress
                          value={Math.min(item.percentUsed, 100)}
                          className={`h-3 flex-1 ${
                            item.percentUsed > 100
                              ? '[&>div]:bg-red-500'
                              : item.percentUsed > 80
                              ? '[&>div]:bg-amber-500'
                              : '[&>div]:bg-green-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Spent: {formatCurrency(item.actual)}</span>
                        <span>Budget: {formatCurrency(item.budget)}</span>
                        <span>
                          {item.actual <= item.budget ? (
                            <span className="text-green-600">Remaining: {formatCurrency(item.remaining)}</span>
                          ) : (
                            <span className="text-red-600">Over by: {formatCurrency(item.actual - item.budget)}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No budgets set up yet
                </div>
              )}
            </CardContent>
          </Card>

          {budgetVsActual.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Budget Comparison Chart</CardTitle>
                <CardDescription>Visual comparison of budgets vs actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetVsActual} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                    <YAxis dataKey="category" type="category" width={100} className="text-xs" />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="budget" name="Budget" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="actual" name="Actual" fill="#EF4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
}
