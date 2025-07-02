import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { registerFormSchema } from '@/actions/schemas/register-form-schema'
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
} from '@/services/userService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = registerFormSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const { name, username, email, password } = validationResult.data

    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 409 },
      )
    }

    const existingUsername = await findUserByUsername(username)

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Nome de usuário já cadastrado' },
        { status: 409 },
      )
    }
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await createUser({
      name,
      username,
      email,
      password: hashedPassword,
    })

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso',
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
