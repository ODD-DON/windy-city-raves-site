const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cookie helpers
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  // Use Secure flag on production, SameSite=Lax for cross-page navigation
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export const supabaseClient = {
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const error = await res.json()
          return { data: null, error: { message: error.error_description || error.msg || "Login failed" } }
        }

        const data = await res.json()
        
        // Store tokens in cookies
        setCookie("sb-access-token", data.access_token, 7)
        setCookie("sb-refresh-token", data.refresh_token, 30)

        return { data, error: null }
      } catch (err: any) {
        return { data: null, error: { message: err.message || "Login failed" } }
      }
    },

    async signOut() {
      const accessToken = getCookie("sb-access-token")
      
      if (accessToken) {
        try {
          await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: "POST",
            headers: {
              "apikey": SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${accessToken}`,
            },
          })
        } catch {
          // Ignore logout errors
        }
      }
      
      deleteCookie("sb-access-token")
      deleteCookie("sb-refresh-token")
    },

    async getUser() {
      const accessToken = getCookie("sb-access-token")
      if (!accessToken) return { data: { user: null }, error: null }

      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
          },
        })

        if (!res.ok) {
          return { data: { user: null }, error: null }
        }

        const user = await res.json()
        return { data: { user }, error: null }
      } catch {
        return { data: { user: null }, error: null }
      }
    },

    getAccessToken() {
      return getCookie("sb-access-token")
    },
  },

  from(table: string) {
    const accessToken = getCookie("sb-access-token")
    
    return {
      async select(columns = "*") {
        return {
          async eq(column: string, value: any) {
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`,
              {
                headers: {
                  "apikey": SUPABASE_ANON_KEY,
                  "Authorization": `Bearer ${accessToken}`,
                },
              }
            )
            const data = await res.json()
            return { data, error: null }
          },
        }
      },

      async insert(values: any) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(values),
        })
        if (!res.ok) {
          const error = await res.text()
          return { data: null, error: { message: error } }
        }
        return { data: values, error: null }
      },

      async upsert(values: any) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
          },
          body: JSON.stringify(values),
        })
        if (!res.ok) {
          const error = await res.text()
          return { data: null, error: { message: error } }
        }
        return { data: values, error: null }
      },

      update(values: any) {
        return {
          async eq(column: string, value: any) {
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`,
              {
                method: "PATCH",
                headers: {
                  "apikey": SUPABASE_ANON_KEY,
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                  "Prefer": "return=minimal",
                },
                body: JSON.stringify(values),
              }
            )
            if (!res.ok) {
              const error = await res.text()
              return { data: null, error: { message: error } }
            }
            return { data: values, error: null }
          },
        }
      },

      delete() {
        return {
          async eq(column: string, value: any) {
            const res = await fetch(
              `${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`,
              {
                method: "DELETE",
                headers: {
                  "apikey": SUPABASE_ANON_KEY,
                  "Authorization": `Bearer ${accessToken}`,
                  "Prefer": "return=minimal",
                },
              }
            )
            if (!res.ok) {
              const error = await res.text()
              return { data: null, error: { message: error } }
            }
            return { data: null, error: null }
          },
        }
      },
    }
  },
}
