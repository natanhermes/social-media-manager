import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { findUserByCredentials } from './services/userService'

declare module 'next-auth' {
  interface User {
    username: string
    bio: string | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        const user = await findUserByCredentials(
          credentials.username as string,
          credentials.password as string,
        )

        if (!user) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
})
