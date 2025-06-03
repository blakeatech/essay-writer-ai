"use client"
import Link from "next/link"
import { ArrowRight, CheckCircle, Sparkles, BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Testimonials from "@/components/testimonials"
import PricingSection from "@/components/pricing-section"
import FeatureSection from "@/components/feature-section"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function Home() {
  const [activeImage, setActiveImage] = useState(0)
  const images = ["/landing/1.png", "/landing/2.png"]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((current) => (current === 0 ? 1 : 0))
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="flex flex-col justify-center relative">
              {/* Free Credit Badge - now using relative positioning */}
              <div className="flex mb-6">
                <motion.div 
                  className="w-32 h-32 rounded-full bg-primary text-white flex flex-col items-center justify-center shadow-lg transform"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 6 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5
                  }}
                >
                  <CheckCircle className="h-6 w-6 mb-1" />
                  <p className="text-xs font-bold text-center leading-tight px-2">
                    First paper FREE!
                  </p>
                  <p className="text-[10px] text-center leading-tight px-1">
                    New users get 1 credit
                  </p>
                </motion.div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Get your essays</span>
                <span className="block text-primary">written for you</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                EssayGeniusAI generates complete, well-researched essays with citations in minutes. Stop spending hours on 
                assignments that get barely read and focus on what really matters in college.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Get started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">Learn more</Link>
                </Button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative w-full h-[500px] sm:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl max-w-[1000px] bg-gradient-to-br from-gray-900 to-gray-800 p-8">
                <div className="relative h-full w-full flex items-center justify-center">
                  {/* Computer mockup */}
                  <motion.div 
                    className="relative w-[80%] h-[70%] bg-gray-800 rounded-lg border-2 border-gray-700 shadow-lg z-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Computer screen */}
                    <div className="absolute inset-2 bg-white rounded overflow-hidden flex flex-col">
                      {/* Screen header */}
                      <div className="h-6 bg-gray-800 flex items-center px-2">
                        <div className="flex space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <div className="mx-auto text-xs text-gray-400 font-mono">EssayGeniusAI</div>
                      </div>
                      
                      {/* Screen content - Essay Generator UI */}
                      <div className="flex-1 p-4 bg-gray-50 text-gray-800 flex flex-col">
                        <div className="flex items-center mb-4">
                          <div className="text-lg font-bold text-primary">EssayGeniusAI</div>
                          <div className="ml-auto flex space-x-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">?</div>
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">JD</div>
                          </div>
                        </div>
                        
                        {/* Form fields */}
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                            <span>Essay Title</span>
                            <span className="text-red-500 ml-1">*</span>
                          </div>
                          <div className="bg-white border border-gray-300 rounded-md p-2 text-sm shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1, duration: 0.5 }}
                            >
                              The Symbolism of Light in Gothic Literature
                            </motion.span>
                            <motion.span 
                              className="inline-block w-1 h-4 bg-primary ml-1 align-middle"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                            />
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                            <span>Description</span>
                            <span className="text-red-500 ml-1">*</span>
                          </div>
                          <div className="bg-white border border-gray-300 rounded-md p-2 text-sm h-16 overflow-hidden shadow-sm">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.5, duration: 0.5 }}
                            >
                              Analyze how light and darkness are used as symbols in Gothic literature, with examples from Frankenstein, Dracula, and The Fall of the House of Usher.
                            </motion.div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Citation Style</div>
                            <div className="bg-white border border-gray-300 rounded-md p-2 text-sm shadow-sm flex justify-between items-center">
                              <span>MLA</span>
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Length</div>
                            <div className="bg-white border border-gray-300 rounded-md p-2 text-sm shadow-sm flex justify-between items-center">
                              <span>5 pages</span>
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Generate button */}
                        <motion.div 
                          className="mt-auto"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2, duration: 0.5 }}
                        >
                          <div className="bg-primary text-white rounded-md py-2.5 text-center text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
                            <motion.div
                              animate={{ 
                                backgroundColor: ["#4f46e5", "#4338ca", "#4f46e5"] 
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="rounded-md py-0.5 flex items-center justify-center"
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Generate Essay
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Computer base */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-[40%] h-3 bg-gray-700 rounded"></div>

                  {/* Animated Paper Stack - repositioned to cross through center of screen */}
                  <motion.div 
                    className="absolute right-[25%] top-[40%] transform -translate-y-1/2 rotate-[30deg] z-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                  >
                    {/* Title Page */}
                    <motion.div 
                      className="absolute w-[180px] h-[240px] bg-white rounded shadow-lg p-4 font-serif origin-left"
                      initial={{ rotateY: 0 }}
                      animate={{
                        rotateY: [0, -80],
                        zIndex: [3, 1]
                      }}
                      transition={{
                        delay: 3.5,
                        duration: 1.5
                      }}
                    >
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="text-sm font-bold mb-4">
                          The Symbolism of Light in Gothic Literature
                        </div>
                        <div className="w-16 h-0.5 bg-gray-300 mb-4"></div>
                        <div className="text-xs text-gray-700 mb-6">
                          By John Smith
                        </div>
                        <div className="text-xs text-gray-500">
                          Professor Williams<br />
                          English Literature 301<br />
                          May 15, 2023
                        </div>
                      </div>
                    </motion.div>

                    {/* Essay Page */}
                    <motion.div 
                      className="absolute w-[180px] h-[240px] bg-white rounded shadow-lg p-4 font-serif origin-left"
                      initial={{ rotateY: 90, zIndex: 1 }}
                      animate={{
                        rotateY: [90, 0, -80],
                        zIndex: [1, 3, 1]
                      }}
                      transition={{
                        delay: 5,
                        duration: 3
                      }}
                    >
                      <div className="text-[8px] leading-snug text-gray-800 h-full overflow-hidden">
                        <div className="text-xs font-bold mb-2 text-center">
                          The Symbolism of Light in Gothic Literature
                        </div>
                        <p className="mb-1.5 indent-3">
                          Gothic literature has long employed the symbolism of light and darkness to represent the eternal struggle between good and evil. This dichotomy serves as a foundational element in works such as Mary Shelley's "Frankenstein," Bram Stoker's "Dracula," and Edgar Allan Poe's "The Fall of the House of Usher."
                        </p>
                        <p className="mb-1.5 indent-3">
                          In "Frankenstein," Shelley utilizes light imagery to highlight moments of creation and discovery. Victor Frankenstein describes his scientific breakthrough as "a light so brilliant and wondrous" (Shelley 42). This illumination, however, leads to darkness as his creation brings only suffering.
                        </p>
                      </div>
                    </motion.div>

                    {/* References Page */}
                    <motion.div 
                      className="absolute w-[180px] h-[240px] bg-white rounded shadow-lg p-4 font-serif origin-left"
                      initial={{ rotateY: 90, zIndex: 1 }}
                      animate={{
                        rotateY: [90, 0],
                        zIndex: [1, 3]
                      }}
                      transition={{
                        delay: 7.5,
                        duration: 1.5
                      }}
                    >
                      <div className="text-[8px] leading-snug text-gray-800">
                        <div className="text-xs font-bold mb-3 text-center">
                          Works Cited
                        </div>
                        <p className="mb-2 pl-4 indent-[-1rem]">
                          Poe, Edgar Allan. "The Fall of the House of Usher." <i>Complete Tales and Poems</i>, Vintage Books, 1975, pp. 231-245.
                        </p>
                        <p className="mb-2 pl-4 indent-[-1rem]">
                          Shelley, Mary. <i>Frankenstein</i>. Oxford University Press, 2008.
                        </p>
                        <p className="mb-2 pl-4 indent-[-1rem]">
                          Stoker, Bram. <i>Dracula</i>. Penguin Classics, 2003.
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <FeatureSection />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How EssayGeniusAI Works</h2>
            <p className="mt-4 text-lg text-gray-600">Get a complete, ready-to-submit essay in three simple steps</p>
            <p className="mt-2 mb-4 text-sm font-medium text-primary">Just $25 per essay - no subscriptions</p>
            <Link href="/signup">
              <Button type="submit" size="lg">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">1. Enter your topic</h3>
              <p className="mt-4 text-gray-600">
                Tell us your essay topic and requirements. We'll handle everything else.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">2. AI generates your essay</h3>
              <p className="mt-4 text-gray-600">
                Get a complete essay with citations, references, and proper formatting in minutes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">3. Download and submit</h3>
              <p className="mt-4 text-gray-600">
                Download your essay as a Word document, ready for submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Stop wasting time on essays</h2>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Join hundreds of students who are spending their time on what really matters in college.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

