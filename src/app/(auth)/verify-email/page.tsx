import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to your email address.
          Please check your inbox and click the link to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">What to do next:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Check your email inbox</li>
            <li>Click the verification link</li>
            <li>Come back here and sign in</li>
          </ol>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Didn&apos;t receive the email? Check your spam folder or contact support.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
