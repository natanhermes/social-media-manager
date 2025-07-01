"use client"

import { Loading } from "./loading"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "brand"
  className?: string
  children: React.ReactNode
}

export function LoadingOverlay({ 
  isLoading, 
  text = "Carregando...", 
  variant = "brand",
  className,
  children 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <Loading variant={variant} text={text} size="lg" />
        </div>
      )}
    </div>
  )
}
