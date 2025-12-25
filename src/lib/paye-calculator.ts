/**
 * Kenya PAYE Calculator
 * Updated with 2024 tax rates
 */

// PAYE Tax Bands (Monthly)
export const PAYE_BANDS = [
  { min: 0, max: 24000, rate: 0.10 },
  { min: 24001, max: 32333, rate: 0.25 },
  { min: 32334, max: 500000, rate: 0.30 },
  { min: 500001, max: 800000, rate: 0.325 },
  { min: 800001, max: Infinity, rate: 0.35 },
] as const

// Personal Relief (Monthly)
export const PERSONAL_RELIEF = 2400

// Insurance Relief Rate (15% of insurance premiums, max KES 5,000/month)
export const INSURANCE_RELIEF_RATE = 0.15
export const MAX_INSURANCE_RELIEF = 5000

// NHIF Rates (Monthly contributions based on gross salary)
export const NHIF_RATES = [
  { min: 0, max: 5999, amount: 150 },
  { min: 6000, max: 7999, amount: 300 },
  { min: 8000, max: 11999, amount: 400 },
  { min: 12000, max: 14999, amount: 500 },
  { min: 15000, max: 19999, amount: 600 },
  { min: 20000, max: 24999, amount: 750 },
  { min: 25000, max: 29999, amount: 850 },
  { min: 30000, max: 34999, amount: 900 },
  { min: 35000, max: 39999, amount: 950 },
  { min: 40000, max: 44999, amount: 1000 },
  { min: 45000, max: 49999, amount: 1100 },
  { min: 50000, max: 59999, amount: 1200 },
  { min: 60000, max: 69999, amount: 1300 },
  { min: 70000, max: 79999, amount: 1400 },
  { min: 80000, max: 89999, amount: 1500 },
  { min: 90000, max: 99999, amount: 1600 },
  { min: 100000, max: Infinity, amount: 1700 },
] as const

// NSSF Rates (New rates effective Feb 2024)
export const NSSF_TIER_1_LIMIT = 7000 // Lower Earnings Limit
export const NSSF_TIER_2_LIMIT = 36000 // Upper Earnings Limit
export const NSSF_RATE = 0.06 // 6% contribution rate

// Housing Levy Rate
export const HOUSING_LEVY_RATE = 0.015 // 1.5%

export interface PAYEInput {
  grossSalary: number
  allowances?: number // Non-taxable allowances
  benefits?: number // Taxable benefits
  pension?: number // Pension contribution (tax-deductible)
  insurance?: number // Insurance premium for relief
  disability?: boolean // Disability exemption
}

export interface PAYEResult {
  grossSalary: number
  taxableIncome: number

  // Deductions
  paye: number
  nhif: number
  nssf: number
  housingLevy: number
  pension: number

  // Relief
  personalRelief: number
  insuranceRelief: number

  // Tax calculation breakdown
  grossTax: number
  taxRelief: number
  netTax: number

  // Final
  totalDeductions: number
  netSalary: number

  // Breakdown by band
  taxByBand: Array<{
    band: string
    taxableAmount: number
    rate: number
    tax: number
  }>
}

/**
 * Calculate NHIF contribution based on gross salary
 */
export function calculateNHIF(grossSalary: number): number {
  const bracket = NHIF_RATES.find(
    (rate) => grossSalary >= rate.min && grossSalary <= rate.max
  )
  return bracket?.amount || 1700 // Default to max if above all brackets
}

/**
 * Calculate NSSF contribution (employee portion)
 * Tier I: 6% of first KES 7,000 = max KES 420
 * Tier II: 6% of amount between 7,000 and 36,000 = max KES 1,740
 * Total max: KES 2,160
 */
