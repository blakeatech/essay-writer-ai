"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-8 pt-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">Terms of Service</h1>
            <p className="text-gray-500">Last updated: April 13, 2025</p>
          </div>
          
          <div className="prose prose-gray max-w-none bg-white p-8 rounded-lg shadow-sm">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                These Terms of Service constitute a legally binding agreement between you and EssayGeniusAI ("we," "our," or
                "us") governing your access to and use of our essay generation service. By accessing or using our service,
                you agree to be bound by these Terms.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                EssayGeniusAI provides an AI-powered essay generation service designed to help college students with tedious
                and time-consuming essay assignments. Our service allows you to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">Generate polished, ready-to-submit essays based on your provided requirements</li>
                <li className="mb-2">Download completed essays in Word format only</li>
                <li className="mb-2">Save time on assignments that are often considered busy work</li>
              </ul>
              <p className="text-gray-700">
                We understand that college assignments can be overwhelming, and our service aims to help you manage your
                workload more efficiently by providing high-quality, customized essays in seconds.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To use certain features of our service, you must register for an account. You agree to provide accurate,
                current, and complete information during the registration process and to update such information to keep
                it accurate, current, and complete.
              </p>
              <p className="text-gray-700">
                You are responsible for safeguarding your password and for all activities that occur under your account.
                You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Payments and Billing</h2>
              <p className="text-gray-700 mb-4">
                EssayGeniusAI charges $25 per essay generated. Payment is required before essay generation and is
                non-refundable once the essay has been generated. We accept payment through our secure payment processors.
              </p>
              <p className="text-gray-700">
                By providing payment information, you represent and warrant that you are authorized to use the payment
                method and agree to be charged the fee for each essay you generate.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Essay Usage and Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                Upon payment and generation of an essay, you receive a license to use the essay for your personal academic
                purposes. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">The right to submit the essay as your own work</li>
                <li className="mb-2">The right to modify, edit, or adapt the essay</li>
                <li className="mb-2">The right to download the essay in Word format only</li>
              </ul>
              <p className="text-gray-700">
                While we grant you these rights, we retain ownership of the underlying technology and AI systems used to
                generate the essays. We also retain a copy of generated essays to improve our service.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Academic Integrity Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                EssayGeniusAI provides essays that are ready to submit. We recognize that many college assignments are
                tedious busy work, and our service is designed to help you manage these assignments efficiently. However,
                you acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">
                  You are responsible for understanding your institution's policies regarding academic integrity and
                  outside assistance
                </li>
                <li className="mb-2">You assume all responsibility for how you use the essays generated by our service</li>
                <li className="mb-2">We are not responsible for any academic consequences resulting from your use of our service</li>
              </ul>
            </section>
          </div>
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

