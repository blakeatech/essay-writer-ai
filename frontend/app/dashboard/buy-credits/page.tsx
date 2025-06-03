"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import { Check, Coins, Minus, Plus, Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { essayAPI } from '../../services/api'
import { toast } from "@/components/ui/use-toast"
import DashboardFooter from "@/components/dashboard-footer"

export default function BuyCreditsPage() {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      const checkoutUrl = await essayAPI.createCheckoutSession(quantity)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Stop Wasting Time</CardTitle>
              <CardDescription>Each credit gets you a complete essay written for you</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Complete essay with sources and citations in minutes</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>No more endless research or writing for hours</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Ready-to-submit Word document with perfect formatting</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Focus on what matters in college instead of busy work</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Buy Essay Credits</CardTitle>
              <CardDescription>One credit = One complete essay written for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-4xl font-bold">
                <Coins className="h-8 w-8 text-primary" />
                <span>${(25 * quantity).toFixed(2)}</span>
                <span className="text-base text-gray-500 font-normal">
                  (${25} per essay)
                </span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-16 text-center text-xl font-semibold">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Buy ${quantity} Credit${quantity > 1 ? 's' : ''}`
                )}
              </Button>

              <p className="text-sm text-gray-500 mt-4 text-center">
                All credit purchases are final and non-refundable
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}