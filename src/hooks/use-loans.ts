'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Loan, LoanPayment } from '@/types'

interface LoanWithPayments extends Loan {
  loan_payments?: LoanPayment[]
  total_paid: number
  outstanding_balance: number
  total_with_interest: number
  is_overdue: boolean
  days_until_due: number | null
}

interface PaymentWithLoan extends LoanPayment {
  loans?: Loan
}

export function useLoans() {
  const [loans, setLoans] = useState<LoanWithPayments[]>([])
  const [payments, setPayments] = useState<PaymentWithLoan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const calculateLoanDetails = useCallback((loan: Loan, loanPayments: LoanPayment[]): LoanWithPayments => {
    const total_paid = loanPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    // Simple interest calculation: Principal * (1 + rate/100 * time_in_years)
    // For simplicity, we'll calculate interest based on the time elapsed
    const issueDate = new Date(loan.date_issued)
    const today = new Date()
    const yearsElapsed = (today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24 * 365)

    const interest = Number(loan.principal_amount) * (Number(loan.interest_rate) / 100) * Math.max(yearsElapsed, 0)
    const total_with_interest = Number(loan.principal_amount) + interest
    const outstanding_balance = Math.max(total_with_interest - total_paid, 0)

    // Check if overdue
    let is_overdue = false
    let days_until_due: number | null = null

    if (loan.due_date && loan.status === 'active') {
      const dueDate = new Date(loan.due_date)
      const diffTime = dueDate.getTime() - today.getTime()
      days_until_due = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      is_overdue = days_until_due < 0
    }

    return {
      ...loan,
      loan_payments: loanPayments,
      total_paid,
      outstanding_balance,
      total_with_interest,
      is_overdue,
      days_until_due,
    }
  }, [])

  const fetchLoans = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Fetch loans
      const { data: loansData, error: loansError } = await (supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('date_issued', { ascending: false }) as any)

      if (loansError) throw loansError

      // Fetch all payments
      const { data: paymentsData, error: paymentsError } = await (supabase
        .from('loan_payments')
        .select('*, loans(*)')
        .order('payment_date', { ascending: false }) as any)

      if (paymentsError) throw paymentsError

      // Group payments by loan
      const paymentsByLoan: Record<string, LoanPayment[]> = {}
      ;(paymentsData || []).forEach((payment: PaymentWithLoan) => {
        if (!paymentsByLoan[payment.loan_id]) {
          paymentsByLoan[payment.loan_id] = []
        }
        paymentsByLoan[payment.loan_id].push(payment)
      })

      // Calculate details for each loan
      const loansWithDetails = (loansData || []).map((loan: Loan) =>
        calculateLoanDetails(loan, paymentsByLoan[loan.id] || [])
      )

      setLoans(loansWithDetails)
      setPayments(paymentsData || [])
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, calculateLoanDetails])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  // Summary calculations
  const totalLent = loans
    .filter(l => l.type === 'lent' && l.status === 'active')
    .reduce((sum, l) => sum + l.outstanding_balance, 0)

  const totalBorrowed = loans
    .filter(l => l.type === 'borrowed' && l.status === 'active')
    .reduce((sum, l) => sum + l.outstanding_balance, 0)

  const overdueLoans = loans.filter(l => l.is_overdue && l.status === 'active')

  const upcomingPayments = loans
    .filter(l => l.status === 'active' && l.days_until_due !== null && l.days_until_due >= 0 && l.days_until_due <= 30)
    .sort((a, b) => (a.days_until_due || 0) - (b.days_until_due || 0))

  const createLoan = async (data: {
    type: 'lent' | 'borrowed'
    person_name: string
    person_contact?: string | null
    principal_amount: number
    interest_rate: number
    date_issued: string
    due_date?: string | null
    notes?: string | null
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: { message: 'Not authenticated' } }

      const { data: loan, error } = await (supabase
        .from('loans') as any)
        .insert({
          user_id: user.id,
          type: data.type,
          person_name: data.person_name,
          person_contact: data.person_contact,
          principal_amount: data.principal_amount,
          interest_rate: data.interest_rate,
          amount_paid: 0,
          date_issued: data.date_issued,
          due_date: data.due_date,
          status: 'active',
          notes: data.notes,
        })
        .select()
        .single()

      if (error) return { error }

      await fetchLoans()
      return { data: loan, error: null }
    } catch (error) {
      return { error: { message: 'Failed to create loan' } }
    }
  }

  const updateLoan = async (
    id: string,
    data: Partial<{
      person_name: string
      person_contact: string | null
      principal_amount: number
      interest_rate: number
      date_issued: string
      due_date: string | null
      status: 'active' | 'paid' | 'defaulted' | 'forgiven'
      notes: string | null
    }>
  ) => {
    try {
      const { error } = await (supabase
        .from('loans') as any)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) return { error }

      await fetchLoans()
      return { error: null }
    } catch (error) {
      return { error: { message: 'Failed to update loan' } }
    }
  }

  const deleteLoan = async (id: string) => {
    try {
      // First delete associated payments
      await (supabase
        .from('loan_payments') as any)
        .delete()
        .eq('loan_id', id)

      const { error } = await (supabase
        .from('loans') as any)
        .delete()
        .eq('id', id)

      if (error) return { error }

      await fetchLoans()
      return { error: null }
    } catch (error) {
      return { error: { message: 'Failed to delete loan' } }
    }
  }

  const addPayment = async (data: {
    loan_id: string
    amount: number
    payment_date: string
    notes?: string | null
  }) => {
    try {
      const { data: payment, error } = await (supabase
        .from('loan_payments') as any)
        .insert({
          loan_id: data.loan_id,
          amount: data.amount,
          payment_date: data.payment_date,
          notes: data.notes,
        })
        .select()
        .single()

      if (error) return { error }

      // Update the loan's amount_paid
      const loan = loans.find(l => l.id === data.loan_id)
      if (loan) {
        const newAmountPaid = loan.total_paid + data.amount
        await (supabase
          .from('loans') as any)
          .update({
            amount_paid: newAmountPaid,
            status: newAmountPaid >= loan.total_with_interest ? 'paid' : 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.loan_id)
      }

      await fetchLoans()
      return { data: payment, error: null }
    } catch (error) {
      return { error: { message: 'Failed to add payment' } }
    }
  }

  const deletePayment = async (paymentId: string, loanId: string) => {
    try {
      const payment = payments.find(p => p.id === paymentId)
      if (!payment) return { error: { message: 'Payment not found' } }

      const { error } = await (supabase
        .from('loan_payments') as any)
        .delete()
        .eq('id', paymentId)

      if (error) return { error }

      // Update the loan's amount_paid
      const loan = loans.find(l => l.id === loanId)
      if (loan) {
        const newAmountPaid = Math.max(loan.total_paid - Number(payment.amount), 0)
        await (supabase
          .from('loans') as any)
          .update({
            amount_paid: newAmountPaid,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', loanId)
      }

      await fetchLoans()
      return { error: null }
    } catch (error) {
      return { error: { message: 'Failed to delete payment' } }
    }
  }

  return {
    loans,
    payments,
    isLoading,
    totalLent,
    totalBorrowed,
    overdueLoans,
    upcomingPayments,
    createLoan,
    updateLoan,
    deleteLoan,
    addPayment,
    deletePayment,
    refetch: fetchLoans,
  }
}
