/**
 * Seed script for local development / demo purposes.
 * Run with: npm run db:seed
 *
 * This populates categories, ~12 example motorbikes (with placeholder
 * images), locations, FAQs, business settings/policies, a sample banner,
 * and one SUPER_ADMIN login so the admin dashboard can be explored
 * immediately after setup.
 */
import 'dotenv/config'
import { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function id() {
  return randomUUID()
}

async function main() {
  console.log('Seeding database...')

  // ── Categories ──────────────────────────────────────
  const categories = [
    { name: 'Scooter', slug: 'scooter' },
    { name: 'Automatic', slug: 'automatic' },
    { name: 'Manual', slug: 'manual' },
    { name: 'Semi-Automatic', slug: 'semi-automatic' },
    { name: 'Premium', slug: 'premium' }
  ]
  const categoryIds: Record<string, string> = {}
  for (const c of categories) {
    const cid = id()
    categoryIds[c.slug] = cid
    await pool.query(
      `INSERT INTO motorbike_categories (id, name, slug) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING`,
      [cid, c.name, c.slug]
    )
  }

  // ── Motorbikes ──────────────────────────────────────
  const placeholderImages = [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200',
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200',
    'https://images.unsplash.com/photo-1571646750134-a02fb50c1b23?w=1200',
    'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=1200'
  ]

  const motorbikes = [
    { name: 'Honda Dream', brand: 'Honda', model: 'Dream 110', cc: 110, trans: 'SEMI_AUTOMATIC', category: 'manual', daily: 8, weekly: 50, monthly: 160, featured: true, popular: true },
    { name: 'Honda Click', brand: 'Honda', model: 'Click 125i', cc: 125, trans: 'AUTOMATIC', category: 'scooter', daily: 12, weekly: 75, monthly: 260, featured: true, popular: true },
    { name: 'Honda Scoopy', brand: 'Honda', model: 'Scoopy i', cc: 110, trans: 'AUTOMATIC', category: 'scooter', daily: 12, weekly: 75, monthly: 260, featured: true, popular: false },
    { name: 'Honda ADV', brand: 'Honda', model: 'ADV 160', cc: 160, trans: 'AUTOMATIC', category: 'premium', daily: 20, weekly: 130, monthly: 480, featured: true, popular: true },
    { name: 'Honda Wave', brand: 'Honda', model: 'Wave 110', cc: 110, trans: 'SEMI_AUTOMATIC', category: 'manual', daily: 8, weekly: 50, monthly: 160, featured: false, popular: false },
    { name: 'Honda PCX', brand: 'Honda', model: 'PCX 160', cc: 160, trans: 'AUTOMATIC', category: 'premium', daily: 18, weekly: 115, monthly: 420, featured: false, popular: true },
    { name: 'Yamaha NMAX', brand: 'Yamaha', model: 'NMAX 155', cc: 155, trans: 'AUTOMATIC', category: 'premium', daily: 18, weekly: 115, monthly: 420, featured: false, popular: false },
    { name: 'Yamaha Aerox', brand: 'Yamaha', model: 'Aerox 155', cc: 155, trans: 'AUTOMATIC', category: 'scooter', daily: 15, weekly: 95, monthly: 340, featured: false, popular: false },
    { name: 'Yamaha Fino', brand: 'Yamaha', model: 'Fino 125', cc: 125, trans: 'AUTOMATIC', category: 'scooter', daily: 10, weekly: 62, monthly: 210, featured: false, popular: false },
    { name: 'Suzuki Address', brand: 'Suzuki', model: 'Address 110', cc: 110, trans: 'AUTOMATIC', category: 'scooter', daily: 9, weekly: 56, monthly: 190, featured: false, popular: false },
    { name: 'Honda XR150L', brand: 'Honda', model: 'XR150L', cc: 150, trans: 'MANUAL', category: 'manual', daily: 16, weekly: 100, monthly: 380, featured: false, popular: false },
    { name: 'Honda CRF300L', brand: 'Honda', model: 'CRF300L', cc: 300, trans: 'MANUAL', category: 'premium', daily: 28, weekly: 175, monthly: 640, featured: false, popular: false }
  ]

  for (const [i, m] of motorbikes.entries()) {
    const mid = id()
    const slug = `${m.brand.toLowerCase()}-${m.model.toLowerCase().replace(/\s+/g, '-')}`
    await pool.query(
      `INSERT INTO motorbikes (
        id, name, slug, brand, model, year, "engineCc", "categoryId", transmission, "fuelType",
        "seatCapacity", description, status, featured, popular, "helmetIncluded", "goodForCity", "goodForLongTrip",
        "dailyPrice", "weeklyPrice", "monthlyPrice", deposit, "deliveryFee", "minRentalDays", "maxRentalDays",
        "createdAt", "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,'GASOLINE',
        2,$10,'AVAILABLE',$11,$12,true,true,$13,
        $14,$15,$16,50,3,1,60, now(), now()
      ) ON CONFLICT (slug) DO NOTHING`,
      [
        mid, m.name, slug, m.brand, m.model, 2022 + (i % 4), m.cc, categoryIds[m.category], m.trans,
        `The ${m.name} ${m.model} is a reliable, well-maintained ${m.cc}cc motorbike, perfect for exploring Siem Reap and the temples of Angkor. Comes with a helmet and full tank of fuel.`,
        m.featured, m.popular, m.cc >= 150,
        m.daily, m.weekly, m.monthly
      ]
    )
    // one placeholder photo each
    const img = placeholderImages[i % placeholderImages.length]
    await pool.query(
      `INSERT INTO motorbike_images (id, "motorbikeId", url, filename, size, "mimeType", "isPrimary", "sortOrder", "createdAt")
       SELECT $1, id, $2, $3, 0, 'image/jpeg', true, 0, now() FROM motorbikes WHERE slug = $4
       ON CONFLICT DO NOTHING`,
      [id(), img, `${slug}.jpg`, slug]
    )
  }

  // ── Locations ───────────────────────────────────────
  const locations = [
    { name: 'Siem Reap City Center', address: 'Sivatha Blvd, Siem Reap, Cambodia', opening: '07:00', closing: '20:00', lat: 13.3633, lng: 103.8564 },
    { name: 'Siem Reap International Airport', address: 'National Road 6, Siem Reap, Cambodia', opening: '06:00', closing: '22:00', lat: 13.4107, lng: 103.8130 },
    { name: 'Pub Street Area', address: 'Pub Street, Old Market, Siem Reap, Cambodia', opening: '08:00', closing: '23:00', lat: 13.3546, lng: 103.8558 },
    { name: 'Hotel Delivery', address: 'Delivered to any hotel within Siem Reap town', opening: '07:00', closing: '19:00', lat: null, lng: null }
  ]
  for (const [i, l] of locations.entries()) {
    await pool.query(
      `INSERT INTO locations (id, name, address, description, latitude, longitude, "openingTime", "closingTime", "isActive", "sortOrder")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9) ON CONFLICT DO NOTHING`,
      [id(), l.name, l.address, null, l.lat, l.lng, l.opening, l.closing, i]
    )
  }

  // ── FAQs ────────────────────────────────────────────
  const faqs = [
    { q: 'Do I need a driving license to rent a motorbike?', a: 'An international driving permit or a valid motorbike license from your home country is recommended. For scooters under 125cc, many renters do not require a license, but we strongly recommend having valid documentation for your own safety and insurance coverage.' },
    { q: 'Do you provide helmets?', a: 'Yes — every rental includes one free helmet. Additional helmets are available on request at no extra cost, subject to availability.' },
    { q: 'Can I rent a motorbike for one month?', a: 'Absolutely. We offer discounted monthly rates on most models — just select your dates on the motorbike page and the monthly price will apply automatically for rentals of 30 days or more.' },
    { q: 'Can you deliver the motorbike to my hotel?', a: 'Yes, we offer hotel delivery and pickup throughout Siem Reap town for a small delivery fee, which varies by location and is shown at checkout.' },
    { q: 'What happens if the motorbike breaks down?', a: 'Call or message us on Telegram/WhatsApp immediately. We provide roadside support and will arrange a replacement motorbike or repair as quickly as possible at no extra cost, provided the issue was not caused by misuse.' },
    { q: 'Is a deposit required?', a: 'A refundable deposit is required for most motorbikes, shown on each motorbike\u2019s detail page. This is returned in full when the motorbike is returned in its original condition.' }
  ]
  for (const [i, f] of faqs.entries()) {
    await pool.query(
      `INSERT INTO faqs (id, question, answer, "sortOrder", "isActive", "createdAt") VALUES ($1,$2,$3,$4,true, now())`,
      [id(), f.q, f.a, i]
    )
  }

  // ── Business settings / policies ───────────────────
  await pool.query(
    `INSERT INTO business_settings (
      id, "businessName", description, phone, email, address, telegram, whatsapp, facebook, instagram,
      "heroTitle", "heroSubtitle", "aboutTitle", "aboutDescription", "aboutStory", "aboutMission", "aboutWhyChooseUs",
      "footerText", "depositPolicy", "fuelPolicy", "lateReturnPolicy", "damagePolicy", "cancellationPolicy",
      "accidentPolicy", "trafficViolationPolicy", "helmetPolicy", "minimumAge", "requiredDocuments", "updatedAt"
    ) VALUES (
      'main', 'Angkor Wheels Rental',
      'Siem Reap''s trusted local motorbike rental service for tourists and residents alike.',
      '+855 12 345 678', 'hello@angkorwheels.com', 'Sivatha Boulevard, Siem Reap, Cambodia',
      '@angkorwheels', '85512345678', 'https://facebook.com/angkorwheels', 'https://instagram.com/angkorwheels',
      'Explore Siem Reap on Two Wheels', 'Reliable motorbike rental in Siem Reap, Cambodia.',
      'About Angkor Wheels Rental',
      'We are a locally-owned motorbike rental company based in the heart of Siem Reap, proudly serving travelers exploring the temples of Angkor and beyond.',
      'Founded by a team of Siem Reap locals who grew up riding these roads, Angkor Wheels started with three scooters and a simple promise: honest prices, well-maintained bikes, and real local support.',
      'To make independent exploration of Siem Reap safe, easy, and affordable for every traveler.',
      'Well-maintained fleet, transparent pricing, 24/7 local support on Telegram and WhatsApp, and free hotel delivery within town.',
      'Angkor Wheels Rental — your local motorbike partner in Siem Reap.',
      'A refundable deposit is collected at pickup and returned in full when the motorbike is returned undamaged.',
      'Motorbikes are provided with a full tank. Please return with a full tank or a small refueling fee will apply.',
      'A grace period of 1 hour is allowed. Late returns beyond that are charged at the hourly-equivalent daily rate.',
      'Renters are responsible for damage beyond normal wear and tear, assessed against the deposit at return.',
      'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours forfeit the deposit.',
      'In case of an accident, contact us immediately. Our team will assist with the appropriate local authorities and insurance process.',
      'Any traffic fines incurred during the rental period are the responsibility of the renter.',
      'One helmet is included free with every rental; additional helmets available on request.',
      18, 'A valid ID or passport is required at pickup. An international driving permit is recommended.',
      now()
    ) ON CONFLICT (id) DO NOTHING`
  )

  // ── Banner ──────────────────────────────────────────
  await pool.query(
    `INSERT INTO banners (id, title, subtitle, "imageUrl", "buttonText", "buttonUrl", "isActive", "sortOrder", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,true,0, now())`,
    [
      id(),
      'Free hotel delivery this month',
      'Book any automatic scooter for 3+ days and we\u2019ll deliver it to your hotel for free.',
      'https://images.unsplash.com/photo-1596178060810-72660ee8d859?w=1600',
      'Browse Motorbikes',
      '/motorbikes'
    ]
  )

  // ── Admin user ──────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 10)
  await pool.query(
    `INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
     VALUES ($1,'admin@angkorwheels.com',$2,'Admin','SUPER_ADMIN',true, now(), now())
     ON CONFLICT (email) DO NOTHING`,
    [id(), passwordHash]
  )

  console.log('Seed complete.')
  console.log('Admin login: admin@angkorwheels.com / Admin123!')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => pool.end())
