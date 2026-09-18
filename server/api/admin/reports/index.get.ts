import { query, queryOne } from '../../../utils/db'
import { requireShopAdmin } from '../../../utils/auth'
import { getReportRange } from '../../../utils/reportRange'

export default defineEventHandler(async (event) => {
  const admin = await requireShopAdmin(event)
  const range = getReportRange(event)
  const { from, to, bucket } = range

  const [
    revenueTotals,
    revenueBuckets,
    revenueByPaymentStatus,
    bookingsByStatus,
    rentalLength,
    motorbikePerformance,
    maintenanceCostByBike,
    customerCounts,
    topCustomers,
    byNationality
  ] = await Promise.all([
    queryOne<{ subtotal: string; discount: string; deliveryFee: string; additionalCharges: string; total: string; paidAmount: string; count: string }>(
      `SELECT
        COALESCE(SUM(subtotal),0)::text as subtotal,
        COALESCE(SUM(discount),0)::text as discount,
        COALESCE(SUM("deliveryFee"),0)::text as "deliveryFee",
        COALESCE(SUM("additionalCharges"),0)::text as "additionalCharges",
        COALESCE(SUM(total),0)::text as total,
        COALESCE(SUM("paidAmount"),0)::text as "paidAmount",
        COUNT(*)::text as count
       FROM bookings
       WHERE status NOT IN ('CANCELLED','REJECTED') AND "createdAt"::date BETWEEN $1 AND $2 AND "shopId" = $3`,
      [from, to, admin.shopId]
    ),
    query<{ bucket: string; total: string }>(
      `SELECT to_char(date_trunc($3, "createdAt"), 'YYYY-MM-DD') as bucket, COALESCE(SUM(total),0)::text as total
       FROM bookings
       WHERE status NOT IN ('CANCELLED','REJECTED') AND "createdAt"::date BETWEEN $1 AND $2 AND "shopId" = $4
       GROUP BY 1 ORDER BY 1`,
      [from, to, bucket, admin.shopId]
    ),
    query<{ paymentStatus: string; count: string; total: string }>(
      `SELECT "paymentStatus", COUNT(*)::text as count, COALESCE(SUM(total),0)::text as total
       FROM bookings WHERE "createdAt"::date BETWEEN $1 AND $2 AND "shopId" = $3
       GROUP BY 1 ORDER BY 1`,
      [from, to, admin.shopId]
    ),
    query<{ status: string; count: string }>(
      `SELECT status, COUNT(*)::text as count FROM bookings WHERE "createdAt"::date BETWEEN $1 AND $2 AND "shopId" = $3 GROUP BY 1`,
      [from, to, admin.shopId]
    ),
    queryOne<{ avgDays: string }>(
      `SELECT COALESCE(AVG(EXTRACT(DAY FROM ("returnDate" - "pickupDate"))),0)::text as "avgDays"
       FROM bookings WHERE status NOT IN ('CANCELLED','REJECTED') AND "createdAt"::date BETWEEN $1 AND $2 AND "shopId" = $3`,
      [from, to, admin.shopId]
    ),
    query<{ id: string; name: string; brand: string; bookings: string; revenue: string; bookedDays: string }>(
      `SELECT m.id, m.name, m.brand,
        COUNT(b.id) FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED'))::text as bookings,
        COALESCE(SUM(b.total) FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED')),0)::text as revenue,
        COALESCE(SUM(
          GREATEST(0, EXTRACT(DAY FROM (LEAST(b."returnDate", $2::date + 1) - GREATEST(b."pickupDate", $1::date))))
        ) FILTER (WHERE b.status NOT IN ('CANCELLED','REJECTED')),0)::text as "bookedDays"
       FROM motorbikes m
       LEFT JOIN bookings b ON b."motorbikeId" = m.id AND b."pickupDate" < ($2::date + 1) AND b."returnDate" > $1::date
       WHERE m."shopId" = $3
       GROUP BY m.id, m.name, m.brand
       ORDER BY revenue DESC`,
      [from, to, admin.shopId]
    ),
    query<{ id: string; totalCost: string; recordCount: string }>(
      `SELECT m.id, COALESCE(SUM(mr.cost),0)::text as "totalCost", COUNT(mr.id)::text as "recordCount"
       FROM motorbikes m
       LEFT JOIN maintenance_records mr ON mr."motorbikeId" = m.id AND mr.date::date BETWEEN $1 AND $2
       WHERE m."shopId" = $3
       GROUP BY m.id`,
      [from, to, admin.shopId]
    ),
    queryOne<{ newCustomers: string; returningCustomers: string }>(
      `SELECT
        (SELECT COUNT(DISTINCT c.id) FROM customers c JOIN bookings b ON b."customerId" = c.id
          WHERE c."createdAt"::date BETWEEN $1 AND $2 AND b."shopId" = $3)::text as "newCustomers",
        (SELECT COUNT(DISTINCT c.id) FROM customers c JOIN bookings b ON b."customerId" = c.id
          WHERE b."createdAt"::date BETWEEN $1 AND $2 AND c."createdAt"::date < $1 AND b."shopId" = $3)::text as "returningCustomers"`,
      [from, to, admin.shopId]
    ),
    query<{ id: string; fullName: string; phone: string; bookings: string; totalSpent: string }>(
      `SELECT c.id, c."fullName", c.phone, COUNT(b.id)::text as bookings, COALESCE(SUM(b.total),0)::text as "totalSpent"
       FROM customers c JOIN bookings b ON b."customerId" = c.id AND b.status NOT IN ('CANCELLED','REJECTED')
       WHERE b."createdAt"::date BETWEEN $1 AND $2 AND b."shopId" = $3
       GROUP BY c.id, c."fullName", c.phone
       ORDER BY "totalSpent" DESC LIMIT 10`,
      [from, to, admin.shopId]
    ),
    query<{ nationality: string; count: string }>(
      `SELECT COALESCE(NULLIF(c.nationality,''),'Unknown') as nationality, COUNT(DISTINCT c.id)::text as count
       FROM customers c JOIN bookings b ON b."customerId" = c.id
       WHERE b."createdAt"::date BETWEEN $1 AND $2 AND b."shopId" = $3
       GROUP BY 1 ORDER BY count DESC`,
      [from, to, admin.shopId]
    )
  ])

  const maintenanceById = new Map(maintenanceCostByBike.map((m) => [m.id, m]))
  const bookingsByStatusMap = Object.fromEntries(bookingsByStatus.map((r) => [r.status, Number(r.count)]))
  const totalBookingsInRange = bookingsByStatus.reduce((sum, r) => sum + Number(r.count), 0)
  const cancelledInRange = (bookingsByStatusMap.CANCELLED || 0) + (bookingsByStatusMap.REJECTED || 0)

  return {
    success: true,
    data: {
      range: { from, to, bucket },
      revenue: {
        subtotal: Number(revenueTotals?.subtotal || 0),
        discount: Number(revenueTotals?.discount || 0),
        deliveryFee: Number(revenueTotals?.deliveryFee || 0),
        additionalCharges: Number(revenueTotals?.additionalCharges || 0),
        total: Number(revenueTotals?.total || 0),
        paidAmount: Number(revenueTotals?.paidAmount || 0),
        bookingCount: Number(revenueTotals?.count || 0),
        chart: revenueBuckets.map((r) => ({ label: r.bucket.slice(5), value: Number(r.total) })),
        byPaymentStatus: revenueByPaymentStatus.map((r) => ({
          status: r.paymentStatus,
          count: Number(r.count),
          total: Number(r.total)
        }))
      },
      bookings: {
        total: totalBookingsInRange,
        byStatus: bookingsByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
        avgRentalDays: Math.round(Number(rentalLength?.avgDays || 0) * 10) / 10,
        cancellationRate: totalBookingsInRange > 0 ? Math.round((cancelledInRange / totalBookingsInRange) * 1000) / 10 : 0
      },
      motorbikes: {
        performance: motorbikePerformance.map((m) => {
          const maint = maintenanceById.get(m.id)
          return {
            id: m.id,
            name: m.name,
            brand: m.brand,
            bookings: Number(m.bookings),
            revenue: Number(m.revenue),
            bookedDays: Number(m.bookedDays),
            utilizationPct: Math.min(100, Math.round((Number(m.bookedDays) / range.days) * 1000) / 10),
            maintenanceCost: Number(maint?.totalCost || 0),
            maintenanceCount: Number(maint?.recordCount || 0)
          }
        })
      },
      customers: {
        newCustomers: Number(customerCounts?.newCustomers || 0),
        returningCustomers: Number(customerCounts?.returningCustomers || 0),
        topCustomers: topCustomers.map((c) => ({
          id: c.id,
          fullName: c.fullName,
          phone: c.phone,
          bookings: Number(c.bookings),
          totalSpent: Number(c.totalSpent)
        })),
        byNationality: byNationality.map((r) => ({ nationality: r.nationality, count: Number(r.count) }))
      }
    }
  }
})
