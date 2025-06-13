import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error: Missing environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Please make sure they are configured in your .env.local file",
  )
}

// Create Supabase client with the new database connection
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    storageKey: "sb-pricing-app-auth-token",
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window === "undefined") {
          return null
        }
        return JSON.parse(window.localStorage.getItem(key) || "null")
      },
      setItem: (key, value) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      },
      removeItem: (key) => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(key)
        }
      },
    },
  },
})

// Helper function to check if a user is logged in
export const isLoggedIn = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return !!data.session
  } catch (error) {
    console.error("Error checking authentication status:", error)
    return false
  }
}

// Helper function to refresh session if needed
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error("Error refreshing session:", error)
    return null
  }
}

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("profiles").select("count").limit(1)
    if (error) throw error
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}
