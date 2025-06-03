"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="container max-w-md mx-auto flex flex-col items-center justify-center flex-1 px-6 py-12">
        <div className="w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EssayGeniusAI</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="text-gray-600 mt-4">
              We have sent a verification link to your email address.
            </p>
            <p className="text-gray-600 mt-2">
              Please click the link in the email to complete your registration.
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or try signing up again.
          </p>

          <div className="mt-8">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 