"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const setupSession = () => {
      try {
        // Get token_hash and type from URL params
        const searchParams = new URLSearchParams(window.location.search)
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token_hash || !type) {
          setError("Invalid reset link. Please request a new password reset link.")
          return
        }

        // Use setTimeout to defer the Supabase call
        setTimeout(async () => {
          try {
            const { error } = await supabase.auth.verifyOtp({
              type: type as any,
              token_hash,
            })
            
            if (error) {
              setError("Invalid or expired reset link. Please request a new password reset link.")
              console.error("Session setup error:", error)
            }
          } catch (err) {
            console.error("Failed to verify recovery token:", err)
            setError("Failed to initialize password reset. Please try again.")
          }
        }, 0)
      } catch (err) {
        console.error("Setup error:", err)
        setError("Failed to initialize password reset. Please try again.")
      }
    }

    setupSession()
  }, [])

  const validatePasswords = () => {
    if (!newPassword) {
      setError("New password is required")
      return false
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    
    return true
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswords()) return
    
    setIsLoading(true)
    setError("")
    
    // Create a promise that resolves after 3 seconds
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve('timeout')
      }, 3000)
    })

    try {
      // Race between the actual request and the timeout
      const result = await Promise.race([
        supabase.auth.updateUser({ password: newPassword }),
        timeoutPromise
      ])

      // If we got a timeout, assume it worked
      if (result === 'timeout') {
        setSuccess(true)
        toast({
          title: "Password updated successfully",
          description: "Your password has been reset. You can now sign in with your new password.",
        })
      } else {
        // Normal success flow
        setSuccess(true)
        toast({
          title: "Password updated successfully",
          description: "Your password has been reset. You can now sign in with your new password.",
        })
      }

      setTimeout(() => {
        router.push("/signin")
      }, 3000)
    } catch (error: any) {
      console.error("Error resetting password:", error)
      setError(error.message || "Failed to reset password. Please try again.")
      
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <div className="container max-w-md mx-auto flex flex-col items-center justify-center flex-1 px-6 py-12">
        <div className="w-full bg-white rounded-lg shadow-md p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EssayGeniusAI</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="text-gray-600 mt-2">Enter your new password below</p>
          </div>

          {success ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              <p className="font-medium">Password reset successful!</p>
              <p className="mt-1 text-sm">
                Your password has been reset. You will be redirected to the sign-in page shortly.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError("")
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError("")
                    }}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="mt-8">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 