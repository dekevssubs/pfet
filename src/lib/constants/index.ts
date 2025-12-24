// App constants

export const APP_NAME = 'PFET'
export const APP_DESCRIPTION = 'Personal Finance and Expense Tracker'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Currency
export const DEFAULT_CURRENCY = 'KES'
export const CURRENCY_SYMBOL = 'KSh'

// Navigation items
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Accounts',
    href: '/accounts',
    icon: 'Wallet',
  },
  {
    title: 'Income',
    href: '/income',
    icon: 'TrendingUp',
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: 'TrendingDown',
  },
  {
    title: 'Budgets',
    href: '/budgets',
    icon: 'PieChart',
  },
  {
    title: 'Loans',
    href: '/loans',
    icon: 'HandCoins',
  },
  {
    title: 'Goals',
    href: '/goals',
    icon: 'Target',
  },
  {
    title: 'PAYE Calculator',
    href: '/calculator',
    icon: 'Calculator',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: 'FileText',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
] as const

// Account types with labels and colors
export const ACCOUNT_TYPES = {
  primary: { label: 'Primary Account', color: '#3B82F6', icon: 'Landmark' },
  secondary: { label: 'Secondary Account', color: '#10B981', icon: 'Building' },
  savings: { label: 'Savings Account', color: '#F59E0B', icon: 'PiggyBank' },
  investment: { label: 'Investment Account', color: '#8B5CF6', icon: 'TrendingUp' },
  sacco: { label: 'Sacco Account', color: '#EC4899', icon: 'Users' },
} as const

// Default income categories
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'Briefcase', color: '#3B82F6' },
  { name: 'Business Income', icon: 'Store', color: '#10B981' },
  { name: 'Side Hustle', icon: 'Zap', color: '#F59E0B' },
  { name: 'Freelance', icon: 'Laptop', color: '#8B5CF6' },
  { name: 'Dividends', icon: 'TrendingUp', color: '#EC4899' },
  { name: 'Interest', icon: 'Percent', color: '#06B6D4' },
  { name: 'Rental Income', icon: 'Home', color: '#84CC16' },
  { name: 'Gifts', icon: 'Gift', color: '#F43F5E' },
  { name: 'Refunds', icon: 'RotateCcw', color: '#64748B' },
  { name: 'Other', icon: 'MoreHorizontal', color: '#6B7280' },
] as const

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  {
    name: 'Food & Dining',
    icon: 'UtensilsCrossed',
    color: '#F59E0B',
    subcategories: ['Groceries', 'Restaurants', 'Fast Food', 'Coffee & Snacks'],
  },
  {
    name: 'Transportation',
    icon: 'Car',
    color: '#3B82F6',
    subcategories: ['Fuel', 'Public Transport', 'Uber/Bolt', 'Vehicle Maintenance', 'Parking'],
  },
  {
    name: 'Housing',
    icon: 'Home',
    color: '#10B981',
    subcategories: ['Rent', 'Electricity', 'Water', 'Gas', 'Internet', 'Home Maintenance'],
  },
  {
    name: 'Healthcare',
    icon: 'Heart',
    color: '#EF4444',
    subcategories: ['Medical Bills', 'Pharmacy', 'Health Insurance'],
  },
  {
    name: 'Personal Care',
    icon: 'Sparkles',
    color: '#EC4899',
    subcategories: ['Clothing', 'Grooming', 'Gym & Fitness'],
  },
  {
    name: 'Entertainment',
    icon: 'Tv',
    color: '#8B5CF6',
    subcategories: ['Movies & Events', 'Streaming Services', 'Hobbies', 'Vacations'],
  },
  {
    name: 'Education',
    icon: 'GraduationCap',
    color: '#06B6D4',
    subcategories: ['School Fees', 'Books & Supplies', 'Courses & Training'],
  },
  {
    name: 'Financial',
    icon: 'Landmark',
    color: '#64748B',
    subcategories: ['Bank Fees', 'Loan Payments', 'Insurance', 'Investments'],
  },
  {
    name: 'Family',
    icon: 'Users',
    color: '#F43F5E',
    subcategories: ['Childcare', 'Family Support', 'Gifts'],
  },
  {
    name: 'Other',
    icon: 'MoreHorizontal',
    color: '#6B7280',
    subcategories: ['Miscellaneous', 'Charity/Donations'],
  },
] as const

