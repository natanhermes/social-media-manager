'use client'

import {
  History,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { useState } from 'react'

import { DropdownMenuSidebar } from '@/app/dashboard/dropdown-menu-sidebar'
import { cn } from '@/lib/utils'

import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Histórico', href: '/dashboard/history', icon: History },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  { name: 'Integrações', href: '/dashboard/integrations', icon: Zap },
]

export function AppSidebar({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const SidebarComponent = ({
    mobile = false,
    session,
  }: {
    mobile?: boolean
    session: Session | null
  }) => (
    <div className={cn('flex flex-col h-full', mobile ? 'w-full' : 'w-64')}>
      <div className="flex items-center gap-2 p-6 border-b">
        <div className="p-2 bg-blue-600 rounded-lg">
          <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Social Manager</h1>
          <p className="text-sm text-muted-foreground">Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                  onClick={() => mobile && setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <DropdownMenuSidebar session={session} />
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r">
          <SidebarComponent session={session} />
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarComponent mobile session={session} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <span className="font-bold">Social Manager</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
