import { cookies } from "next/headers"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_APP_ID = "wcr_jobs"

export async function getUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  if (!accessToken) {
    return null
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return null
    }

    return await res.json()
  } catch {
    return null
  }
}

export async function isUserAdmin() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("sb-access-token")?.value

  if (!accessToken) {
    return false
  }

  try {
    // Get user first
    const user = await getUser()
    if (!user) return false

    // Check admin status
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/wcr_jobs_admin_users?app_id=eq.${ADMIN_APP_ID}&or=(id.eq.${user.id},email.eq.${encodeURIComponent(user.email)})&select=id`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    )

    const adminUsers = await res.json()
    return Array.isArray(adminUsers) && adminUsers.length > 0
  } catch {
    return false
  }
}
