import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
import {
  deleteIntegrationWithCleanup,
  getIntegrationById,
  updateIntegrationStatus,
} from '@/services/integrationService'

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser()
    if (!user?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const integration = await getIntegrationById(params.id, user.user.id)

    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: integration,
    })
  } catch (error) {
    console.error('Error fetching integration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch integration',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getAuthUser()
    if (!user?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { status, errorMessage } = body

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required',
        },
        { status: 400 },
      )
    }

    const integration = await updateIntegrationStatus(
      params.id,
      user.user.id,
      status,
      errorMessage,
    )

    return NextResponse.json({
      success: true,
      data: integration,
    })
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update integration',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser()
    const { id } = await params
    if (!user?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const result = await deleteIntegrationWithCleanup(id, user.user.id)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete integration',
      },
      { status: 500 },
    )
  }
}
