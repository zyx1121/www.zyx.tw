import { neon } from "@neondatabase/serverless"

// The pooled Neon URL, from the container's env file. Read per call so a
// build without it (CI) still succeeds; only requests need the database.
export const db = () => {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  return neon(url)
}
