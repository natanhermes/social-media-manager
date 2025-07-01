"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <MessageSquare className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Página não encontrada</h2>
            <p className="text-gray-500">
              Ops! A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Página Inicial
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-400 mb-3">Precisa de ajuda?</p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-gray-300">|</span>
              <Link href="/dashboard/settings" className="text-blue-600 hover:underline">
                Suporte
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
