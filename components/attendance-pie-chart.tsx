"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface AttendancePieChartProps {
  percentage: number
}

export function AttendancePieChart({ percentage }: AttendancePieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = 200
    canvas.width = size
    canvas.height = size

    // Calculate angles
    const startAngle = -0.5 * Math.PI // Start at the top
    const endAngle = startAngle + (percentage / 100) * 2 * Math.PI

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw background circle
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI)
    ctx.fillStyle = "#f1f5f9" // slate-100
    ctx.fill()

    // Draw progress arc
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 10, startAngle, endAngle)
    ctx.lineTo(size / 2, size / 2)
    ctx.closePath()

    // Set color based on percentage
    let color
    if (percentage >= 75) {
      color = "#22c55e" // green-500
    } else if (percentage >= 50) {
      color = "#eab308" // yellow-500
    } else {
      color = "#ef4444" // red-500
    }

    ctx.fillStyle = color
    ctx.fill()

    // Draw inner circle for donut effect
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 3, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff" // white
    ctx.fill()

    // Draw text
    ctx.font = "bold 32px Inter, sans-serif"
    ctx.fillStyle = "#0f172a" // slate-900
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${percentage}%`, size / 2, size / 2)
  }, [percentage])

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <canvas ref={canvasRef} width="200" height="200" />
    </motion.div>
  )
}
