import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold text-white">EssayGeniusAI</span>
            </Link>
            <p className="text-sm leading-6 text-gray-300 mt-2">
              Helping students write better essays with AI assistance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">

            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
              <ul role="list" className="mt-4 space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-sm leading-6 text-gray-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-sm leading-6 text-gray-300 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-xs leading-5 text-gray-400 text-center">
            &copy; {new Date().getFullYear()} EssayGeniusAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

