import { PlataformSettings } from '@/components/plataform-settings'
import { ProfileSettings } from '@/components/profile-settings'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <ProfileSettings />

        {/* Platform Connections */}
        <PlataformSettings />
      </div>
    </div>
  )
}
