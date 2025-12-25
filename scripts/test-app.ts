/**
 * PFET Application Test Script
 * Tests all functionality from Phase 1 to Phase 8
 *
 * Run with: npx ts-node --esm scripts/test-app.ts
 * Or: npx tsx scripts/test-app.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Test results tracker
const results: { test: string; status: 'pass' | 'fail'; error?: string }[] = []

function logTest(test: string, status: 'pass' | 'fail', error?: string) {
  results.push({ test, status, error })
  const icon = status === 'pass' ? '✅' : '❌'
  console.log(`${icon} ${test}`)
  if (error) console.log(`   Error: ${error}`)
}

async function testSupabaseConnection() {
  console.log('\n📡 Testing Supabase Connection...')
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    logTest('Supabase connection', 'pass')
    return true
  } catch (err: any) {
    logTest('Supabase connection', 'fail', err.message)
    return false
  }
}

async function testDatabaseTables() {
  console.log('\n🗄️  Testing Database Tables...')

  const tables = [
    'profiles',
    'accounts',
    'income_categories',
    'expense_categories',
    'incomes',
    'expenses',
    'budgets',
    'loans',
    'loan_payments',
    'goals',
    'goal_contributions',
  ]

  for (const table of tables) {
    try {
      const { error } = await (supabase.from(table) as any).select('count').limit(1)
      if (error) throw error
      logTest(`Table: ${table}`, 'pass')
    } catch (err: any) {
      logTest(`Table: ${table}`, 'fail', err.message)
    }
  }
}

async function testAuthFlow() {
  console.log('\n🔐 Testing Auth Flow...')

  try {
    // Test session check
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    logTest('Auth: Get session', 'pass')

    if (session) {
      logTest('Auth: User logged in', 'pass')
      return session.user.id
    } else {
      logTest('Auth: No active session (expected if not logged in)', 'pass')
      return null
    }
  } catch (err: any) {
    logTest('Auth flow', 'fail', err.message)
    return null
  }
}

async function testAccountsCRUD(userId: string) {
  console.log('\n💰 Testing Accounts CRUD...')

  let accountId: string | null = null

  try {
    // Create
    const { data: created, error: createError } = await (supabase
      .from('accounts') as any)
      .insert({
        user_id: userId,
        name: 'Test Account',
        type: 'savings',
        balance: 1000,
      })
      .select()
      .single()

    if (createError) throw createError
    accountId = created.id
    logTest('Accounts: Create', 'pass')

    // Read
    const { data: read, error: readError } = await (supabase
      .from('accounts') as any)
      .select('*')
      .eq('id', accountId)
      .single()

    if (readError) throw readError
    logTest('Accounts: Read', 'pass')

    // Update
    const { error: updateError } = await (supabase
      .from('accounts') as any)
      .update({ name: 'Updated Test Account' })
      .eq('id', accountId)

    if (updateError) throw updateError
    logTest('Accounts: Update', 'pass')

    // Delete
    const { error: deleteError } = await (supabase
      .from('accounts') as any)
      .delete()
      .eq('id', accountId)

    if (deleteError) throw deleteError
    logTest('Accounts: Delete', 'pass')

  } catch (err: any) {
    logTest('Accounts CRUD', 'fail', err.message)
    // Cleanup
    if (accountId) {
      await (supabase.from('accounts') as any).delete().eq('id', accountId)
    }
  }
}

async function testIncomeCRUD(userId: string) {
  console.log('\n📈 Testing Income CRUD...')

  let incomeId: string | null = null

  try {
    // Create
    const { data: created, error: createError } = await (supabase
      .from('incomes') as any)
      .insert({
        user_id: userId,
        amount: 50000,
        date: new Date().toISOString().split('T')[0],
        description: 'Test Income',
      })
      .select()
      .single()

    if (createError) throw createError
    incomeId = created.id
    logTest('Income: Create', 'pass')

    // Read
    const { error: readError } = await (supabase
      .from('incomes') as any)
      .select('*')
      .eq('id', incomeId)
      .single()

    if (readError) throw readError
    logTest('Income: Read', 'pass')

    // Update
    const { error: updateError } = await (supabase
      .from('incomes') as any)
      .update({ amount: 55000 })
      .eq('id', incomeId)

    if (updateError) throw updateError
    logTest('Income: Update', 'pass')

    // Delete
    const { error: deleteError } = await (supabase
      .from('incomes') as any)
      .delete()
      .eq('id', incomeId)

    if (deleteError) throw deleteError
    logTest('Income: Delete', 'pass')

  } catch (err: any) {
    logTest('Income CRUD', 'fail', err.message)
    if (incomeId) {
      await (supabase.from('incomes') as any).delete().eq('id', incomeId)
    }
  }
}

async function testExpensesCRUD(userId: string) {
  console.log('\n📉 Testing Expenses CRUD...')

  let expenseId: string | null = null

  try {
    // Create
    const { data: created, error: createError } = await (supabase
      .from('expenses') as any)
      .insert({
        user_id: userId,
        amount: 1500,
        date: new Date().toISOString().split('T')[0],
        description: 'Test Expense',
      })
      .select()
      .single()

    if (createError) throw createError
    expenseId = created.id
    logTest('Expenses: Create', 'pass')

    // Read
    const { error: readError } = await (supabase
      .from('expenses') as any)
      .select('*')
      .eq('id', expenseId)
      .single()

    if (readError) throw readError
    logTest('Expenses: Read', 'pass')

    // Update
    const { error: updateError } = await (supabase
      .from('expenses') as any)
      .update({ amount: 2000 })
      .eq('id', expenseId)

    if (updateError) throw updateError
    logTest('Expenses: Update', 'pass')

    // Delete
    const { error: deleteError } = await (supabase
      .from('expenses') as any)
      .delete()
      .eq('id', expenseId)

    if (deleteError) throw deleteError
    logTest('Expenses: Delete', 'pass')

  } catch (err: any) {
    logTest('Expenses CRUD', 'fail', err.message)
    if (expenseId) {
      await (supabase.from('expenses') as any).delete().eq('id', expenseId)
    }
  }
}

async function testBudgetsCRUD(userId: string) {
  console.log('\n💵 Testing Budgets CRUD...')

  let budgetId: string | null = null
  let categoryId: string | null = null

  try {
    // First create a category for the budget
    const { data: category, error: catError } = await (supabase
      .from('expense_categories') as any)
      .insert({
        user_id: userId,
        name: 'Test Category',
        icon: 'Wallet',
        color: '#3B82F6',
      })
      .select()
      .single()

    if (catError) throw catError
    categoryId = category.id

    // Create budget
    const { data: created, error: createError } = await (supabase
      .from('budgets') as any)
      .insert({
        user_id: userId,
        category_id: categoryId,
        amount: 10000,
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (createError) throw createError
    budgetId = created.id
    logTest('Budgets: Create', 'pass')

    // Read
    const { error: readError } = await (supabase
      .from('budgets') as any)
      .select('*')
      .eq('id', budgetId)
      .single()

    if (readError) throw readError
    logTest('Budgets: Read', 'pass')

    // Update
    const { error: updateError } = await (supabase
      .from('budgets') as any)
      .update({ amount: 15000 })
      .eq('id', budgetId)

    if (updateError) throw updateError
    logTest('Budgets: Update', 'pass')

    // Delete
    const { error: deleteError } = await (supabase
      .from('budgets') as any)
      .delete()
      .eq('id', budgetId)

    if (deleteError) throw deleteError
    logTest('Budgets: Delete', 'pass')

  } catch (err: any) {
    logTest('Budgets CRUD', 'fail', err.message)
  } finally {
    // Cleanup
    if (budgetId) {
      await (supabase.from('budgets') as any).delete().eq('id', budgetId)
    }
    if (categoryId) {
      await (supabase.from('expense_categories') as any).delete().eq('id', categoryId)
    }
  }
}

async function testLoansCRUD(userId: string) {
  console.log('\n🏦 Testing Loans CRUD...')

  let loanId: string | null = null

  try {
    // Create
    const { data: created, error: createError } = await (supabase
      .from('loans') as any)
      .insert({
        user_id: userId,
        type: 'lent',
        person_name: 'Test Person',
        principal_amount: 5000,
        interest_rate: 10,
        date_issued: new Date().toISOString().split('T')[0],
        status: 'active',
      })
      .select()
      .single()

    if (createError) throw createError
    loanId = created.id
    logTest('Loans: Create', 'pass')

    // Read
    const { error: readError } = await (supabase
      .from('loans') as any)
      .select('*')
      .eq('id', loanId)
      .single()

    if (readError) throw readError
    logTest('Loans: Read', 'pass')

    // Add payment
    const { data: payment, error: paymentError } = await (supabase
      .from('loan_payments') as any)
      .insert({
        loan_id: loanId,
        amount: 1000,
        payment_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (paymentError) throw paymentError
    logTest('Loans: Add payment', 'pass')

    // Delete payment
    await (supabase.from('loan_payments') as any).delete().eq('id', payment.id)
    logTest('Loans: Delete payment', 'pass')

    // Delete loan
    const { error: deleteError } = await (supabase
      .from('loans') as any)
      .delete()
      .eq('id', loanId)

    if (deleteError) throw deleteError
    logTest('Loans: Delete', 'pass')

  } catch (err: any) {
    logTest('Loans CRUD', 'fail', err.message)
    if (loanId) {
      await (supabase.from('loan_payments') as any).delete().eq('loan_id', loanId)
      await (supabase.from('loans') as any).delete().eq('id', loanId)
    }
  }
}

async function testGoalsCRUD(userId: string) {
  console.log('\n🎯 Testing Goals CRUD...')

  let goalId: string | null = null

  try {
    // Create
    const { data: created, error: createError } = await (supabase
      .from('goals') as any)
      .insert({
        user_id: userId,
        name: 'Test Goal',
        target_amount: 100000,
        current_amount: 0,
        category: 'savings',
        priority: 'medium',
        status: 'active',
      })
      .select()
      .single()

    if (createError) throw createError
    goalId = created.id
    logTest('Goals: Create', 'pass')

    // Read
    const { error: readError } = await (supabase
      .from('goals') as any)
      .select('*')
      .eq('id', goalId)
      .single()

    if (readError) throw readError
    logTest('Goals: Read', 'pass')

    // Add contribution
    const { data: contribution, error: contribError } = await (supabase
      .from('goal_contributions') as any)
      .insert({
        goal_id: goalId,
        amount: 5000,
        contribution_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (contribError) throw contribError
    logTest('Goals: Add contribution', 'pass')

    // Delete contribution
    await (supabase.from('goal_contributions') as any).delete().eq('id', contribution.id)
    logTest('Goals: Delete contribution', 'pass')

    // Delete goal
    const { error: deleteError } = await (supabase
      .from('goals') as any)
      .delete()
      .eq('id', goalId)

    if (deleteError) throw deleteError
    logTest('Goals: Delete', 'pass')

  } catch (err: any) {
    logTest('Goals CRUD', 'fail', err.message)
    if (goalId) {
      await (supabase.from('goal_contributions') as any).delete().eq('goal_id', goalId)
      await (supabase.from('goals') as any).delete().eq('id', goalId)
    }
  }
}

async function testCategoriesCRUD(userId: string) {
  console.log('\n📁 Testing Categories CRUD...')

  let incomeCategoryId: string | null = null
  let expenseCategoryId: string | null = null

  try {
    // Income Category
    const { data: incCat, error: incError } = await (supabase
      .from('income_categories') as any)
      .insert({
        user_id: userId,
        name: 'Test Income Category',
        icon: 'Wallet',
        color: '#10B981',
      })
      .select()
      .single()

    if (incError) throw incError
    incomeCategoryId = incCat.id
    logTest('Income Categories: Create', 'pass')

    // Expense Category
    const { data: expCat, error: expError } = await (supabase
      .from('expense_categories') as any)
      .insert({
        user_id: userId,
        name: 'Test Expense Category',
        icon: 'ShoppingCart',
        color: '#EF4444',
      })
      .select()
      .single()

    if (expError) throw expError
    expenseCategoryId = expCat.id
    logTest('Expense Categories: Create', 'pass')

    // Cleanup
    await (supabase.from('income_categories') as any).delete().eq('id', incomeCategoryId)
    await (supabase.from('expense_categories') as any).delete().eq('id', expenseCategoryId)
    logTest('Categories: Delete', 'pass')

  } catch (err: any) {
    logTest('Categories CRUD', 'fail', err.message)
    if (incomeCategoryId) {
      await (supabase.from('income_categories') as any).delete().eq('id', incomeCategoryId)
    }
    if (expenseCategoryId) {
      await (supabase.from('expense_categories') as any).delete().eq('id', expenseCategoryId)
    }
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const total = results.length

  console.log(`Total: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results
      .filter(r => r.status === 'fail')
      .forEach(r => console.log(`   - ${r.test}: ${r.error}`))
  }

  console.log('='.repeat(50))
}

async function main() {
  console.log('🧪 PFET Application Test Suite')
  console.log('Testing Phases 1-8 functionality\n')

  // Test connection
  const connected = await testSupabaseConnection()
  if (!connected) {
    console.log('\n❌ Cannot proceed without Supabase connection')
    printSummary()
    process.exit(1)
  }

  // Test database tables exist
  await testDatabaseTables()

  // Test auth
  const userId = await testAuthFlow()

  if (userId) {
    // Run CRUD tests only if logged in
    await testAccountsCRUD(userId)
    await testCategoriesCRUD(userId)
    await testIncomeCRUD(userId)
    await testExpensesCRUD(userId)
    await testBudgetsCRUD(userId)
    await testLoansCRUD(userId)
    await testGoalsCRUD(userId)
  } else {
    console.log('\n⚠️  Skipping CRUD tests - no authenticated user')
    console.log('   Log in to the app first, then run this test again')
  }

  printSummary()
}

main().catch(console.error)