// Recurring frequencies
export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const

// Budget periods
export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const

// Loan statuses
export const LOAN_STATUSES = {
  active: { label: 'Active', color: '#3B82F6' },
  paid: { label: 'Paid', color: '#10B981' },
  defaulted: { label: 'Defaulted', color: '#EF4444' },
  forgiven: { label: 'Forgiven', color: '#6B7280' },
} as const

// Goal categories
export const GOAL_CATEGORIES = [
  { value: 'savings', label: 'Savings', icon: 'PiggyBank' },
  { value: 'investment', label: 'Investment', icon: 'TrendingUp' },
  { value: 'debt_payoff', label: 'Debt Payoff', icon: 'CreditCard' },
  { value: 'purchase', label: 'Purchase', icon: 'ShoppingBag' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: 'Shield' },
  { value: 'other', label: 'Other', icon: 'Target' },
] as const

// Goal priorities
export const GOAL_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6B7280' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
] as const

// Kenya Tax Constants (2024)
export const KENYA_TAX = {
  // PAYE Tax Bands (Monthly)
  PAYE_BANDS: [
    { min: 0, max: 24000, rate: 0.10 },
    { min: 24001, max: 32333, rate: 0.25 },
    { min: 32334, max: 500000, rate: 0.30 },
    { min: 500001, max: 800000, rate: 0.325 },
    { min: 800001, max: Infinity, rate: 0.35 },
  ],

  // Personal Relief (Monthly)
  PERSONAL_RELIEF: 2400,

  // NHIF Rates
  NHIF_RATES: [
    { min: 0, max: 5999, contribution: 150 },
    { min: 6000, max: 7999, contribution: 300 },
    { min: 8000, max: 11999, contribution: 400 },
    { min: 12000, max: 14999, contribution: 500 },
    { min: 15000, max: 19999, contribution: 600 },
    { min: 20000, max: 24999, contribution: 750 },
    { min: 25000, max: 29999, contribution: 850 },
    { min: 30000, max: 34999, contribution: 900 },
    { min: 35000, max: 39999, contribution: 950 },
    { min: 40000, max: 44999, contribution: 1000 },
    { min: 45000, max: 49999, contribution: 1100 },
    { min: 50000, max: 59999, contribution: 1200 },
    { min: 60000, max: 69999, contribution: 1300 },
    { min: 70000, max: 79999, contribution: 1400 },
    { min: 80000, max: 89999, contribution: 1500 },
    { min: 90000, max: 99999, contribution: 1600 },
    { min: 100000, max: Infinity, contribution: 1700 },
  ],

  // NSSF (New Rates)
  NSSF: {
    TIER_I_LIMIT: 7000,
    TIER_II_LIMIT: 36000,
    RATE: 0.06,
    MAX_TIER_I: 420, // 6% of 7000
    MAX_TIER_II: 1740, // 6% of (36000 - 7000)
    MAX_TOTAL: 2160,
  },

  // Housing Levy
  HOUSING_LEVY_RATE: 0.015, // 1.5%

  // Insurance Relief Rate
  INSURANCE_RELIEF_RATE: 0.15, // 15% of premiums, max 5000/month
  INSURANCE_RELIEF_MAX: 5000,
} as const

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd'
export const DATE_DISPLAY_FORMAT = 'dd MMM yyyy'
export const MONTH_FORMAT = 'MMMM yyyy'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Chart colors
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F43F5E', // Rose
  '#6366F1', // Indigo
] as const
