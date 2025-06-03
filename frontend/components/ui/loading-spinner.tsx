import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  // Use tailwind styles directly rather than dynamic classes which can cause problems
  const sizeClass = 
    size === 16 ? 'h-4 w-4' :
    size === 24 ? 'h-6 w-6' :
    size === 32 ? 'h-8 w-8' :
    size === 48 ? 'h-12 w-12' :
    size === 64 ? 'h-16 w-16' : 'h-6 w-6';

  return (
    <div className="flex justify-center items-center">
      <Loader2 className={`${sizeClass} animate-spin text-primary`} />
    </div>
  )
} 