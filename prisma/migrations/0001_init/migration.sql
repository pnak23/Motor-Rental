-- Initial schema for Motorbike Rental Management System (Siem Reap)
-- Mirrors prisma/schema.prisma exactly.

-- ── ENUMS ─────────────────────────────────────────────
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF');
CREATE TYPE "Transmission" AS ENUM ('AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC');
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'ELECTRIC');
CREATE TYPE "MotorbikeStatus" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'REJECTED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');
CREATE TYPE "PricingRuleType" AS ENUM ('STANDARD', 'WEEKEND', 'HOLIDAY', 'PROMOTION', 'LONG_TERM');
CREATE TYPE "MaintenanceType" AS ENUM ('OIL_CHANGE', 'TIRE', 'BRAKE', 'ENGINE', 'BATTERY', 'GENERAL_SERVICE', 'ACCIDENT_REPAIR');
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

-- ── USERS ─────────────────────────────────────────────
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'STAFF',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CATEGORIES ────────────────────────────────────────
CREATE TABLE "motorbike_categories" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT
);

-- ── MOTORBIKES ────────────────────────────────────────
CREATE TABLE "motorbikes" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "year" INTEGER,
  "engineCc" INTEGER NOT NULL,
  "plateNumber" TEXT,
  "color" TEXT,
  "categoryId" TEXT REFERENCES "motorbike_categories"("id") ON DELETE SET NULL,
  "transmission" "Transmission" NOT NULL DEFAULT 'AUTOMATIC',
  "fuelType" "FuelType" NOT NULL DEFAULT 'GASOLINE',
  "seatCapacity" INTEGER,
  "fuelConsumption" TEXT,
  "description" TEXT,
  "status" "MotorbikeStatus" NOT NULL DEFAULT 'AVAILABLE',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "helmetIncluded" BOOLEAN NOT NULL DEFAULT true,
  "phoneHolder" BOOLEAN NOT NULL DEFAULT false,
  "usbCharger" BOOLEAN NOT NULL DEFAULT false,
  "goodForCity" BOOLEAN NOT NULL DEFAULT true,
  "goodForLongTrip" BOOLEAN NOT NULL DEFAULT false,
  "isNewBike" BOOLEAN NOT NULL DEFAULT false,
  "popular" BOOLEAN NOT NULL DEFAULT false,
  "dailyPrice" NUMERIC(10,2) NOT NULL,
  "weeklyPrice" NUMERIC(10,2),
  "monthlyPrice" NUMERIC(10,2),
  "deposit" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "deliveryFee" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "minRentalDays" INTEGER NOT NULL DEFAULT 1,
  "maxRentalDays" INTEGER NOT NULL DEFAULT 60,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "seoKeywords" TEXT,
  "ogImage" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "motorbikes_slug_idx" ON "motorbikes"("slug");
CREATE INDEX "motorbikes_status_idx" ON "motorbikes"("status");

