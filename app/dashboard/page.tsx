"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import toast from "react-hot-toast"
import type { AttendanceRecord, PaymentStatus } from "@/types/attendance"
import { AttendancePieChart } from "@/components/attendance-pie-chart"
import { DashboardHeader } from "@/components/dashboard-header"
import { getCookie } from "@/lib/cookies"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Check authentication directly from cookies as a backup
  useEffect(() => {
    // Check if we have a user in context
    console.log("Dashboard: Checking authentication, user from context =", user)

    // Also check cookies directly
    const cookieUser = getCookie("user")
    console.log("Dashboard: User from cookie =", cookieUser)

    // If we have a user either in context or cookie, proceed
    const effectiveUser = user || cookieUser

    if (!effectiveUser) {
      console.log("Dashboard: No user found in context or cookies, redirecting to login")
      window.location.href = "/login"
      return
    }

    console.log("Dashboard: User authenticated:", effectiveUser)
    setAuthChecked(true)
  }, [user, router])

  // Fetch data only after authentication is confirmed
  useEffect(() => {
    if (!authChecked) return

    // Get the effective user (from context or cookie)
    const effectiveUser = user || getCookie("user")
    if (!effectiveUser) return

    console.log("Dashboard: Authentication confirmed, fetching data for user:", effectiveUser)

    const fetchAttendance = async () => {
      try {
        console.log(`Dashboard: Fetching attendance for ${effectiveUser}`)
        const response = await fetch(
          `http://127.0.0.1:5000/api/student/attendance?email=${encodeURIComponent(effectiveUser)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          console.log("Dashboard: Attendance data received:", data)
          setAttendanceData(data.attendance || [])
        } else {
          const errorText = await response.text()
          console.error("Dashboard: Failed to fetch attendance data:", errorText)
          toast.error("Failed to fetch attendance data")
        }
      } catch (error) {
        console.error("Dashboard: Error fetching attendance:", error)
        toast.error("Server error. Please try again later.")
      }
    }

    const checkPaymentStatus = async () => {
      try {
        console.log(`Dashboard: Checking payment status for ${effectiveUser}`)
        const response = await fetch(
          `http://127.0.0.1:5000/api/student/payment_check?email=${encodeURIComponent(effectiveUser)}`,
        )
        if (response.ok) {
          const data = await response.json()
          console.log("Dashboard: Payment status received:", data)
          setPaymentStatus(data)
        } else {
          const errorText = await response.text()
          console.error("Dashboard: Failed to check payment status:", errorText)
          toast.error("Failed to check payment status")
        }
      } catch (error) {
        console.error("Dashboard: Error checking payment status:", error)
        toast.error("Server error. Please try again later.")
      }
    }

    Promise.all([fetchAttendance(), checkPaymentStatus()]).finally(() => {
      console.log("Dashboard: Data fetching complete")
      setIsLoading(false)
    })
  }, [authChecked, user])

  const handlePayFine = async () => {
    const effectiveUser = user || getCookie("user")
    if (!effectiveUser) return

    setIsPaymentLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:5000/api/create_payment_session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: effectiveUser }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.message || "Failed to create payment session")
      }
    } catch (error) {
      console.error("Error creating payment session:", error)
      toast.error("Server error. Please try again later.")
    } finally {
      setIsPaymentLoading(false)
    }
  }

  const calculateAttendancePercentage = () => {
    if (!attendanceData.length) return 0

    const presentDays = attendanceData.filter((record) => record.status === "Present").length
    return Math.round((presentDays / attendanceData.length) * 100)
  }

  const attendancePercentage = calculateAttendancePercentage()
  const needsToPayFine = paymentStatus?.needs_to_pay_fine || false

  // Get the effective user for display
  const effectiveUser = user || getCookie("user") || ""

  // If not authenticated, don't render anything (redirect will happen)
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full rounded-lg" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <DashboardHeader title="Student Dashboard" email={effectiveUser} onLogout={logout} />

      <main className="container mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Your current attendance percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <AttendancePieChart percentage={attendancePercentage} />
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold">{attendancePercentage}%</p>
                  <p className="text-sm text-muted-foreground">
                    {attendancePercentage >= 75
                      ? "Your attendance is good"
                      : "Your attendance is below the required 75%"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Status</CardTitle>
              <CardDescription>Summary of your attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Attendance Progress</span>
                    <span className="text-sm font-medium">{attendancePercentage}%</span>
                  </div>
                  <Progress value={attendancePercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Present Days</p>
                      <p className="text-2xl font-bold">
                        {attendanceData.filter((record) => record.status === "Present").length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Absent Days</p>
                      <p className="text-2xl font-bold">
                        {attendanceData.filter((record) => record.status === "Absent").length}
                      </p>
                    </div>
                  </div>
                </div>

                {needsToPayFine && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Attendance Below 75%</AlertTitle>
                    <AlertDescription>
                      Your attendance is below the required 75%. Please pay the fine to continue.
                    </AlertDescription>
                    <Button onClick={handlePayFine} className="mt-2 w-full" disabled={isPaymentLoading}>
                      {isPaymentLoading ? "Processing..." : "Pay Fine"}
                    </Button>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>Detailed view of your attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Records</TabsTrigger>
                  <TabsTrigger value="present">Present</TabsTrigger>
                  <TabsTrigger value="absent">Absent</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <AttendanceTable records={attendanceData} />
                </TabsContent>

                <TabsContent value="present" className="space-y-4">
                  <AttendanceTable records={attendanceData.filter((record) => record.status === "Present")} />
                </TabsContent>

                <TabsContent value="absent" className="space-y-4">
                  <AttendanceTable records={attendanceData.filter((record) => record.status === "Absent")} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

function AttendanceTable({ records }: { records: AttendanceRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No records found</h3>
        <p className="text-sm text-muted-foreground">There are no attendance records to display.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    record.status === "Present"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {record.status === "Present" ? (
                    <CheckCircle className="mr-1 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  {record.status}
                </span>
              </TableCell>
              <TableCell>{record.remarks || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
