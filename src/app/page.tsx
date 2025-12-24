import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  PieChart,
  Target,
  Calculator,
  Shield,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Wallet,
    title: 'Multi-Account Management',
    description: 'Track primary, savings, investment, and sacco accounts all in one place.',
  },
  {
    icon: TrendingUp,
    title: 'Income & Expense Tracking',
    description: 'Categorize and monitor your income sources and spending habits.',
  },
  {
    icon: PieChart,
    title: 'Smart Budgeting',
    description: 'Set budgets by category and get alerts when you\'re close to limits.',
  },
  {
    icon: Target,
    title: 'Financial Goals',
    description: 'Set savings goals and track your progress towards achieving them.',
  },
  {
    icon: Calculator,
    title: 'PAYE Calculator',
    description: 'Calculate your net salary with PAYE, NHIF, NSSF, and Housing Levy deductions.',
  },
  {
    icon: Shield,
    title: 'Unofficial Loans',
    description: 'Track money lent to or borrowed from friends and family.',
  },
]

const benefits = [
  'Track all your accounts in one dashboard',
  'Understand where your money goes',
  'Set and achieve financial goals',
  'Calculate your Kenya tax deductions',
  'Generate detailed financial reports',
  'Access from any device',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">PFET</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>Built for Kenyan salary workers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Take Control of Your
            <span className="text-primary"> Personal Finances</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track expenses, set budgets, monitor your goals, and calculate your PAYE deductions - all in one beautiful, easy-to-use application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Tracking Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to manage your money
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              PFET provides all the tools you need to understand your finances and make better financial decisions.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why use PFET?
              </h2>
              <p className="text-muted-foreground mb-8">
                Whether you&apos;re just starting your financial journey or looking to optimize your money management, PFET gives you the clarity you need.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Kenya Tax Calculator</CardTitle>
                <CardDescription>
                  Calculate your net salary instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Gross Salary</span>
                  <span className="font-medium">KSh 100,000</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">PAYE</span>
                  <span className="font-medium text-red-500">- KSh 18,480</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">NHIF</span>
                  <span className="font-medium text-red-500">- KSh 1,700</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">NSSF</span>
                  <span className="font-medium text-red-500">- KSh 2,160</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Housing Levy</span>
                  <span className="font-medium text-red-500">- KSh 1,500</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Net Salary</span>
                  <span className="text-green-600">KSh 76,160</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of Kenyans who are already using PFET to manage their money better.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">PFET</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Designed and Created by @kevinkelly &copy; {new Date().getFullYear()}
            </p>
            <p className="text-sm text-muted-foreground">
              Where&apos;s My Money
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
