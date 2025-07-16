import z from 'zod'

export const integrationsFormSchema = z.object({
  instanceName: z
    .string()
    .min(4, 'Nome deve ter pelo menos 4 caracteres')
    .optional(),
  botToken: z
    .string()
    .min(10, 'Token deve ter pelo menos 10 caracteres')
    .optional(),
})

export type IntegrationsFormData = z.infer<typeof integrationsFormSchema>
