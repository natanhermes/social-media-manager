import { AppSidebar } from '@/components/app-sidebar'
import { requireAuth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  return <AppSidebar session={session}>{children}</AppSidebar>
}
