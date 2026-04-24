import { NextResponse, type NextRequest } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ADMIN_APP_ID = "wcr_jobs"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  // Get access token from cookies
  const accessToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value

  // Protect /admin routes (except login page)
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
  const isLoginPage = request.nextUrl.pathname === "/admin/login"
  
  if (isAdminRoute && !isLoginPage) {
    // No tokens = redirect to login
    if (!accessToken) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }

    try {
      // Verify the user with Supabase
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      if (!userRes.ok) {
        // Invalid token - redirect to login
        const url = request.nextUrl.clone()
        url.pathname = "/admin/login"
        const response = NextResponse.redirect(url)
        response.cookies.delete("sb-access-token")
        response.cookies.delete("sb-refresh-token")
        return response
      }

      const user = await userRes.json()

      // Check if user is admin via wcr_jobs_admin_users table
      // Use simple email filter (or syntax has URL encoding issues)
      const adminQueryUrl = `${SUPABASE_URL}/rest/v1/wcr_jobs_admin_users?app_id=eq.${ADMIN_APP_ID}&email=eq.${encodeURIComponent(user.email)}&select=id,email,app_id`
      
      console.log("[v0-admin-debug] [middleware] Checking admin for email:", user.email)
      console.log("[v0-admin-debug] [middleware] Query URL:", adminQueryUrl)
      
      const adminCheckRes = await fetch(adminQueryUrl, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      console.log("[v0-admin-debug] [middleware] Admin check status:", adminCheckRes.status)
      
      const adminUsers = await adminCheckRes.json()
      
      console.log("[v0-admin-debug] [middleware] Admin check response:", JSON.stringify(adminUsers))

      if (!Array.isArray(adminUsers) || adminUsers.length === 0) {
        console.log("[v0-admin-debug] [middleware] Admin check FAILED - redirecting to /")
        // Not an admin - redirect to home
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
      
      console.log("[v0-admin-debug] [middleware] Admin check PASSED")
    } catch (err) {
      console.error("Middleware auth error:", err)
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
