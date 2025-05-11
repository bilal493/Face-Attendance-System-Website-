"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import type { AttendanceRecord } from "@/types/attendance"

interface AttendanceSummaryProps {
  attendanceData: AttendanceRecord[]
}

export function AttendanceSummary({ attendanceData }: AttendanceSummaryProps) {
  const calculateAttendancePercentage = () => {
    if (!attendanceData.length) return 0

    const presentDays = attendanceData.filter((record) => record.status === "Present").length
    return Math.round((presentDays / attendanceData.length) * 100)
  }

  const attendancePercentage = calculateAttendancePercentage()
  const presentDays = attendanceData.filter((record) => record.status === "Present").length
  const absentDays = attendanceData.filter((record) => record.status === "Absent").length
  const totalDays = attendanceData.length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>Overview of your attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Attendance Progress</span>
                <span className="text-sm font-medium">{attendancePercentage}%</span>
              </div>
              <Progress
                value={attendancePercentage}
                className={`h-2 ${
                  attendancePercentage >= 75
                    ? "bg-muted text-primary"
                    : attendancePercentage >= 50
                      ? "bg-muted text-yellow-500"
                      : "bg-muted text-red-500"
                }`}
              />
              <p className="text-sm mt-2 text-muted-foreground">
                {attendancePercentage >= 75
                  ? "Your attendance is good"
                  : attendancePercentage >= 50
                    ? "Your attendance needs improvement"
                    : "Your attendance is critical"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                <p className="text-2xl font-bold">{totalDays}</p>
              </div>

              <div className="flex flex-col items-center p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Present</p>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{presentDays}</p>
              </div>

              <div className="flex flex-col items-center p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Absent</p>
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{absentDays}</p>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                  <span className="text-sm">Required (75%)</span>
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      attendancePercentage >= 75
                        ? "bg-green-500"
                        : attendancePercentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm">Your Attendance</span>
                </div>
                <span className="text-sm font-medium">{attendancePercentage}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
