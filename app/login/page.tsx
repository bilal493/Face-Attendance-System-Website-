"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { z } from "zod"
import { ThemeToggle } from "@/components/theme-toggle"
import { setCookie } from "@/lib/cookies"
import { DebugInfo } from "@/components/debug-info"

const emailSchema = z.string().email("Please enter a valid email address")
const otpSchema = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers")

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugState, setDebugState] = useState<any>({})
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, logout } = useAuth()

  // Clear any existing authentication on login page load
  useEffect(() => {
    // Force logout when the login page loads
    logout()
  }, [logout])

  // Force redirect if verification was successful but redirect didn't happen
  useEffect(() => {
    if (redirectAttempted && email) {
      console.log("Forcing redirect to studentdashboard with email parameter after 2 seconds...")
      const timer = setTimeout(() => {
        const redirectUrl = `/studentdashboard?email=${encodeURIComponent(email)}`
        window.location.href = redirectUrl
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [redirectAttempted, email])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      emailSchema.parse(email)
      setIsLoading(true)

      try {
        const response = await fetch("http://127.0.0.1:5000/api/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        const data = await response.json()

        if (response.ok) {
          toast.success("OTP sent to your email")
          setOtpSent(true)
        } else {
          toast.error(data.message || "Failed to send OTP")
        }
      } catch (error) {
        toast.error("Server error. Please try again later.")
        console.error("Error sending OTP:", error)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      otpSchema.parse(otp)
      setIsLoading(true)

      try {
        // Step 1: Verify OTP with the server
        const response = await fetch("http://127.0.0.1:5000/api/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        })

        const data = await response.json()

        if (response.ok) {
          console.log("OTP verification successful, setting up authentication...")

          // Try multiple cookie setting approaches
          try {
            // Approach 1: Direct document.cookie
            document.cookie = `user=${encodeURIComponent(email)}; path=/; max-age=${60 * 60 * 24 * 7}`
            console.log("Cookie set via document.cookie:", document.cookie)

            // Approach 2: Using helper function
            setCookie("user", email, 7)
            console.log("Cookie set via setCookie function:", document.cookie)

            // Approach 3: Using localStorage as backup
            localStorage.setItem("user_backup", email)
            console.log("User backup set in localStorage")
          } catch (cookieError) {
            console.error("Error setting cookies:", cookieError)
          }

          // Call login function from context
          login(email)

          // Show success message
          toast.success("Login successful! Redirecting...")

          // Set redirect attempted flag
          setRedirectAttempted(true)

          // Update debug state
          setDebugState({
            email,
            cookiesAfterSet: document.cookie,
            verificationResponse: data,
            redirectAttempted: true,
          })

          // Create the redirect URL with email parameter
          const redirectUrl = `/studentdashboard?email=${encodeURIComponent(email)}`

          // Immediate redirect attempt
          console.log(`Attempting immediate redirect to: ${redirectUrl}`)
          window.location.href = redirectUrl

          // Fallback redirect with router
          setTimeout(() => {
            console.log(`Attempting fallback redirect with router to: ${redirectUrl}`)
            router.push(redirectUrl)
          }, 1000)
        } else {
          toast.error(data.message || "Invalid OTP")
          setDebugState({
            error: "OTP verification failed",
            response: data,
          })
        }
      } catch (error) {
        toast.error("Server error. Please try again later.")
        console.error("Error verifying OTP:", error)
        setDebugState({
          error: String(error),
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/50">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <CardHeader>
            <Link
              href="/"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <CardTitle className="text-2xl">Student Login</CardTitle>
            <CardDescription>Enter your email to receive an OTP for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSendOtp}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="student@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          disabled={isLoading}
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleVerifyOtp}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="text-center text-lg tracking-wider"
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setOtpSent(false)}
                      disabled={isLoading}
                    >
                      Change Email
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-center flex-col">
            <p className="text-sm text-muted-foreground">
              {otpSent ? "Please check your email for the OTP" : "We'll send a one-time password to your email"}
            </p>

            {redirectAttempted && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-md text-sm">
                <p className="font-medium">Redirect in progress...</p>
                <p className="text-muted-foreground">
                  If you are not redirected automatically,
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => (window.location.href = `/studentdashboard?email=${encodeURIComponent(email)}`)}
                  >
                    click here
                  </Button>
                </p>
              </div>
            )}

            {/* Debug information */}
            <DebugInfo
              data={{
                currentCookies: document.cookie,
                email,
                otpSent,
                redirectAttempted,
                redirectUrl: `/studentdashboard?email=${encodeURIComponent(email)}`,
                ...debugState,
              }}
            />
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
