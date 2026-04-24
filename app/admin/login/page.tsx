"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !data) {
      setError(signInError?.message || "Login failed")
      setLoading(false)
      return
    }

    console.log("[v0-admin-debug] Login successful!")
    console.log("[v0-admin-debug] User ID:", data.user?.id)
    console.log("[v0-admin-debug] User Email:", data.user?.email)
    console.log("[v0-admin-debug] Access Token exists:", !!data.access_token)

    // Check if user is admin BEFORE redirecting
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // Query using simple email filter (not or syntax which has encoding issues)
      const queryUrl = `${supabaseUrl}/rest/v1/wcr_jobs_admin_users?app_id=eq.wcr_jobs&email=eq.${encodeURIComponent(data.user?.email || email)}&select=id,email,app_id`
      
      console.log("[v0-admin-debug] Admin check URL:", queryUrl)
      
      const adminCheckRes = await fetch(queryUrl, {
        headers: {
          "apikey": supabaseKey!,
          "Authorization": `Bearer ${data.access_token}`,
        },
      })

      console.log("[v0-admin-debug] Admin check status:", adminCheckRes.status)
      console.log("[v0-admin-debug] Admin check ok:", adminCheckRes.ok)
      
      const adminUsers = await adminCheckRes.json()
      console.log("[v0-admin-debug] Admin check response:", JSON.stringify(adminUsers))

      if (!Array.isArray(adminUsers) || adminUsers.length === 0) {
        console.log("[v0-admin-debug] Admin check FAILED - no matching records")
        console.log("[v0-admin-debug] Expected email:", data.user?.email || email)
        console.log("[v0-admin-debug] Expected app_id: wcr_jobs")
        setError("You don't have admin access to the calendar")
        await supabaseClient.auth.signOut()
        setLoading(false)
        return
      }

      console.log("[v0-admin-debug] Admin check PASSED - found", adminUsers.length, "matching record(s)")
      
      // Store auth token in sessionStorage as fallback for sandboxed environments
      // where cookies are blocked (like Shopify iframes)
      try {
        sessionStorage.setItem("wcr_admin_token", data.access_token)
        sessionStorage.setItem("wcr_admin_user", JSON.stringify({
          id: data.user?.id,
          email: data.user?.email
        }))
      } catch (e) {
        console.log("[v0] sessionStorage not available, continuing with cookies")
      }
      
      // Small delay to ensure storage is set
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Check if we're in a sandboxed iframe - if so, open in new tab
      let isSandboxed = false
      try {
        document.cookie = "test=1"
        isSandboxed = !document.cookie.includes("test=1")
      } catch (e) {
        isSandboxed = true
      }
      
      if (isSandboxed) {
        // Open admin in new window to escape sandbox
        window.open("/admin", "_blank")
        setLoading(false)
        setError("Admin opened in new tab (sandbox detected)")
      } else {
        window.location.replace("/admin")
      }
    } catch (err: any) {
      console.error("[v0] Admin check error:", err)
      setError(err?.message || "Failed to verify admin access")
      setLoading(false)
    }
  }

  return (
    <div className="bg-background flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to manage featured events
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Spinner className="w-4 h-4 mr-2" />}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </Button>
        </div>
      </div>
    </div>
  )
}
