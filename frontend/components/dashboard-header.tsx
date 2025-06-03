"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Menu, Settings, User, Coins } from "lucide-react"
import { getUserCredits } from '@/lib/userProfile'
import { useAuth } from '../app/contexts/AuthContext'
import { getCredits } from '@/app/api/essay-api'
import { supabase } from '@/lib/supabase'

export default function DashboardHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        if (user) {
          const userCredits = await getCredits()
          setCredits(userCredits)
        }
      } catch (error) {
        console.error('Error fetching credits:', error)
      }
    }

    // Initial fetch
    fetchCredits()

    // Set up realtime subscription
    const subscription = supabase
      .channel('user_credits')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user?.id}`
        },
        async (payload) => {
          console.log('Credits changed:', payload)
          // Fetch latest credits when profile changes
          fetchCredits()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await logout()
      // Router redirection is handled inside the logout function
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EssayGeniusAI</span>
            </Link>

            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/dashboard" className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link
                href="/dashboard/buy-credits"
                className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Buy More Credits
              </Link>
              <Link href="/dashboard/help" className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">
                Help
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {credits === 0 ? (
              <Link href="/dashboard/buy-credits">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Get credits to start writing
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900">
                <Coins className="h-4 w-4 text-primary" />
                <span>{credits ?? '-'} credits</span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.email || 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {credits === 0 ? (
              <Link href="/dashboard/buy-credits">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Get credits to start writing
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-900">
                <Coins className="h-4 w-4 text-primary" />
                <span>{credits ?? '-'} credits</span>
              </div>
            )}
            <Link
              href="/dashboard"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/buy-credits"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buy More Credits
            </Link>
            <Link
              href="/dashboard/help"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            <button
              className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

