import { attachDatabasePool } from "@vercel/functions"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { Pool } from "pg"

import { db } from "@/lib/db"

// node-postgres with attachDatabasePool, as Neon recommends on Vercel Fluid
// compute: idle clients are released before the function suspends.
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
attachDatabasePool(pool)

// Reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from the environment.
export const auth = betterAuth({
  database: pool,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Only the flatmates listed in app_1909.members get an account.
        before: async (user) => {
          const [member] = await db()`
            select 1 from app_1909.members where email = ${user.email}
          `
          return member ? { data: user } : false
        },
      },
    },
  },
  onAPIError: { errorURL: "/auth/login" },
  plugins: [nextCookies()],
})
