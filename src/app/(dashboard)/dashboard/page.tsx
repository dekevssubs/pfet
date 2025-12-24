'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { useAuth, useAccounts, useIncome, useExpenses, useBudgets } from '@/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  AlertTriangle,
  Target,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'

export default function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth()
  const { accounts, totalBalance, isLoading: accountsLoading } = useAccounts()
  const { incomes, currentMonthTotal: incomeMonthTotal, incomeByCategory, isLoading: incomeLoading } = useIncome()
  const { expenses, currentMonthTotal: expenseMonthTotal, expensesByCategory, isLoading: expensesLoading } = useExpenses()
  const { budgets, alertBudgets, isLoading: budgetsLoading } = useBudgets()

  const isLoading = authLoading || accountsLoading || incomeLoading || expensesLoading || budgetsLoading

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate last month's income for comparison
  const lastMonthIncomeTotal = incomes
    .filter((inc) => {
      const incomeDate = new Date(inc.date)
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      return (
        incomeDate.getMonth() === lastMonth.getMonth() &&
        incomeDate.getFullYear() === lastMonth.getFullYear()
      )
    })
    .reduce((sum, inc) => sum + Number(inc.amount), 0)

  const incomeChange = lastMonthIncomeTotal > 0
    ? ((incomeMonthTotal - lastMonthIncomeTotal) / lastMonthIncomeTotal) * 100
    : incomeMonthTotal > 0 ? 100 : 0

  // Calculate last month's expenses for comparison
  const lastMonthExpenseTotal = expenses
    .filter((exp) => {
      const expenseDate = new Date(exp.date)
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
      return (
        expenseDate.getMonth() === lastMonth.getMonth() &&
        expenseDate.getFullYear() === lastMonth.getFullYear()
      )
    })
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  const expenseChange = lastMonthExpenseTotal > 0
    ? ((expenseMonthTotal - lastMonthExpenseTotal) / lastMonthExpenseTotal) * 100
    : expenseMonthTotal > 0 ? 100 : 0

  // Get recent transactions (combined income and expenses, last 5)
  const recentIncomes = incomes.slice(0, 3)
  const recentExpenses = expenses.slice(0, 3)

  // Monthly data for bar chart (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthIncomes = incomes.filter((inc) => {
      const incDate = new Date(inc.date)
      return (
        incDate.getMonth() === date.getMonth() &&
        incDate.getFullYear() === date.getFullYear()
      )
    })
    const monthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date)
      return (
        expDate.getMonth() === date.getMonth() &&
        expDate.getFullYear() === date.getFullYear()
      )
    })
    return {
      month: format(date, 'MMM'),
      income: monthIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0),
      expenses: monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
    }
  })

  // Calculate savings rate
  const savingsRate = incomeMonthTotal > 0
    ? Math.round(((incomeMonthTotal - expenseMonthTotal) / incomeMonthTotal) * 100)
    : 0

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your finances.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/income">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Income
            </Button>
          </Link>
          <Link href="/expenses">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income (This Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(incomeMonthTotal)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {incomeChange >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(0)}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses (This Month)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(expenseMonthTotal)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {expenseChange <= 0 ? (
                <ArrowDownRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowUpRight className="h-3 w-3 text-red-500" />
              )}
              <span className={expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}>
                {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(0)}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {savingsRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate >= 20 ? 'Great job saving!' : savingsRate >= 0 ? 'Room for improvement' : 'Spending more than earning'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>
              Your cash flow over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.some(d => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value)),
                      name === 'income' ? 'Income' : 'Expenses'
                    ]}
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
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No transaction data yet</p>
                  <Link href="/income">
                    <Button variant="outline" size="sm">
                      Add your first transaction
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>
              This month&apos;s spending breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  No expenses recorded this month
                </p>
              </div>
            )}
            {expensesByCategory.length > 0 && (
              <div className="mt-4 space-y-2">
                {expensesByCategory.slice(0, 5).map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color || CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Income</CardTitle>
              <CardDescription>Latest income transactions</CardDescription>
            </div>
            <Link href="/income">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentIncomes.length > 0 ? (
              <div className="space-y-4">
                {recentIncomes.map((income) => (
                  <div key={income.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: income.income_categories?.color || '#10B981',
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {income.income_categories?.name || 'Income'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(income.date), 'dd MMM')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      +{formatCurrency(Number(income.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                No income recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest expense transactions</CardDescription>
            </div>
            <Link href="/expenses">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: expense.expense_categories?.color || '#EF4444',
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {expense.expense_categories?.name || 'Expense'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), 'dd MMM')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(Number(expense.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                No expenses recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>Quick view of your accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length > 0 ? (
              <div className="space-y-4">
                {accounts.slice(0, 4).map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <Wallet
                          className="h-4 w-4"
                          style={{ color: account.color || '#3B82F6' }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {account.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(Number(account.balance))}
                    </span>
                  </div>
                ))}
                {accounts.length > 4 && (
                  <Link href="/accounts">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all {accounts.length} accounts
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[150px]">
                <p className="text-muted-foreground mb-2">No accounts yet</p>
                <Link href="/accounts">
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Account
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget Alerts</CardTitle>
              <CardDescription>Budgets needing attention</CardDescription>
            </div>
            <Link href="/budgets">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              alertBudgets.length > 0 ? (
                <div className="space-y-4">
                  {alertBudgets.slice(0, 4).map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {budget.isOverBudget ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          <span className="text-sm font-medium">
                            {budget.expense_categories?.name || 'Budget'}
                          </span>
                        </div>
                        <Badge
                          variant={budget.isOverBudget ? 'destructive' : 'outline'}
                          className={!budget.isOverBudget ? 'border-amber-500 text-amber-600' : ''}
                        >
                          {budget.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress
                        value={Math.min(budget.percentage, 100)}
                        className={`h-1.5 ${
                          budget.isOverBudget
                            ? '[&>div]:bg-red-500'
                            : '[&>div]:bg-amber-500'
                        }`}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[150px]">
                  <Target className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-green-600 font-medium">All budgets on track!</p>
                  <p className="text-xs text-muted-foreground">
                    {budgets.length} budget{budgets.length !== 1 ? 's' : ''} set
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-[150px]">
                <Target className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-2">No budgets yet</p>
                <Link href="/budgets">
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Budget
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="h-[400px] col-span-4" />
        <Skeleton className="h-[400px] col-span-3" />
      </div>
    </div>
  )
}
