import { query, queryOne } from './db'

export interface ShopStats {
  motorbikes: { total: number; available: number; rented: number; maintenance: number }
  pendingBookings: number
  revenue: { today: number; week: number; month: number; year: number }
  rentals: { total: number; active: number; completed: number; cancelled: number }
  charts: {
    revenueByMonth: { month: string; total: number }[]
    bookingsByMonth: { month: string; count: number }[]
    statusDistribution: { status: string; count: number }[]
  }
  topMotorbikes: { id: string; name: string; rentals: number; revenue: number }[]
}

/** Aggregated dashboard metrics for one shop. Shared by the shop-owner dashboard and the platform Shop Control Center. */
export async function getShopStats(shopId: string): Promise<ShopStats> {
  const counts = await queryOne<{
    total: string
    available: string
    rented: string
    maintenance: string
  }>(
    `SELECT
      COUNT(*)::text as total,
      COUNT(*) FILTER (WHERE status = 'AVAILABLE')::text as available,
      COUNT(*) FILTER (WHERE status = 'RENTED')::text as rented,
      COUNT(*) FILTER (WHERE status = 'MAINTENANCE')::text as maintenance
     FROM motorbikes WHERE "shopId" = $1`,
    [shopId]
  )

  const pendingBookings = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM bookings WHERE status = 'PENDING' AND "shopId" = $1`,
    [shopId]
  )

  const revenueToday = await queryOne<{ sum: string }>(
    `SELECT COALESCE(SUM(total),0)::text as sum FROM bookings
     WHERE status NOT IN ('CANCELLED','REJECTED') AND "createdAt"::date = CURRENT_DATE AND "shopId" = $1`,
    [shopId]
  )
  const revenueMonth = await queryOne<{ sum: string }>(
    `SELECT COALESCE(SUM(total),0)::text as sum FROM bookings
     WHERE status NOT IN ('CANCELLED','REJECTED') AND date_trunc('month', "createdAt") = date_trunc('month', CURRENT_DATE) AND "shopId" = $1`,
    [shopId]
  )
  const revenueYear = await queryOne<{ sum: string }>(
    `SELECT COALESCE(SUM(total),0)::text as sum FROM bookings
     WHERE status NOT IN ('CANCELLED','REJECTED') AND date_trunc('year', "createdAt") = date_trunc('year', CURRENT_DATE) AND "shopId" = $1`,
    [shopId]
  )
  const revenueWeek = await queryOne<{ sum: string }>(
    `SELECT COALESCE(SUM(total),0)::text as sum FROM bookings
     WHERE status NOT IN ('CANCELLED','REJECTED') AND date_trunc('week', "createdAt") = date_trunc('week', CURRENT_DATE) AND "shopId" = $1`,
    [shopId]
  )

  const rentalCounts = await queryOne<{
    total: string
    active: string
    completed: string
    cancelled: string
  }>(
    `SELECT
      COUNT(*)::text as total,
      COUNT(*) FILTER (WHERE status IN ('PENDING','CONFIRMED','PICKED_UP'))::text as active,
      COUNT(*) FILTER (WHERE status = 'RETURNED')::text as completed,
      COUNT(*) FILTER (WHERE status IN ('CANCELLED','REJECTED'))::text as cancelled
     FROM bookings WHERE "shopId" = $1`,
    [shopId]
  )

  const revenueByMonth = await query<{ month: string; total: string }>(
    `SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month, COALESCE(SUM(total),0)::text as total
     FROM bookings
     WHERE status NOT IN ('CANCELLED','REJECTED') AND "createdAt" > CURRENT_DATE - INTERVAL '12 months' AND "shopId" = $1
     GROUP BY 1 ORDER BY 1 ASC`,
    [shopId]
  )

  const bookingsByMonth = await query<{ month: string; count: string }>(
    `SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month, COUNT(*)::text as count
     FROM bookings
     WHERE "createdAt" > CURRENT_DATE - INTERVAL '12 months' AND "shopId" = $1
     GROUP BY 1 ORDER BY 1 ASC`,
    [shopId]
  )

  const statusDistribution = await query<{ status: string; count: string }>(
    `SELECT status, COUNT(*)::text as count FROM bookings WHERE "shopId" = $1 GROUP BY status`,
    [shopId]
  )

  const topMotorbikes = await query<{ id: string; name: string; rentals: string; revenue: string }>(
    `SELECT m.id, m.name, COUNT(b.id)::text as rentals, COALESCE(SUM(b.total),0)::text as revenue
     FROM motorbikes m
     LEFT JOIN bookings b ON b."motorbikeId" = m.id AND b.status NOT IN ('CANCELLED','REJECTED')
     WHERE m."shopId" = $1
     GROUP BY m.id, m.name
     ORDER BY revenue DESC
     LIMIT 5`,
    [shopId]
  )

  return {
    motorbikes: {
      total: Number(counts?.total || 0),
      available: Number(counts?.available || 0),
      rented: Number(counts?.rented || 0),
      maintenance: Number(counts?.maintenance || 0)
    },
    pendingBookings: Number(pendingBookings?.count || 0),
    revenue: {
      today: Number(revenueToday?.sum || 0),
      week: Number(revenueWeek?.sum || 0),
      month: Number(revenueMonth?.sum || 0),
      year: Number(revenueYear?.sum || 0)
    },
    rentals: {
      total: Number(rentalCounts?.total || 0),
      active: Number(rentalCounts?.active || 0),
      completed: Number(rentalCounts?.completed || 0),
      cancelled: Number(rentalCounts?.cancelled || 0)
    },
    charts: {
      revenueByMonth: revenueByMonth.map((r) => ({ month: r.month, total: Number(r.total) })),
      bookingsByMonth: bookingsByMonth.map((r) => ({ month: r.month, count: Number(r.count) })),
      statusDistribution: statusDistribution.map((r) => ({ status: r.status, count: Number(r.count) }))
    },
    topMotorbikes: topMotorbikes.map((m) => ({
      id: m.id,
      name: m.name,
      rentals: Number(m.rentals),
      revenue: Number(m.revenue)
    }))
  }
}
