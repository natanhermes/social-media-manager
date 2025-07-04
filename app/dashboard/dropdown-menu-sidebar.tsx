import { LogOut, Settings, User } from 'lucide-react'
import Form from 'next/form'
import { Session } from 'next-auth'

import { logoutAction } from '@/actions/logoutAction'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DropdownMenuSidebar({ session }: { session: Session | null }) {
  if (!session) {
    return (
      <div className="p-4">
        <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="p-4 border-t">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-3 p-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>
                {getInitials(session.user?.name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user?.email}
              </p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Form action={logoutAction} className="w-full">
              <button className="w-full flex items-center gap-2">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </button>
            </Form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
