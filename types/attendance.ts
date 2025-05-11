export interface AttendanceRecord {
  date: string
  status: "Present" | "Absent"
  remarks?: string
}

export interface PaymentStatus {
  needs_to_pay_fine: boolean
  fine_amount?: number
  payment_status?: "pending" | "paid"
}
