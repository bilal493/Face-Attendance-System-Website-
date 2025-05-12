"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCookie, setCookie, removeCookie } from "@/lib/cookies"

interface AuthContextType {
  user: string | null
  login: (email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in cookies
    const storedUser = getCookie("user")
    console.log("AuthContext: Initial check for stored user:", storedUser)

    if (storedUser) {
      setUser(storedUser)
    }

    // Also check localStorage for legacy support and clean it up
    if (typeof window !== "undefined" && window.localStorage.getItem("user")) {
      console.log("AuthContext: Found legacy localStorage user, cleaning up")
      window.localStorage.removeItem("user")
    }

    setIsLoading(false)
  }, [])

  const login = (email: string) => {
    console.log("AuthContext: Setting user:", email)

    // Set in state
    setUser(email)

    // Set in cookies with 1-day expiration
    setCookie("user", email, 1)

    console.log("AuthContext: User set in state and cookies")
  }

  const logout = () => {
    console.log("AuthContext: Logging out user")

    // Clear from state
    setUser(null)

    // Clear from cookies
    removeCookie("user")

    // Also clear from localStorage for complete cleanup
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("user")
    }

    console.log("AuthContext: User cleared from state and storage")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