export function calculateNSSF(grossSalary: number): number {
  // Tier I contribution
  const tier1Earnings = Math.min(grossSalary, NSSF_TIER_1_LIMIT)
  const tier1Contribution = tier1Earnings * NSSF_RATE

  // Tier II contribution (only on earnings between Tier 1 and Tier 2 limits)
  const tier2Earnings = Math.max(0, Math.min(grossSalary, NSSF_TIER_2_LIMIT) - NSSF_TIER_1_LIMIT)
  const tier2Contribution = tier2Earnings * NSSF_RATE

  return Math.round(tier1Contribution + tier2Contribution)
}

/**
 * Calculate Housing Levy (1.5% of gross salary)
 */
export function calculateHousingLevy(grossSalary: number): number {
  return Math.round(grossSalary * HOUSING_LEVY_RATE)
}

/**
 * Calculate PAYE tax with band breakdown
 */
export function calculatePAYE(taxableIncome: number): {
  grossTax: number
  taxByBand: PAYEResult['taxByBand']
} {
  let remainingIncome = taxableIncome
  let grossTax = 0
  const taxByBand: PAYEResult['taxByBand'] = []

  for (const band of PAYE_BANDS) {
    if (remainingIncome <= 0) break

    const bandWidth = band.max === Infinity ? remainingIncome : band.max - band.min + 1
    const taxableInBand = Math.min(remainingIncome, bandWidth)
    const taxInBand = taxableInBand * band.rate

    if (taxableInBand > 0) {
      taxByBand.push({
        band: band.max === Infinity
          ? `Above KES ${band.min.toLocaleString()}`
          : `KES ${band.min.toLocaleString()} - ${band.max.toLocaleString()}`,
        taxableAmount: taxableInBand,
        rate: band.rate * 100,
        tax: Math.round(taxInBand),
      })
    }

    grossTax += taxInBand
    remainingIncome -= taxableInBand
  }

  return { grossTax: Math.round(grossTax), taxByBand }
}

/**
 * Calculate insurance relief (15% of premium, max KES 5,000/month)
 */
export function calculateInsuranceRelief(insurancePremium: number): number {
  const relief = insurancePremium * INSURANCE_RELIEF_RATE
  return Math.min(relief, MAX_INSURANCE_RELIEF)
}

/**
 * Main PAYE calculation function
 */
export function calculateNetSalary(input: PAYEInput): PAYEResult {
  const {
    grossSalary,
    allowances = 0,
    benefits = 0,
    pension = 0,
    insurance = 0,
    disability = false,
  } = input

  // Calculate statutory deductions
  const nhif = calculateNHIF(grossSalary)
  const nssf = calculateNSSF(grossSalary)
  const housingLevy = calculateHousingLevy(grossSalary)

  // Calculate taxable income
  // Taxable = Gross + Benefits - Pension - NSSF
  const taxableIncome = Math.max(0, grossSalary + benefits - pension - nssf)

  // Calculate PAYE
  const { grossTax, taxByBand } = calculatePAYE(taxableIncome)

  // Calculate reliefs
  const personalRelief = PERSONAL_RELIEF
  const insuranceRelief = calculateInsuranceRelief(insurance)
  const totalRelief = personalRelief + insuranceRelief

  // Net tax (cannot be negative)
  // Persons with disability get 50% tax exemption on first KES 150,000/month
  let netTax = Math.max(0, grossTax - totalRelief)
  if (disability) {
    netTax = Math.round(netTax * 0.5) // 50% exemption for disability
  }

  // Total deductions
  const totalDeductions = netTax + nhif + nssf + housingLevy + pension

  // Net salary
  const netSalary = grossSalary + allowances + benefits - totalDeductions

  return {
    grossSalary,
    taxableIncome,
    paye: netTax,
    nhif,
    nssf,
    housingLevy,
    pension,
    personalRelief,
    insuranceRelief,
    grossTax,
    taxRelief: totalRelief,
    netTax,
    totalDeductions,
    netSalary,
    taxByBand,
  }
}

/**
 * Format currency for display
 */
export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
