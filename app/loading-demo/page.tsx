"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading, TableLoading, CardLoading, InlineLoading } from "@/components/loading"
import { LoadingOverlay } from "@/components/loading-overlay"

export default function LoadingDemoPage() {
  const [isOverlayLoading, setIsOverlayLoading] = useState(false)

  const handleToggleOverlay = () => {
    setIsOverlayLoading(true)
    setTimeout(() => setIsOverlayLoading(false), 3000)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Componentes de Loading</h1>
        <p className="text-gray-600">Demonstração dos diferentes tipos de loading disponíveis</p>
      </div>

      {/* Loading Variants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spinner</CardTitle>
            <CardDescription>Loading padrão com spinner</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loading variant="spinner" size="lg" text="Carregando..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dots</CardTitle>
            <CardDescription>Animação com pontos</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loading variant="dots" size="lg" text="Processando..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pulse</CardTitle>
            <CardDescription>Efeito de pulso</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loading variant="pulse" size="lg" text="Aguarde..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand</CardTitle>
            <CardDescription>Loading com marca</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loading variant="brand" size="lg" text="Social Manager" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skeleton</CardTitle>
            <CardDescription>Placeholder de conteúdo</CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <Loading variant="skeleton" text="Carregando dados..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inline</CardTitle>
            <CardDescription>Loading inline</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <InlineLoading text="Salvando alterações..." />
          </CardContent>
        </Card>
      </div>

      {/* Size Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Tamanhos Diferentes</CardTitle>
          <CardDescription>Variações de tamanho do loading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around py-8">
            <div className="text-center">
              <Loading variant="brand" size="sm" />
              <p className="text-sm text-gray-500 mt-2">Small</p>
            </div>
            <div className="text-center">
              <Loading variant="brand" size="md" />
              <p className="text-sm text-gray-500 mt-2">Medium</p>
            </div>
            <div className="text-center">
              <Loading variant="brand" size="lg" />
              <p className="text-sm text-gray-500 mt-2">Large</p>
            </div>
            <div className="text-center">
              <Loading variant="brand" size="xl" />
              <p className="text-sm text-gray-500 mt-2">Extra Large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialized Loading Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Table Loading</CardTitle>
            <CardDescription>Loading específico para tabelas</CardDescription>
          </CardHeader>
          <CardContent>
            <TableLoading rows={3} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Loading</CardTitle>
            <CardDescription>Loading para cards de estatísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <CardLoading count={2} />
          </CardContent>
        </Card>
      </div>

      {/* Loading Overlay Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Overlay</CardTitle>
          <CardDescription>Overlay de loading sobre conteúdo existente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleToggleOverlay}>Demonstrar Loading Overlay (3s)</Button>

            <LoadingOverlay isLoading={isOverlayLoading} text="Processando dados...">
              <div className="p-8 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Conteúdo da Aplicação</h3>
                <p className="text-gray-600 mb-4">
                  Este é um exemplo de conteúdo que ficará coberto pelo loading overlay.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded border">
                    <h4 className="font-medium">Card 1</h4>
                    <p className="text-sm text-gray-500">Algum conteúdo aqui</p>
                  </div>
                  <div className="p-4 bg-white rounded border">
                    <h4 className="font-medium">Card 2</h4>
                    <p className="text-sm text-gray-500">Mais conteúdo aqui</p>
                  </div>
                </div>
              </div>
            </LoadingOverlay>
          </div>
        </CardContent>
      </Card>

      {/* Full Screen Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Full Screen Loading</CardTitle>
          <CardDescription>Loading que cobre toda a tela</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              // Simular loading full screen
              const loadingElement = document.createElement("div")
              loadingElement.innerHTML = `
                <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div class="flex flex-col items-center gap-4">
                    <div class="relative">
                      <div class="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75 w-12 h-12"></div>
                      <div class="relative bg-blue-600 rounded-full flex items-center justify-center w-12 h-12">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                      </div>
                    </div>
                    <p class="text-gray-600 font-medium text-xl">Carregando aplicação...</p>
                  </div>
                </div>
              `
              document.body.appendChild(loadingElement)
              setTimeout(() => {
                document.body.removeChild(loadingElement)
              }, 2000)
            }}
          >
            Demonstrar Full Screen Loading (2s)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
