"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-8 pt-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: April 13, 2025</p>
          </div>
          
          <div className="prose prose-gray max-w-none bg-white p-8 rounded-lg shadow-sm">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                At EssayGeniusAI, we respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit 
                our website and tell you about your privacy rights and how the law protects you.
              </p>
              <p className="text-gray-700">
                This privacy policy aims to give you information on how EssayGeniusAI collects and processes 
                your personal data through your use of this website, including any data you may provide 
                through this website when you sign up for our service, purchase a product, or use our services.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. The Data We Collect About You</h2>
              <p className="text-gray-700 mb-4">
                Personal data, or personal information, means any information about an individual from which 
                that person can be identified. It does not include data where the identity has been removed 
                (anonymous data).
              </p>
              <p className="text-gray-700 mb-4">
                We may collect, use, store and transfer different kinds of personal data about you which we 
                have grouped together as follows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2"><span className="font-medium">Identity Data</span> includes first name, last name, username or similar identifier.</li>
                <li className="mb-2"><span className="font-medium">Contact Data</span> includes email address and telephone numbers.</li>
                <li className="mb-2"><span className="font-medium">Financial Data</span> includes payment card details.</li>
                <li className="mb-2"><span className="font-medium">Transaction Data</span> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                <li className="mb-2"><span className="font-medium">Technical Data</span> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Personal Data</h2>
              <p className="text-gray-700 mb-4">
                We will only use your personal data when the law allows us to. Most commonly, we will use your 
                personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li className="mb-2">Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                <li className="mb-2">Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li className="mb-2">Where we need to comply with a legal obligation.</li>
              </ul>
              <p className="text-gray-700">
                Generally, we do not rely on consent as a legal basis for processing your personal data 
                although we will get your consent before sending third party direct marketing communications 
                to you via email or text message. You have the right to withdraw consent to marketing at any time.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We have put in place appropriate security measures to prevent your personal data from being 
                accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, 
                we limit access to your personal data to those employees, agents, contractors and other third 
                parties who have a business need to know.
              </p>
              <p className="text-gray-700">
                We have put in place procedures to deal with any suspected personal data breach and will notify 
                you and any applicable regulator of a breach where we are legally required to do so.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Legal Rights</h2>
              <p className="text-gray-700 mb-4">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-2"><span className="font-medium">Request access</span> to your personal data.</li>
                <li className="mb-2"><span className="font-medium">Request correction</span> of your personal data.</li>
                <li className="mb-2"><span className="font-medium">Request erasure</span> of your personal data.</li>
                <li className="mb-2"><span className="font-medium">Object to processing</span> of your personal data.</li>
                <li className="mb-2"><span className="font-medium">Request restriction of processing</span> your personal data.</li>
                <li className="mb-2"><span className="font-medium">Request transfer</span> of your personal data.</li>
                <li className="mb-2"><span className="font-medium">Right to withdraw consent</span>.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}