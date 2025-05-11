"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCookie, setCookie, removeCookie } from "@/lib/cookies"

interface AdminAuthContextType {
  admin: string | null
  isAdminAuthenticated: boolean
  adminLogin: (username: string) => void
  adminLogout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin is stored in cookies
    const storedAdmin = getCookie("adminUsername")

    if (storedAdmin) {
      setAdmin(storedAdmin)
    }
    setIsLoading(false)
  }, [])

  const adminLogin = (username: string) => {
    setAdmin(username)

    // Set cookies with a 1-day expiration
    setCookie("adminAuth", "true", 1)
    setCookie("adminUsername", username, 1)
  }

  const adminLogout = () => {
    setAdmin(null)

    // Remove cookies
    removeCookie("adminAuth")
    removeCookie("adminUsername")
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAdminAuthenticated: !!admin,
        adminLogin,
        adminLogout,
      }}
    >
      {!isLoading && children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
