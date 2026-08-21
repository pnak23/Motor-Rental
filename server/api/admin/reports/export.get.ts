import { query } from '../../../utils/db'
import { requireAuth } from '../../../utils/auth'
import { getReportRange } from '../../../utils/reportRange'
import { toCsv } from '../../../utils/csv'

type ReportType = 'bookings' | 'motorbikes' | 'customers'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const { from, to } = getReportRange(event)
  const type = (getQuery(event).type as ReportType) || 'bookings'

  let csv = ''
  let filename = `report-${type}-${from}-to-${to}.csv`

  if (type === 'bookings') {
    const rows = await query<{
      bookingNumber: string
      customerName: string
      customerPhone: string
      motorbikeName: string
      pickupDate: string
      returnDate: string
      status: string
      paymentStatus: string
      subtotal: string
      discount: string
      deliveryFee: string
      additionalCharges: string
      total: string
      deposit: string
      paidAmount: string
      createdAt: string
    }>(
      `SELECT b."bookingNumber", c."fullName" as "customerName", c.phone as "customerPhone", m.name as "motorbikeName",
        b."pickupDate", b."returnDate", b.status, b."paymentStatus",
        b.subtotal, b.discount, b."deliveryFee", b."additionalCharges", b.total, b.deposit, b."paidAmount", b."createdAt"
       FROM bookings b
       JOIN customers c ON c.id = b."customerId"
       JOIN motorbikes m ON m.id = b."motorbikeId"
       WHERE b."createdAt"::date BETWEEN $1 AND $2
       ORDER BY b."createdAt" ASC`,
      [from, to]
    )
    csv = toCsv(rows, [
      { header: 'Booking #', value: (r) => r.bookingNumber },
      { header: 'Customer', value: (r) => r.customerName },
      { header: 'Phone', value: (r) => r.customerPhone },
      { header: 'Motorbike', value: (r) => r.motorbikeName },
      { header: 'Pickup Date', value: (r) => new Date(r.pickupDate).toISOString().slice(0, 10) },
      { header: 'Return Date', value: (r) => new Date(r.returnDate).toISOString().slice(0, 10) },
      { header: 'Status', value: (r) => r.status },
      { header: 'Payment Status', value: (r) => r.paymentStatus },
      { header: 'Subtotal', value: (r) => Number(r.subtotal).toFixed(2) },
      { header: 'Discount', value: (r) => Number(r.discount).toFixed(2) },
      { header: 'Delivery Fee', value: (r) => Number(r.deliveryFee).toFixed(2) },
      { header: 'Additional Charges', value: (r) => Number(r.additionalCharges).toFixed(2) },
      { header: 'Total', value: (r) => Number(r.total).toFixed(2) },
      { header: 'Deposit', value: (r) => Number(r.deposit).toFixed(2) },
      { header: 'Paid Amount', value: (r) => Number(r.paidAmount).toFixed(2) },
      { header: 'Created At', value: (r) => new Date(r.createdAt).toISOString() }
    ])
  } else if (type === 'motorbikes') {
    const rows = await query<{
      id: string
      name: string
      brand: string
      bookings: string
      revenue: string
      bookedDays: string
      maintenanceCost: string
      maintenanceCount: string
    }>(
      `SELECT m.id, m.name, m.brand,
        COUNT(b.id) FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED'))::text as bookings,
        COALESCE(SUM(b.total) FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED')),0)::text as revenue,
        COALESCE(SUM(
          GREATEST(0, EXTRACT(DAY FROM (LEAST(b."returnDate", $2::date + 1) - GREATEST(b."pickupDate", $1::date))))
        ) FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED')),0)::text as "bookedDays",
        COALESCE((SELECT SUM(mr.cost) FROM maintenance_records mr WHERE mr."motorbikeId" = m.id AND mr.date::date BETWEEN $1 AND $2),0)::text as "maintenanceCost",
        COALESCE((SELECT COUNT(*) FROM maintenance_records mr WHERE mr."motorbikeId" = m.id AND mr.date::date BETWEEN $1 AND $2),0)::text as "maintenanceCount"
       FROM motorbikes m
       LEFT JOIN bookings b ON b."motorbikeId" = m.id AND b."pickupDate" < ($2::date + 1) AND b."returnDate" > $1::date
       GROUP BY m.id, m.name, m.brand
       ORDER BY revenue DESC`,
      [from, to]
    )
    csv = toCsv(rows, [
      { header: 'Motorbike', value: (r) => r.name },
      { header: 'Brand', value: (r) => r.brand },
      { header: 'Bookings', value: (r) => r.bookings },
      { header: 'Revenue', value: (r) => Number(r.revenue).toFixed(2) },
      { header: 'Booked Days', value: (r) => r.bookedDays },
      { header: 'Maintenance Cost', value: (r) => Number(r.maintenanceCost).toFixed(2) },
      { header: 'Maintenance Records', value: (r) => r.maintenanceCount }
    ])
  } else if (type === 'customers') {
    const rows = await query<{
      fullName: string
      phone: string
      email: string | null
      nationality: string | null
      bookings: string
      totalSpent: string
    }>(
      `SELECT c."fullName", c.phone, c.email, c.nationality, COUNT(b.id)::text as bookings, COALESCE(SUM(b.total),0)::text as "totalSpent"
       FROM customers c JOIN bookings b ON b."customerId" = c.id AND b.status NOT IN ('CANCELLED','REJECTED')
       WHERE b."createdAt"::date BETWEEN $1 AND $2
       GROUP BY c.id, c."fullName", c.phone, c.email, c.nationality
       ORDER BY "totalSpent" DESC`,
      [from, to]
    )
    csv = toCsv(rows, [
      { header: 'Name', value: (r) => r.fullName },
      { header: 'Phone', value: (r) => r.phone },
      { header: 'Email', value: (r) => r.email },
      { header: 'Nationality', value: (r) => r.nationality },
      { header: 'Bookings', value: (r) => r.bookings },
      { header: 'Total Spent', value: (r) => Number(r.totalSpent).toFixed(2) }
    ])
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Unknown report type' })
  }

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  return csv
})
