"use client"

import DashboardHeader from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Image from "next/image"
import DashboardFooter from "@/components/dashboard-footer"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">We're Here to Help!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden relative">
                  <Image 
                    src="/kristi.png" 
                    alt="Kristi - Customer Support Specialist"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Meet Kristi</h3>
                <p className="text-gray-600">
                  Our customer support specialist Kristi would be happy to help you with any questions or concerns you might have.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-600">
                Please reach out to us via our <a href="https://www.instagram.com/essaygeniusai/" className="text-primary hover:underline font-medium">Instagram page</a>.
              </div>

              <p className="text-sm text-gray-500">
                We typically respond within 24 hours during business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
} 