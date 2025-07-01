"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, Loader2 } from 'lucide-react'

interface LoadingProps {
  variant?: "spinner" | "dots" | "pulse" | "skeleton" | "brand"
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  fullScreen?: boolean
}

export function Loading({ 
  variant = "spinner", 
  size = "md", 
  text, 
  className,
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  }

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "fixed inset-0 bg-white/80 backdrop-blur-sm z-50",
    className
  )

  const renderSpinner = () => (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
      {text && (
        <p className={cn("text-gray-600 font-medium", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderDots = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-blue-600 rounded-full animate-pulse",
              size === "sm" && "w-2 h-2",
              size === "md" && "w-3 h-3",
              size === "lg" && "w-4 h-4",
              size === "xl" && "w-5 h-5"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.4s"
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn("text-gray-600 font-medium", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderPulse = () => (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={cn(
          "bg-blue-600 rounded-full animate-ping",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className={cn("text-gray-600 font-medium", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderSkeleton = () => (
    <div className="w-full max-w-md space-y-3">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      {text && (
        <p className={cn("text-gray-600 font-medium text-center", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderBrand = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className={cn(
          "absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75",
          sizeClasses[size]
        )} />
        <div className={cn(
          "relative bg-blue-600 rounded-full flex items-center justify-center",
          sizeClasses[size]
        )}>
          <MessageSquare className={cn(
            "text-white",
            size === "sm" && "w-2 h-2",
            size === "md" && "w-3 h-3", 
            size === "lg" && "w-4 h-4",
            size === "xl" && "w-6 h-6"
          )} />
        </div>
      </div>
      {text && (
        <p className={cn("text-gray-600 font-medium", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )

  const renderLoading = () => {
    switch (variant) {
      case "dots":
        return renderDots()
      case "pulse":
        return renderPulse()
      case "skeleton":
        return renderSkeleton()
      case "brand":
        return renderBrand()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={containerClasses}>
      {renderLoading()}
    </div>
  )
}

// Componente específico para loading de tabelas
export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente para loading de cards
export function CardLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente para loading inline
export function InlineLoading({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  )
}

// Componente para loading de botões
export function ButtonLoading({ children, isLoading, ...props }: any) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {typeof children === "string" ? "Carregando..." : children}
        </div>
      ) : (
        children
      )}
    </button>
  )
}
