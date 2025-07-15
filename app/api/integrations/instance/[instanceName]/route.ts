import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
import { EvolutionWhatsAppService } from '@/services/integrations/whatsappService'

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ instanceName: string }> },
) {
  try {
    const session = await getAuthUser()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { instanceName } = await params

    const whatsappService = new EvolutionWhatsAppService(
      process.env.EVOLUTION_API_URL!,
      process.env.EVOLUTION_API_KEY!,
    )

    const success = await whatsappService.deleteInstance(instanceName)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete instance' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { message: 'Instance deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error ', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
