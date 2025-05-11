"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAdminAuth } from "@/context/admin-auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, CheckCircle, Download, Plus, Search, Trash2, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { HolidayForm } from "@/components/holiday-form"
import { EmptyState } from "@/components/empty-state"
import type { Holiday } from "@/types/holiday"

interface AttendanceRecord {
  date: string
  status: "Present" | "Absent"
  student_name: string
  student_rollno: string
}

export default function AdminPage() {
  const { admin, adminLogout, isAdminAuthenticated } = useAdminAuth()
  const router = useRouter()

  // Holiday state
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isHolidayLoading, setIsHolidayLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [holidaySearchQuery, setHolidaySearchQuery] = useState("")
  const [holidayDate, setHolidayDate] = useState<Date | undefined>(undefined)

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Active tab state
  const [activeTab, setActiveTab] = useState("attendance")

  useEffect(() => {
    // Force redirect to admin login if not authenticated
    if (!isAdminAuthenticated) {
      console.log("Not authenticated, redirecting to admin login")
      router.replace("/adminlogin")
      return
    }

    console.log("Admin authenticated, fetching data")

    // Fetch data based on active tab
    if (activeTab === "holidays") {
      fetchHolidays()
    } else {
      fetchAttendance()
    }
  }, [isAdminAuthenticated, router, activeTab])

  // Holiday management functions
  const fetchHolidays = async () => {
    setIsHolidayLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:5000/api/get_holidays")
      if (response.ok) {
        const data = await response.json()
        setHolidays(data || [])
      } else {
        toast.error("Failed to fetch holidays")
      }
    } catch (error) {
      console.error("Error fetching holidays:", error)
      toast.error("Server error. Please try again later.")
    } finally {
      setIsHolidayLoading(false)
    }
  }

  const handleAddHoliday = async (date: string, description: string) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/add_holiday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date, // Using 'date' as the key as per the API
          description,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Holiday added successfully")
        fetchHolidays()
        setShowAddForm(false)
      } else {
        toast.error(data.error || "Failed to add holiday")
      }
    } catch (error) {
      console.error("Error adding holiday:", error)
      toast.error("Server error. Please try again later.")
    }
  }

  const handleDeleteHoliday = async (id: number) => {
    try {
      // Note: The API endpoint is 'delete_holidays' (plural)
      const response = await fetch(`http://127.0.0.1:5000/api/delete_holidays/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Holiday deleted successfully")
        fetchHolidays()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete holiday")
      }
    } catch (error) {
      console.error("Error deleting holiday:", error)
      toast.error("Server error. Please try again later.")
    }
  }

  // Attendance management functions
  const fetchAttendance = async () => {
    setIsAttendanceLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:5000/api/admin/attendance")
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data || [])
      } else {
        toast.error("Failed to fetch attendance records")
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast.error("Server error. Please try again later.")
    } finally {
      setIsAttendanceLoading(false)
    }
  }

  // Filter attendance records based on search query and date
  const filteredAttendance = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_rollno.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = selectedDate ? new Date(record.date).toDateString() === selectedDate.toDateString() : true

    return matchesSearch && matchesDate
  })

  // Filter holidays based on search query and date
  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch = holiday.description.toLowerCase().includes(holidaySearchQuery.toLowerCase())

    const matchesDate = holidayDate ? new Date(holiday.date).toDateString() === holidayDate.toDateString() : true

    return matchesSearch && matchesDate
  })

  // Format date for CSV export
  const formatDateForCSV = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MM/dd/yyyy") // Format as MM/DD/YYYY for better spreadsheet compatibility
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString // Return original string if formatting fails
    }
  }

  // Export attendance to CSV
  const exportToCSV = () => {
    // Create CSV content with properly formatted dates
    const headers = ["Date", "Status", "Student Name", "Roll Number"]
    const csvContent = [
      headers.join(","),
      ...filteredAttendance.map((record) =>
        [formatDateForCSV(record.date), record.status, record.student_name, record.student_rollno].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `attendance_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${filteredAttendance.length} attendance records`)
  }

  // Export holidays to CSV
  const exportHolidaysToCSV = () => {
    // Create CSV content with properly formatted dates
    const headers = ["Date", "Description"]
    const csvContent = [
      headers.join(","),
      ...filteredHolidays.map((holiday) =>
        [
          formatDateForCSV(holiday.date),
          // Escape commas in description to prevent CSV format issues
          `"${holiday.description.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `holidays_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${filteredHolidays.length} holiday records`)
  }

  // Clear all filters
  const clearAttendanceFilters = () => {
    setSearchQuery("")
    setSelectedDate(undefined)
  }

  const clearHolidayFilters = () => {
    setHolidaySearchQuery("")
    setHolidayDate(undefined)
  }

  // If not authenticated, show loading state while redirecting
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <DashboardHeader title="Admin Dashboard" email={admin || "Admin"} onLogout={adminLogout} />

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="attendance">Attendance Management</TabsTrigger>
            <TabsTrigger value="holidays">Holiday Management</TabsTrigger>
          </TabsList>

          {/* Attendance Management Tab */}
          <TabsContent value="attendance">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>View and manage student attendance records</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or roll number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Date Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full md:w-[240px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                      </PopoverContent>
                    </Popover>

                    {/* Clear Filters Button */}
                    {(searchQuery || selectedDate) && (
                      <Button variant="ghost" onClick={clearAttendanceFilters} className="md:w-auto">
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {isAttendanceLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : filteredAttendance.length === 0 ? (
                    <EmptyState
                      title="No attendance records found"
                      description={
                        searchQuery || selectedDate
                          ? "Try adjusting your search or date filter"
                          : "There are no attendance records in the system yet."
                      }
                      icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
                      actionLabel="Refresh Data"
                      onAction={fetchAttendance}
                    />
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Roll Number</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAttendance.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDateForCSV(record.date)}</TableCell>
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
                              <TableCell>{record.student_name}</TableCell>
                              <TableCell>{record.student_rollno}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Holiday Management Tab */}
          <TabsContent value="holidays">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Holiday Management</CardTitle>
                    <CardDescription>Add and manage holidays that affect attendance calculation</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportHolidaysToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button
                      onClick={() => setShowAddForm(!showAddForm)}
                      variant={showAddForm ? "secondary" : "default"}
                      size="sm"
                    >
                      {showAddForm ? (
                        "Cancel"
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Holiday
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <HolidayForm onSubmit={handleAddHoliday} />
                    </motion.div>
                  )}

                  {/* Holiday Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by description..."
                        value={holidaySearchQuery}
                        onChange={(e) => setHolidaySearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Date Picker for Holidays */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full md:w-[240px] justify-start text-left font-normal",
                            !holidayDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {holidayDate ? format(holidayDate, "PPP") : "Filter by date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar mode="single" selected={holidayDate} onSelect={setHolidayDate} initialFocus />
                      </PopoverContent>
                    </Popover>

                    {/* Clear Filters Button for Holidays */}
                    {(holidaySearchQuery || holidayDate) && (
                      <Button variant="ghost" onClick={clearHolidayFilters} className="md:w-auto">
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {isHolidayLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : filteredHolidays.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-medium">No holidays found</h3>
                      <p className="text-sm text-muted-foreground">
                        {holidaySearchQuery || holidayDate
                          ? "Try adjusting your search or date filter"
                          : "Add holidays to exclude them from attendance calculations."}
                      </p>
                      {!showAddForm && !holidaySearchQuery && !holidayDate && (
                        <Button onClick={() => setShowAddForm(true)} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Holiday
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHolidays.map((holiday) => (
                            <TableRow key={holiday.id}>
                              <TableCell>{formatDateForCSV(holiday.date)}</TableCell>
                              <TableCell>{holiday.description || "Holiday"}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteHoliday(Number(holiday.id))}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
