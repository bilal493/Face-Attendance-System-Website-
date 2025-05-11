"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, User } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Student Attendance System</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track attendance, manage fines, and stay on top of your academic responsibilities
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
      >
        <motion.div variants={item}>
          <Card className="h-full transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Student Portal
              </CardTitle>
              <CardDescription>Login to view your attendance and manage fines</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Access your attendance records, check your attendance percentage, and pay any outstanding fines if your
                attendance falls below 75%.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full group">
                  Login as Student
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Admin Portal
              </CardTitle>
              <CardDescription>Manage holidays and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Administrators can view and manage holidays, which affect attendance calculations for all students in
                the system.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/adminlogin" className="w-full">
                <Button variant="outline" className="w-full group">
                  Login as Admin
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-16 text-center"
      >
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Student Attendance System. All rights reserved.
        </p>
      </motion.div>
    </main>
  )
}
