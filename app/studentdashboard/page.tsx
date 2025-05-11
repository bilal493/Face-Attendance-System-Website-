"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Calendar,
  CheckCircle2,
  Loader2,
  BarChart3,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO, isValid } from "date-fns"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AttendanceRecord {
  date: string
  status: string
}

interface AttendanceWithFine {
  roll_no: string
  total_days: number
  present_days: number
  percentage: number
  fine: number
}

interface StudentProfile {
  address: string
  email: string
  name: string
  phone: string
  roll_no: string
  student_id: string
}

export default function StudentDashboard() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const rollNo = searchParams.get("roll_no") || "12345" // Default roll number if not provided
  const [attendance, setAttendance] = useState<AttendanceRecord[] | null>(null)
  const [fineData, setFineData] = useState<AttendanceWithFine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFine, setIsLoadingFine] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 5
  const [profile, setProfile] = useState<StudentProfile | null>(null)

  // Calculate attendance statistics
  const calculateStats = () => {
    if (!attendance) return { present: 0, percentage: 0 }

    const present = attendance.filter((record) => record.status.toLowerCase() === "present").length
    const total = attendance.length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return {
      present,
      percentage,
    }
  }

  const stats = calculateStats()

  useEffect(() => {
    if (!email) {
      toast.error("Email is missing. Redirecting to login...")
      window.location.href = "/login"
      return
    }

    const fetchAttendance = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/student/attendance?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          setAttendance(data.attendance || [])

          // Store the profile data
          if (data.profile) {
            setProfile(data.profile)
          }
        } else {
          const errorData = await response.json()
          toast.error(errorData.message || "Failed to fetch attendance data.")
        }
      } catch (error) {
        toast.error("Server error. Please try again later.")
        console.error("Error fetching attendance:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendance()
  }, [email, rollNo])

  const fetchFineData = async () => {
    setIsLoadingFine(true)

    // Use roll_no from profile if available, otherwise use the URL parameter or default
    const studentRollNo = profile?.roll_no || rollNo

    try {
      const response = await fetch(`http://localhost:5000/api/attendance?roll_no=${encodeURIComponent(studentRollNo)}`)

      if (response.ok) {
        const data = await response.json()
        setFineData(data)
        toast.success("Fine information retrieved successfully")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to fetch fine data")
      }
    } catch (error) {
      toast.error("Server error. Please try again later.")
      console.error("Error fetching fine data:", error)
    } finally {
      setIsLoadingFine(false)
    }
  }

  // Format date if it's valid
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      if (isValid(date)) {
        return format(date, "PPP")
      }
      return dateString
    } catch {
      return dateString
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus === "present") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle2 className="w-4 h-4 mr-1" /> Present
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
          <Clock className="w-4 h-4 mr-1" /> Recorded
        </Badge>
      )
    }
  }

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = attendance ? attendance.slice(indexOfFirstRecord, indexOfLastRecord) : []
  const totalPages = attendance ? Math.ceil(attendance.length / recordsPerPage) : 0

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-96 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-12 w-12 text-sky-500 animate-spin mb-4" />
                <h3 className="text-xl font-medium text-gray-700">Loading your attendance</h3>
                <p className="text-gray-500 mt-2 text-center">Please wait while we fetch your records...</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!attendance || attendance.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card className="w-96 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-8">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">No Records Found</h3>
                <p className="text-gray-500 mt-2 text-center">
                  We couldn't find any attendance records for your account.
                </p>
                <Button className="mt-6 bg-sky-500 hover:bg-sky-600" onClick={() => (window.location.href = "/login")}>
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-sky-50 to-white">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Stats Cards */}
          <motion.div
            className="md:w-1/3 space-y-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <User className="mr-2 h-5 w-5 text-sky-500" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="font-medium">{profile.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="font-medium">{profile.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Roll No:</span>
                      <span className="font-medium">{profile.roll_no}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Student ID:</span>
                      <span className="font-medium">{profile.student_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Phone:</span>
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Address:</span>
                      <span className="font-medium text-right">{profile.address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Records:</span>
                      <span className="font-medium">{attendance?.length || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-sky-500" />
                  Attendance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Attendance Rate</span>
                      <span className="text-sm font-medium">{stats.percentage}%</span>
                    </div>
                    <Progress value={stats.percentage} className="h-2" />
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">Present</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.present}</p>
                  </div>

                  <Button
                    className="w-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center gap-2"
                    onClick={fetchFineData}
                    disabled={isLoadingFine}
                  >
                    {isLoadingFine ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                    Check Fine Status
                  </Button>

                  {fineData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <Card className={fineData.fine > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Attendance:</span>
                              <span className="font-bold">{fineData.percentage}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Present Days:</span>
                              <span>
                                {fineData.present_days} / {fineData.total_days}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Fine Amount:</span>
                              <span className={`font-bold ${fineData.fine > 0 ? "text-red-600" : "text-green-600"}`}>
                                Rs.{fineData.fine}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {fineData.fine > 0 && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Attendance Below Threshold</AlertTitle>
                          <AlertDescription>
                            Your attendance is below 75%. Please contact the administration office regarding the fine.
                          </AlertDescription>
                        </Alert>
                      )}
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="md:w-2/3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Attendance Records</CardTitle>
                    <CardDescription>View and track your attendance history</CardDescription>
                  </div>
                  <Clock className="h-6 w-6 text-sky-500" />
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="table" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger
                      value="table"
                      className="data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                    >
                      Table View
                    </TabsTrigger>
                    <TabsTrigger
                      value="cards"
                      className="data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                    >
                      Card View
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="table">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((record, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.3 }}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-sm text-gray-500">{indexOfFirstRecord + index + 1}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-700">{formatDate(record.date)}</td>
                              <td className="px-4 py-3 text-sm">{getStatusBadge(record.status)}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="cards">
                    <div className="space-y-3">
                      {currentRecords.map((record, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <Card className="hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="font-medium">{formatDate(record.date)}</span>
                              </div>
                              {getStatusBadge(record.status)}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>

              {totalPages > 1 && (
                <CardFooter className="flex justify-between items-center border-t p-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, attendance.length)} of{" "}
                    {attendance.length} records
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border-sky-200 text-sky-700 hover:bg-sky-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(i + 1)}
                        className={
                          currentPage === i + 1
                            ? "bg-sky-500 hover:bg-sky-600"
                            : "border-sky-200 text-sky-700 hover:bg-sky-50"
                        }
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border-sky-200 text-sky-700 hover:bg-sky-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
