'use server'

import { AuthError } from 'next-auth'

import { signIn } from '@/auth'

export async function loginAction(_prevState: unknown, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error
    }

    if (error instanceof AuthError && error.type === 'CredentialsSignin') {
      return {
        success: false,
        message: 'Dados de login incorretos.',
      }
    }

    return {
      success: false,
      message: 'Ops! Ocorreu um erro ao fazer login.',
    }
  }
}
