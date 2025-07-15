import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(
  request: NextRequest,
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

    const integration = await db.integration.findFirst({
      where: {
        id,
        userId: user.user.id,
      },
    })

    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
        },
        { status: 404 },
      )
    }

    const selectedConversations = await db.selectedConversation.findMany({
      where: {
        integrationId: id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: selectedConversations,
    })
  } catch (error) {
    console.error('Error fetching selected conversations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch selected conversations',
      },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
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

    const body = await request.json()
    const { externalId, name, type } = body

    if (!externalId || !name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'ExternalId, name and type are required',
        },
        { status: 400 },
      )
    }

    const integration = await db.integration.findFirst({
      where: {
        id,
        userId: user.user.id,
      },
    })

    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
        },
        { status: 404 },
      )
    }

    const selectedConversation = await db.selectedConversation.upsert({
      where: {
        integrationId_externalId: {
          integrationId: id,
          externalId,
        },
      },
      update: {
        name,
        type,
        updatedAt: new Date(),
      },
      create: {
        integrationId: id,
        externalId,
        name,
        type,
      },
    })

    return NextResponse.json({
      success: true,
      data: selectedConversation,
    })
  } catch (error) {
    console.error('Error creating selected conversation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create selected conversation',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
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

    const { searchParams } = new URL(request.url)
    const externalId = searchParams.get('externalId')

    if (!externalId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ExternalId is required',
        },
        { status: 400 },
      )
    }

    const integration = await db.integration.findFirst({
      where: {
        id,
        userId: user.user.id,
      },
    })

    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
        },
        { status: 404 },
      )
    }

    await db.selectedConversation.deleteMany({
      where: {
        integrationId: id,
        externalId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Selected conversation removed successfully',
    })
  } catch (error) {
    console.error('Error removing selected conversation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove selected conversation',
      },
      { status: 500 },
    )
  }
}
