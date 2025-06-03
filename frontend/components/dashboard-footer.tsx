import Link from "next/link"

export default function DashboardFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-2 sm:mb-0">
            <p>© 2025 EssayGeniusAI. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/terms-of-service" className="hover:text-primary hover:underline">
              Terms
            </Link>
            <Link href="/privacy-policy" className="hover:text-primary hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 