import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="min-h-[calc(100vh-144px)] flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
            <p className="text-gray-600 max-w-md">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
} 