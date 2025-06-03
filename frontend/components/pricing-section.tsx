import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple pricing</h2>
          <p className="mt-4 text-lg text-gray-600">One essay, one price. No subscriptions.</p>
        </div>

        <div className="mx-auto max-w-lg">
          <div className="flex flex-col p-8 bg-white rounded-3xl shadow-lg ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">Per Essay</h3>
            <p className="mt-4 text-sm text-gray-600">
              Get a complete, ready-to-submit essay
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-gray-900">$25</span>
              <span className="text-sm font-semibold text-gray-600">/essay</span>
            </p>

            <Button className="mt-8" asChild>
              <Link href="/signup">Get started</Link>
            </Button>

            <ul className="mt-8 space-y-3 text-sm text-gray-600">
              <li className="flex gap-x-3">
                <Check className="h-5 w-5 flex-none text-primary" />
                <span>Complete essay with sources</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-5 w-5 flex-none text-primary" />
                <span>Up to 3,000 words</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-5 w-5 flex-none text-primary" />
                <span>Title and reference pages included</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-5 w-5 flex-none text-primary" />
                <span>Proper citations and formatting</span>
              </li>
              <li className="flex gap-x-3">
                <Check className="h-5 w-5 flex-none text-primary" />
                <span>Ready to submit Word document</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

