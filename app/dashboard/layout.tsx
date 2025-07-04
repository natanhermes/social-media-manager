import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return <AppSidebar session={session}>{children}</AppSidebar>
}
