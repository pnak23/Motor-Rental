import { z } from 'zod'

export const transmissionEnum = z.enum(['AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC'])
export const fuelTypeEnum = z.enum(['GASOLINE', 'ELECTRIC'])
export const keyTypeEnum = z.enum(['NORMAL_KEY', 'SMART_KEY'])
export const motorbikeStatusEnum = z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE'])
export const bookingStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PICKED_UP',
  'RETURNED',
  'CANCELLED',
  'REJECTED'
])
export const paymentStatusEnum = z.enum(['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'])
/** Payment methods available in Cambodia. CASH is walk-in/admin only. */
export const paymentMethodEnum = z.enum(['KHQR', 'ABA', 'ACLEDA', 'WING', 'CARD', 'CASH'])
/** Public bookings require at least this fraction of the total upfront. */
export const REQUIRED_DEPOSIT_RATIO = 0.5

export const motorbikeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().optional().nullable(),
  engineCc: z.coerce.number().int().positive(),
  plateNumber: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  keyType: keyTypeEnum.default('NORMAL_KEY'),
  categoryId: z.string().optional().nullable(),
  transmission: transmissionEnum.default('AUTOMATIC'),
  fuelType: fuelTypeEnum.default('GASOLINE'),
  seatCapacity: z.coerce.number().int().optional().nullable(),
  fuelConsumption: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: motorbikeStatusEnum.default('AVAILABLE'),
  featured: z.coerce.boolean().default(false),
  helmetIncluded: z.coerce.boolean().default(true),
  phoneHolder: z.coerce.boolean().default(false),
  usbCharger: z.coerce.boolean().default(false),
  goodForCity: z.coerce.boolean().default(true),
  goodForLongTrip: z.coerce.boolean().default(false),
  isNewBike: z.coerce.boolean().default(false),
  popular: z.coerce.boolean().default(false),
  dailyPrice: z.coerce.number().positive(),
  weeklyPrice: z.coerce.number().positive().optional().nullable(),
  monthlyPrice: z.coerce.number().positive().optional().nullable(),
  deposit: z.coerce.number().min(0).default(0),
  deliveryFee: z.coerce.number().min(0).default(0),
  minRentalDays: z.coerce.number().int().min(1).default(1),
  maxRentalDays: z.coerce.number().int().min(1).default(60),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable()
})

export const customerIdTypeEnum = z.enum(['ID_CARD', 'PASSPORT'])

export const bookingCreateSchema = z.object({
  motorbikeId: z.string().min(1),
  pickupDate: z.string().min(1),
  returnDate: z.string().min(1),
  pickupLocationId: z.string().optional().nullable(),
  returnLocationId: z.string().optional().nullable(),
  paymentMethod: paymentMethodEnum,
  paymentReference: z.string().optional().nullable(),
  paidAmount: z.coerce.number().min(0),
  customer: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')).nullable(),
    nationality: z.string().optional().nullable(),
    idType: customerIdTypeEnum.optional().nullable(),
    passportId: z.string().optional().nullable(),
    telegram: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable()
  }),
  notes: z.string().optional().nullable()
})

/** Used when an admin creates a walk-in booking on behalf of a customer. */
export const adminBookingCreateSchema = z
  .object({
    motorbikeId: z.string().min(1),
    pickupDate: z.string().min(1),
    returnDate: z.string().min(1),
    pickupLocationId: z.string().optional().nullable(),
    returnLocationId: z.string().optional().nullable(),
    status: bookingStatusEnum.optional(),
    paymentStatus: paymentStatusEnum.optional(),
    paymentMethod: paymentMethodEnum.optional(),
    paymentReference: z.string().optional().nullable(),
    paidAmount: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).optional(),
    additionalCharges: z.coerce.number().min(0).optional(),
    deposit: z.coerce.number().min(0).optional(),
    notes: z.string().optional().nullable(),
    customerId: z.string().optional(),
    customer: z
      .object({
        fullName: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional().or(z.literal('')).nullable(),
        nationality: z.string().optional().nullable(),
        idType: customerIdTypeEnum.optional().nullable(),
        passportId: z.string().optional().nullable(),
        telegram: z.string().optional().nullable(),
        whatsapp: z.string().optional().nullable()
      })
      .optional()
  })
  .refine((d) => d.customerId || d.customer, {
    message: 'Select an existing customer or enter new customer details',
    path: ['customer']
  })

export const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().optional().nullable(),
  googleMapsUrl: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  openingTime: z.string().optional().nullable(),
  closingTime: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0)
})

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true)
})

export const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  buttonText: z.string().optional().nullable(),
  buttonUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0)
})

export const maintenanceSchema = z.object({
  motorbikeId: z.string().min(1),
  type: z.enum([
    'OIL_CHANGE',
    'TIRE',
    'BRAKE',
    'ENGINE',
    'BATTERY',
    'GENERAL_SERVICE',
    'ACCIDENT_REPAIR'
  ]),
  description: z.string().optional().nullable(),
  date: z.string().min(1),
  mileage: z.coerce.number().int().optional().nullable(),
  cost: z.coerce.number().min(0).default(0),
  garage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']).default('SCHEDULED')
})

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']).default('STAFF')
})

export const settingsSchema = z.object({
  businessName: z.string().min(1).optional(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  currency: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImage: z.string().optional().nullable(),
  aboutTitle: z.string().optional().nullable(),
  aboutDescription: z.string().optional().nullable(),
  aboutStory: z.string().optional().nullable(),
  aboutMission: z.string().optional().nullable(),
  aboutWhyChooseUs: z.string().optional().nullable(),
  aboutImage: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  minRentalDays: z.coerce.number().int().optional(),
  maxRentalDays: z.coerce.number().int().optional(),
  depositPolicy: z.string().optional().nullable(),
  fuelPolicy: z.string().optional().nullable(),
  lateReturnPolicy: z.string().optional().nullable(),
  damagePolicy: z.string().optional().nullable(),
  cancellationPolicy: z.string().optional().nullable(),
  accidentPolicy: z.string().optional().nullable(),
  trafficViolationPolicy: z.string().optional().nullable(),
  helmetPolicy: z.string().optional().nullable(),
  minimumAge: z.coerce.number().int().optional().nullable(),
  requiredDocuments: z.string().optional().nullable(),
  khqrAccountId: z.string().optional().nullable(),
  khqrMerchantName: z.string().optional().nullable(),
  khqrMerchantCity: z.string().optional().nullable(),
  khqrImageUrl: z.string().optional().nullable(),
  khqrInstructions: z.string().optional().nullable(),
  abaInstructions: z.string().optional().nullable(),
  acledaInstructions: z.string().optional().nullable(),
  wingInstructions: z.string().optional().nullable(),
  cardInstructions: z.string().optional().nullable()
})
