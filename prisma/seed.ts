/**
 * Seed script for local development / demo purposes.
 * Run with: npm run db:seed
 *
 * This populates categories, two demo shops each with their own motorbikes,
 * locations, and payment/policy settings, plus FAQs, platform-wide branding,
 * a sample banner, and one platform super admin login and one owner login
 * per shop so the admin dashboard can be explored immediately after setup.
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

  // ── Categories (shared across all shops) ────────────
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

  // ── Shops ─────────────────────────────────────────
  const shops = [
    {
      slug: 'angkor-wheels-rental',
      name: 'Angkor Wheels Rental',
      phone: '+855 12 345 678',
      email: 'hello@angkorwheels.com',
      address: 'Sivatha Boulevard, Siem Reap, Cambodia',
      telegram: '@angkorwheels',
      whatsapp: '85512345678',
      khqrAccountId: 'angkorwheels@aclb',
      khqrMerchantName: 'Angkor Wheels Rental',
      khqrMerchantCity: 'Siem Reap',
      ownerEmail: 'owner@angkorwheels.com',
      ownerName: 'Angkor Wheels Owner'
    },
    {
      slug: 'pub-street-scooters',
      name: 'Pub Street Scooters',
      phone: '+855 89 222 111',
      email: 'hello@pubstreetscooters.com',
      address: 'Old Market, Siem Reap, Cambodia',
      telegram: '@pubstreetscooters',
      whatsapp: '85589222111',
      khqrAccountId: 'pubstreetscooters@aclb',
      khqrMerchantName: 'Pub Street Scooters',
      khqrMerchantCity: 'Siem Reap',
      ownerEmail: 'owner@pubstreetscooters.com',
      ownerName: 'Pub Street Owner'
    }
  ]

  const shopIds: Record<string, string> = {}
  for (const s of shops) {
    const sid = id()
    shopIds[s.slug] = sid
    await pool.query(
      `INSERT INTO shops (
        id, slug, name, phone, email, address, telegram, whatsapp,
        "khqrAccountId", "khqrMerchantName", "khqrMerchantCity",
        "depositPolicy", "fuelPolicy", "lateReturnPolicy", "damagePolicy", "cancellationPolicy",
        "accidentPolicy", "trafficViolationPolicy", "helmetPolicy", "minimumAge", "requiredDocuments",
        "isActive", "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17,$18,$19,$20,$21,
        true, now()
      ) ON CONFLICT (slug) DO NOTHING`,
      [
        sid, s.slug, s.name, s.phone, s.email, s.address, s.telegram, s.whatsapp,
        s.khqrAccountId, s.khqrMerchantName, s.khqrMerchantCity,
        'A refundable deposit is collected at pickup and returned in full when the motorbike is returned undamaged.',
        'Motorbikes are provided with a full tank. Please return with a full tank or a small refueling fee will apply.',
        'A grace period of 1 hour is allowed. Late returns beyond that are charged at the hourly-equivalent daily rate.',
        'Renters are responsible for damage beyond normal wear and tear, assessed against the deposit at return.',
        'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours forfeit the deposit.',
        'In case of an accident, contact us immediately. Our team will assist with the appropriate local authorities and insurance process.',
        'Any traffic fines incurred during the rental period are the responsibility of the renter.',
        'One helmet is included free with every rental; additional helmets available on request.',
        18,
        'A valid ID or passport is required at pickup. An international driving permit is recommended.'
      ]
    )

    // Owner (shop-level ADMIN) account for this shop.
    const passwordHash = await bcrypt.hash('Owner123!', 10)
    await pool.query(
      `INSERT INTO users (id, email, password, name, role, "shopId", "isActive", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,'ADMIN',$5,true, now(), now())
       ON CONFLICT (email) DO NOTHING`,
      [id(), s.ownerEmail, passwordHash, s.ownerName, sid]
    )

    // One pickup/delivery location per shop.
    await pool.query(
      `INSERT INTO locations (id, "shopId", name, address, description, "openingTime", "closingTime", "isActive", "sortOrder")
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,0) ON CONFLICT DO NOTHING`,
      [id(), sid, `${s.name} Shop`, s.address, null, '07:00', '20:00']
    )
    await pool.query(
      `INSERT INTO locations (id, "shopId", name, address, description, "openingTime", "closingTime", "isActive", "sortOrder")
       VALUES ($1,$2,'Hotel Delivery',$3,$4,$5,$6,true,1) ON CONFLICT DO NOTHING`,
      [id(), sid, 'Delivered to any hotel within Siem Reap town', null, '07:00', '19:00']
    )
  }

  // ── Motorbikes (split across the two shops) ─────────
  const placeholderImages = [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200',
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200',
    'https://images.unsplash.com/photo-1571646750134-a02fb50c1b23?w=1200',
    'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=1200'
  ]

  const motorbikes = [
    { name: 'Honda Dream', brand: 'Honda', model: 'Dream 110', cc: 110, trans: 'SEMI_AUTOMATIC', category: 'manual', daily: 8, weekly: 50, monthly: 160, featured: true, popular: true, shop: 'angkor-wheels-rental' },
    { name: 'Honda Click', brand: 'Honda', model: 'Click 125i', cc: 125, trans: 'AUTOMATIC', category: 'scooter', daily: 12, weekly: 75, monthly: 260, featured: true, popular: true, shop: 'angkor-wheels-rental' },
    { name: 'Honda Scoopy', brand: 'Honda', model: 'Scoopy i', cc: 110, trans: 'AUTOMATIC', category: 'scooter', daily: 12, weekly: 75, monthly: 260, featured: true, popular: false, shop: 'angkor-wheels-rental' },
    { name: 'Honda ADV', brand: 'Honda', model: 'ADV 160', cc: 160, trans: 'AUTOMATIC', category: 'premium', daily: 20, weekly: 130, monthly: 480, featured: true, popular: true, shop: 'angkor-wheels-rental' },
    { name: 'Honda Wave', brand: 'Honda', model: 'Wave 110', cc: 110, trans: 'SEMI_AUTOMATIC', category: 'manual', daily: 8, weekly: 50, monthly: 160, featured: false, popular: false, shop: 'angkor-wheels-rental' },
    { name: 'Honda PCX', brand: 'Honda', model: 'PCX 160', cc: 160, trans: 'AUTOMATIC', category: 'premium', daily: 18, weekly: 115, monthly: 420, featured: false, popular: true, shop: 'angkor-wheels-rental' },
    { name: 'Yamaha NMAX', brand: 'Yamaha', model: 'NMAX 155', cc: 155, trans: 'AUTOMATIC', category: 'premium', daily: 18, weekly: 115, monthly: 420, featured: false, popular: false, shop: 'pub-street-scooters' },
    { name: 'Yamaha Aerox', brand: 'Yamaha', model: 'Aerox 155', cc: 155, trans: 'AUTOMATIC', category: 'scooter', daily: 15, weekly: 95, monthly: 340, featured: false, popular: false, shop: 'pub-street-scooters' },
    { name: 'Yamaha Fino', brand: 'Yamaha', model: 'Fino 125', cc: 125, trans: 'AUTOMATIC', category: 'scooter', daily: 10, weekly: 62, monthly: 210, featured: false, popular: false, shop: 'pub-street-scooters' },
    { name: 'Suzuki Address', brand: 'Suzuki', model: 'Address 110', cc: 110, trans: 'AUTOMATIC', category: 'scooter', daily: 9, weekly: 56, monthly: 190, featured: false, popular: false, shop: 'pub-street-scooters' },
    { name: 'Honda XR150L', brand: 'Honda', model: 'XR150L', cc: 150, trans: 'MANUAL', category: 'manual', daily: 16, weekly: 100, monthly: 380, featured: false, popular: false, shop: 'pub-street-scooters' },
    { name: 'Honda CRF300L', brand: 'Honda', model: 'CRF300L', cc: 300, trans: 'MANUAL', category: 'premium', daily: 28, weekly: 175, monthly: 640, featured: false, popular: false, shop: 'pub-street-scooters' }
  ]

  for (const [i, m] of motorbikes.entries()) {
    const mid = id()
    const slug = `${m.brand.toLowerCase()}-${m.model.toLowerCase().replace(/\s+/g, '-')}`
    await pool.query(
      `INSERT INTO motorbikes (
        id, "shopId", name, slug, brand, model, year, "engineCc", "categoryId", transmission, "fuelType",
        "seatCapacity", description, status, featured, popular, "helmetIncluded", "goodForCity", "goodForLongTrip",
        "dailyPrice", "weeklyPrice", "monthlyPrice", deposit, "deliveryFee", "minRentalDays", "maxRentalDays",
        "createdAt", "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'GASOLINE',
        2,$11,'AVAILABLE',$12,$13,true,true,$14,
        $15,$16,$17,50,3,1,60, now(), now()
      ) ON CONFLICT (slug) DO NOTHING`,
      [
        mid, shopIds[m.shop], m.name, slug, m.brand, m.model, 2022 + (i % 4), m.cc, categoryIds[m.category], m.trans,
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

  // ── FAQs (platform-wide) ─────────────────────────────
  const faqs = [
    { q: 'Do I need a driving license to rent a motorbike?', a: 'An international driving permit or a valid motorbike license from your home country is recommended. For scooters under 125cc, many renters do not require a license, but we strongly recommend having valid documentation for your own safety and insurance coverage.' },
    { q: 'Do you provide helmets?', a: 'Yes — every rental includes one free helmet. Additional helmets are available on request at no extra cost, subject to availability.' },
    { q: 'Can I rent a motorbike for one month?', a: 'Absolutely. We offer discounted monthly rates on most models — just select your dates on the motorbike page and the monthly price will apply automatically for rentals of 30 days or more.' },
    { q: 'Can you deliver the motorbike to my hotel?', a: 'Yes, most of our shops offer hotel delivery and pickup throughout Siem Reap town for a small delivery fee, which varies by location and is shown at checkout.' },
    { q: 'What happens if the motorbike breaks down?', a: 'Contact the shop you booked with immediately via Telegram/WhatsApp. They provide roadside support and will arrange a replacement motorbike or repair as quickly as possible at no extra cost, provided the issue was not caused by misuse.' },
    { q: 'Is a deposit required?', a: 'A refundable deposit is required for most motorbikes, shown on each motorbike’s detail page. This is returned in full when the motorbike is returned in its original condition.' }
  ]
  for (const [i, f] of faqs.entries()) {
    await pool.query(
      `INSERT INTO faqs (id, question, answer, "sortOrder", "isActive", "createdAt") VALUES ($1,$2,$3,$4,true, now())`,
      [id(), f.q, f.a, i]
    )
  }

  // ── Platform-wide branding ───────────────────────────
  await pool.query(
    `INSERT INTO business_settings (
      id, "businessName", description, facebook, instagram,
      "heroTitle", "heroSubtitle", "aboutTitle", "aboutDescription", "aboutStory", "aboutMission", "aboutWhyChooseUs",
      "footerText", "updatedAt"
    ) VALUES (
      'main', 'Siem Reap Wheels',
      'Siem Reap''s marketplace for trusted local motorbike rental shops — compare bikes and book direct from independent shops around town.',
      'https://facebook.com/siemreapwheels', 'https://instagram.com/siemreapwheels',
      'Explore Siem Reap on Two Wheels', 'Compare motorbikes from trusted local shops in Siem Reap, Cambodia.',
      'About Siem Reap Wheels',
      'We connect travelers with well-reviewed, independently owned motorbike rental shops across Siem Reap.',
      'Siem Reap Wheels started as a way to help travelers find honest, well-maintained motorbikes without having to shop around town in person.',
      'To make independent exploration of Siem Reap safe, easy, and affordable for every traveler.',
      'Compare multiple local shops in one place, transparent pricing, and direct booking with the shop that has your bike.',
      'Siem Reap Wheels — your marketplace for motorbike rental in Siem Reap.',
      now()
    ) ON CONFLICT (id) DO NOTHING`
  )

  // ── Banner ──────────────────────────────────────────
  await pool.query(
    `INSERT INTO banners (id, title, subtitle, "imageUrl", "buttonText", "buttonUrl", "isActive", "sortOrder", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,true,0, now())`,
    [
      id(),
      'Compare bikes from multiple local shops',
      'Browse motorbikes from trusted Siem Reap shops and book directly with the one that has your bike.',
      'https://images.unsplash.com/photo-1596178060810-72660ee8d859?w=1600',
      'Browse Motorbikes',
      '/motorbikes'
    ]
  )

  // ── Platform super admin ─────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 10)
  await pool.query(
    `INSERT INTO users (id, email, password, name, role, "shopId", "isActive", "createdAt", "updatedAt")
     VALUES ($1,'admin@siemreapwheels.com',$2,'Platform Admin','SUPER_ADMIN',NULL,true, now(), now())
     ON CONFLICT (email) DO NOTHING`,
    [id(), passwordHash]
  )

  console.log('Seed complete.')
  console.log('Platform super admin login: admin@siemreapwheels.com / Admin123!')
  console.log('Angkor Wheels Rental owner login: owner@angkorwheels.com / Owner123!')
  console.log('Pub Street Scooters owner login: owner@pubstreetscooters.com / Owner123!')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => pool.end())
