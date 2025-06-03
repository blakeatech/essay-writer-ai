import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Student Reviews</h2>
          <p className="mt-4 text-lg text-gray-600">
            See why students choose EssayGeniusAI to save time
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Testimonial 1 */}
          <div className="flex flex-col justify-between p-8 bg-white rounded-2xl shadow-sm">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">
                "Saved me 6 hours of research and writing. My professor barely looked at it and gave me an A."
              </p>
            </div>
            <div className="mt-6 flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/olivia.png" alt="Olivia M." />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Olivia M.</p>
                <p className="text-xs text-gray-500">Business Administration Major</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="flex flex-col justify-between p-8 bg-white rounded-2xl shadow-sm">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">
                "These gen-ed courses are just busy work. EssayGeniusAI lets me spend time on my major classes and 
                actually learning useful skills."
              </p>
            </div>
            <div className="mt-6 flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/sarah.png" alt="Sarah K." />
                <AvatarFallback>SK</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Sarah K.</p>
                <p className="text-xs text-gray-500">Law Major</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="flex flex-col justify-between p-8 bg-white rounded-2xl shadow-sm">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">
                "Perfect for those required writing courses. Why spend hours on papers when professors don't even read them 
                properly? Now I have more time for networking events."
              </p>
            </div>
            <div className="mt-6 flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/alex.png" alt="Alex T." />
                <AvatarFallback>AT</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Alex T.</p>
                <p className="text-xs text-gray-500">Computer Science Major</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