-- ── MOTORBIKE IMAGES ──────────────────────────────────
CREATE TABLE "motorbike_images" (
  "id" TEXT PRIMARY KEY,
  "motorbikeId" TEXT NOT NULL REFERENCES "motorbikes"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "mimeType" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "motorbike_images_motorbikeId_idx" ON "motorbike_images"("motorbikeId");

-- ── PRICING RULES ─────────────────────────────────────
CREATE TABLE "pricing_rules" (
  "id" TEXT PRIMARY KEY,
  "motorbikeId" TEXT REFERENCES "motorbikes"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" "PricingRuleType" NOT NULL DEFAULT 'STANDARD',
  "minDays" INTEGER NOT NULL,
  "maxDays" INTEGER,
  "pricePerDay" NUMERIC(10,2) NOT NULL,
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "pricing_rules_motorbikeId_idx" ON "pricing_rules"("motorbikeId");

-- ── LOCATIONS ─────────────────────────────────────────
CREATE TABLE "locations" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "description" TEXT,
  "googleMapsUrl" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "phone" TEXT,
  "openingTime" TEXT,
  "closingTime" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- ── CUSTOMERS ─────────────────────────────────────────
CREATE TABLE "customers" (
  "id" TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "nationality" TEXT,
  "passportId" TEXT,
  "telegram" TEXT,
  "whatsapp" TEXT,
  "notes" TEXT,
  "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- ── BOOKINGS ──────────────────────────────────────────
CREATE TABLE "bookings" (
  "id" TEXT PRIMARY KEY,
  "bookingNumber" TEXT UNIQUE NOT NULL,
  "motorbikeId" TEXT NOT NULL REFERENCES "motorbikes"("id"),
  "customerId" TEXT NOT NULL REFERENCES "customers"("id"),
  "pickupDate" TIMESTAMPTZ NOT NULL,
  "returnDate" TIMESTAMPTZ NOT NULL,
  "pickupLocationId" TEXT REFERENCES "locations"("id"),
  "returnLocationId" TEXT REFERENCES "locations"("id"),
  "subtotal" NUMERIC(10,2) NOT NULL,
  "discount" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "deliveryFee" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "additionalCharges" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "deposit" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "total" NUMERIC(10,2) NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "paymentMethod" TEXT,
  "paymentReference" TEXT,
  "paidAmount" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "paidAt" TIMESTAMPTZ,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "bookings_motorbikeId_idx" ON "bookings"("motorbikeId");
CREATE INDEX "bookings_pickupDate_idx" ON "bookings"("pickupDate");
CREATE INDEX "bookings_returnDate_idx" ON "bookings"("returnDate");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- ── BOOKING STATUS HISTORY ────────────────────────────
CREATE TABLE "booking_status_history" (
  "id" TEXT PRIMARY KEY,
  "bookingId" TEXT NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "status" "BookingStatus" NOT NULL,
  "note" TEXT,
  "changedById" TEXT REFERENCES "users"("id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "booking_status_history_bookingId_idx" ON "booking_status_history"("bookingId");

-- ── MAINTENANCE RECORDS ───────────────────────────────
CREATE TABLE "maintenance_records" (
  "id" TEXT PRIMARY KEY,
  "motorbikeId" TEXT NOT NULL REFERENCES "motorbikes"("id") ON DELETE CASCADE,
  "type" "MaintenanceType" NOT NULL,
  "description" TEXT,
  "date" TIMESTAMPTZ NOT NULL,
  "mileage" INTEGER,
  "cost" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "garage" TEXT,
  "notes" TEXT,
  "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "maintenance_records_motorbikeId_idx" ON "maintenance_records"("motorbikeId");

-- ── BANNERS ───────────────────────────────────────────
CREATE TABLE "banners" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "imageUrl" TEXT NOT NULL,
  "buttonText" TEXT,
  "buttonUrl" TEXT,
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── FAQS ──────────────────────────────────────────────
CREATE TABLE "faqs" (
  "id" TEXT PRIMARY KEY,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CONTACT MESSAGES ──────────────────────────────────
CREATE TABLE "contact_messages" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── BUSINESS SETTINGS (singleton) ─────────────────────
CREATE TABLE "business_settings" (
  "id" TEXT PRIMARY KEY DEFAULT 'main',
  "businessName" TEXT NOT NULL DEFAULT 'Angkor Wheels Rental',
  "logoUrl" TEXT,
  "faviconUrl" TEXT,
  "description" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "telegram" TEXT,
  "whatsapp" TEXT,
  "facebook" TEXT,
  "instagram" TEXT,
  "tiktok" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "heroTitle" TEXT NOT NULL DEFAULT 'Explore Siem Reap on Two Wheels',
  "heroSubtitle" TEXT NOT NULL DEFAULT 'Reliable motorbike rental in Siem Reap, Cambodia.',
  "heroImage" TEXT,
  "aboutTitle" TEXT,
  "aboutDescription" TEXT,
  "aboutStory" TEXT,
  "aboutMission" TEXT,
  "aboutWhyChooseUs" TEXT,
  "aboutImage" TEXT,
  "footerText" TEXT,
  "minRentalDays" INTEGER NOT NULL DEFAULT 1,
  "maxRentalDays" INTEGER NOT NULL DEFAULT 60,
  "depositPolicy" TEXT,
  "fuelPolicy" TEXT,
  "lateReturnPolicy" TEXT,
  "damagePolicy" TEXT,
  "cancellationPolicy" TEXT,
  "accidentPolicy" TEXT,
  "trafficViolationPolicy" TEXT,
  "helmetPolicy" TEXT,
  "minimumAge" INTEGER DEFAULT 18,
  "requiredDocuments" TEXT,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── AUDIT LOGS ────────────────────────────────────────
CREATE TABLE "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "users"("id"),
  "action" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "description" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
