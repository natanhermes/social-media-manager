import { z } from 'zod'

export const registerFormSchema = z.object({
  name: z.string().min(4, 'Nome deve ter pelo menos 4 caracteres'),
  username: z
    .string()
    .min(4, 'Nome deve ter pelo menos 4 caracteres')
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+$/,
      'Nome de usuário deve conter apenas letras e números',
    ),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, { message: 'deve conter pelo menos 8 caracteres' })
    .regex(/[a-zA-Z]/, { message: 'deve conter pelo menos uma letra' })
    .regex(/[0-9]/, { message: 'deve conter pelo menos um número' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'deve conter pelo menos um caractere especial',
    })
    .trim(),
})

export type RegisterFormData = z.infer<typeof registerFormSchema>
