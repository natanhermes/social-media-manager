'use client'
import Form from 'next/form'
import Link from 'next/link'
import { useActionState } from 'react'

import { loginAction } from '@/actions/loginAction'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function LoginForm() {
  const [_, formAction, isPending] = useActionState(loginAction, null)

  return (
    <>
      <Form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Sua senha"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </Form>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </>
  )
}
