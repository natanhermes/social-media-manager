'use client'
import { Bell, Save } from 'lucide-react'
import { useState } from 'react'

import { useToast } from '@/hooks/use-toast'

import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'

export function NotificationSettings() {
  const handleSaveNotifications = () => {
    toast({
      title: 'Notificações atualizadas',
      description: 'Suas preferências de notificação foram salvas.',
    })
  }

  const { toast } = useToast()

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    weeklyReport: true,
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Configure como você deseja receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications">Notificações por Email</Label>
            <p className="text-sm text-gray-500">
              Receba atualizações por email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={notifications.emailNotifications}
            onCheckedChange={(checked) =>
              setNotifications({
                ...notifications,
                emailNotifications: checked,
              })
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-notifications">Notificações Push</Label>
            <p className="text-sm text-gray-500">
              Receba notificações no navegador
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={notifications.pushNotifications}
            onCheckedChange={(checked) =>
              setNotifications({
                ...notifications,
                pushNotifications: checked,
              })
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sms-notifications">Notificações SMS</Label>
            <p className="text-sm text-gray-500">
              Receba alertas importantes por SMS
            </p>
          </div>
          <Switch
            id="sms-notifications"
            checked={notifications.smsNotifications}
            onCheckedChange={(checked) =>
              setNotifications({
                ...notifications,
                smsNotifications: checked,
              })
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="weekly-report">Relatório Semanal</Label>
            <p className="text-sm text-gray-500">
              Receba um resumo semanal das atividades
            </p>
          </div>
          <Switch
            id="weekly-report"
            checked={notifications.weeklyReport}
            onCheckedChange={(checked) =>
              setNotifications({
                ...notifications,
                weeklyReport: checked,
              })
            }
          />
        </div>
        <Button
          onClick={handleSaveNotifications}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Salvar Notificações
        </Button>
      </CardContent>
    </Card>
  )
}
