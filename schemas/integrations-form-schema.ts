import z from 'zod'

export const integrationsFormSchema = z.object({
  instanceName: z.string().min(4, 'Nome deve ter pelo menos 4 caracteres'),
})

export type IntegrationsFormData = z.infer<typeof integrationsFormSchema>
