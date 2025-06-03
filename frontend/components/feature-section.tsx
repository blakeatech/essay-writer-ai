import { FileText, Sparkles, BookOpen, DollarSign, GraduationCap, Eye, Filter } from "lucide-react"

export default function FeatureSection() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why We're the Best Choice</h2>
          <p className="mt-4 text-lg text-gray-600">
            There are lots of other tools that generate essays, but here's why ours is the best one out there.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
          {/* Feature 1 */}
          <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No Polished Doc? No Thanks.</h3>
            <p className="mt-4 text-gray-600">
              Other tools just spit text into the browser, leaving you to copy, paste, and format it. Ours? You get a clean, 
              ready-to-submit .docx file every time—complete with title page, references, and perfect formatting. Just open 
              in Google Docs and you're good to go.
            </p>
          </div>

          {/* New Feature - Insert after Feature 1 */}
          <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Catches Hidden Requirements</h3>
            <p className="mt-4 text-gray-600">
              Our AI is trained to spot and ignore subtle requirements and "gotchas" that professors hide in assignment descriptions to catch 
              AI-generated papers.
            </p>
          </div>

          {/* New Feature - AI Detection Prevention */}
          <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
              <Filter className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Undetectable by AI Checkers</h3>
            <p className="mt-4 text-gray-600">
              Our rigorous filtering system removes telltale AI patterns and awkward phrasings that tools like GPTZero catch. 
              Every essay passes through multiple human-language filters to ensure it reads naturally and stays undetectable.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">AI Slop vs. Your Voice</h3>
            <p className="mt-4 text-gray-600">
              Most outputs sound like a bot wrote them (because they did). We're different. We ask for your writing samples 
              so every essay sounds like you wrote it—down to your tone, phrasing, and structure.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Real Sources, Cited Right</h3>
            <p className="mt-4 text-gray-600">
              Competitors either skip citations or get them wrong. We give you a curated list of sources to choose from 
              before writing, then cite them properly both in-text and in the references page.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Transparent Pricing</h3>
            <p className="mt-4 text-gray-600">
              Others lure you in with "free" and spring a paywall last-minute. We keep it simple: $25 = 1 polished paper, 
              no surprises. That's a small price for hours saved and an A+ on your next assignment.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary/10 mb-6">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Trusted by Top Students</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our essays have gotten past world-renowned professors at top schools including Harvard and Berkeley. 
            Join thousands of students who trust EssayGeniusAI for their assignments.
          </p>
        </div>
      </div>
    </section>
  )
}

