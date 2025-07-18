import { z } from 'zod'

export const messageFormSchema = z
  .object({
    message: z.string().min(1, 'Mensagem é obrigatória').trim(),
    platforms: z.array(z.string()).optional().default([]),
    scheduled: z.boolean().optional(),
    scheduledDate: z
      .string()
      .optional()
      .refine(
        (date) => {
          if (!date) return true
          // Normalizar as datas para evitar problemas de timezone
          const selectedDate = new Date(date + 'T00:00:00')
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          selectedDate.setHours(0, 0, 0, 0)
          return selectedDate >= today
        },
        {
          message: 'Data não pode ser anterior ao dia atual',
        },
      ),
    scheduledTime: z
      .string()
      .optional()
      .refine(
        (time) => {
          if (!time) return true
          return time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        },
        {
          message: 'Formato de horário inválido',
        },
      ),
  })
  .refine(
    (data) => {
      if (!data.scheduled) return true
      return data.scheduledDate && data.scheduledTime
    },
    {
      message: 'Data e hora são obrigatórias para agendamento',
      path: ['scheduledDate'],
    },
  )
  .refine(
    (data) => {
      if (!data.scheduled || !data.scheduledDate || !data.scheduledTime)
        return true

      // Normalizar a data selecionada para evitar problemas de timezone
      const selectedDate = new Date(data.scheduledDate + 'T00:00:00')
      const today = new Date()

      // Se a data for hoje, verificar se o horário é futuro
      if (selectedDate.toDateString() === today.toDateString()) {
        const [hours, minutes] = data.scheduledTime.split(':').map(Number)
        const now = new Date()
        const scheduledDateTime = new Date(today)
        scheduledDateTime.setHours(hours, minutes, 0, 0)

        return scheduledDateTime > now
      }

      return true
    },
    {
      message: 'Horário deve ser posterior ao atual',
      path: ['scheduledTime'],
    },
  )

export type MessageFormData = z.infer<typeof messageFormSchema>
