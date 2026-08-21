import { queryOne } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const row = await queryOne<{
    todayReservations: string
    activeRentals: string
    returningToday: string
    availableMotors: string
    upcomingThisWeek: string
    pendingCount: string
    unpaidCustomers: string
  }>(
    `SELECT
      (SELECT COUNT(*) FROM bookings
        WHERE "pickupDate"::date = CURRENT_DATE AND status NOT IN ('CANCELLED','REJECTED'))::text as "todayReservations",
      (SELECT COUNT(*) FROM bookings WHERE status = 'PICKED_UP')::text as "activeRentals",
      (SELECT COUNT(*) FROM bookings
        WHERE status = 'PICKED_UP' AND "returnDate"::date = CURRENT_DATE)::text as "returningToday",
      (SELECT COUNT(*) FROM motorbikes WHERE status = 'AVAILABLE')::text as "availableMotors",
      (SELECT COUNT(*) FROM bookings
        WHERE "pickupDate"::date > CURRENT_DATE AND "pickupDate"::date <= CURRENT_DATE + interval '7 days'
          AND status IN ('PENDING','CONFIRMED'))::text as "upcomingThisWeek",
      (SELECT COUNT(*) FROM bookings WHERE status = 'PENDING')::text as "pendingCount",
      (SELECT COUNT(*) FROM bookings
        WHERE "paymentStatus" IN ('UNPAID','PARTIAL') AND status NOT IN ('CANCELLED','REJECTED'))::text as "unpaidCustomers"
    `
  )

  return {
    success: true,
    data: {
      todayReservations: Number(row?.todayReservations || 0),
      activeRentals: Number(row?.activeRentals || 0),
      returningToday: Number(row?.returningToday || 0),
      availableMotors: Number(row?.availableMotors || 0),
      upcomingThisWeek: Number(row?.upcomingThisWeek || 0),
      pendingCount: Number(row?.pendingCount || 0),
      unpaidCustomers: Number(row?.unpaidCustomers || 0)
    }
  }
})
