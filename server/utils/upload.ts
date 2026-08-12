import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { newId } from './db'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MAX_BYTES = 8 * 1024 * 1024 // 8MB

export interface SavedImage {
  url: string
  filename: string
  size: number
  mimeType: string
}

/**
 * Validates and saves an uploaded motorbike image, re-encoding it to an
 * optimized WebP and generating a thumbnail. Files are written under
 * public/uploads so Nuxt/Nitro serves them directly as static assets —
 * nothing about the underlying disk path is exposed to the client beyond
 * the resulting /uploads/... URL.
 */
export async function saveMotorbikeImage(
  fileBuffer: Buffer,
  originalMime: string
): Promise<SavedImage> {
  if (!ALLOWED_MIME.has(originalMime)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only JPG, PNG, and WebP images are allowed'
    })
  }
  if (fileBuffer.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'Image must be smaller than 8MB' })
  }

  const dir = join(process.cwd(), 'public', 'uploads', 'motorbikes')
  await mkdir(dir, { recursive: true })

  const id = newId()
  const filename = `${id}.webp`
  const thumbFilename = `${id}-thumb.webp`

  const optimized = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const thumbnail = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 400, height: 300, fit: 'cover' })
    .webp({ quality: 78 })
    .toBuffer()

  await writeFile(join(dir, filename), optimized)
  await writeFile(join(dir, thumbFilename), thumbnail)

  return {
    url: `/uploads/motorbikes/${filename}`,
    filename,
    size: optimized.byteLength,
    mimeType: 'image/webp'
  }
}

/**
 * Validates and saves a customer's ID card / passport photo, re-encoding it
 * to WebP like motorbike images. Kept in a separate folder since this is
 * personal, sensitive data rather than public listing imagery.
 */
export async function saveIdDocument(fileBuffer: Buffer, originalMime: string): Promise<SavedImage> {
  if (!ALLOWED_MIME.has(originalMime)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only JPG, PNG, and WebP images are allowed for the ID document'
    })
  }
  if (fileBuffer.byteLength > MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'ID document image must be smaller than 8MB' })
  }

  const dir = join(process.cwd(), 'public', 'uploads', 'documents')
  await mkdir(dir, { recursive: true })

  const id = newId()
  const filename = `${id}.webp`

  const optimized = await sharp(fileBuffer)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()

  await writeFile(join(dir, filename), optimized)

  return {
    url: `/uploads/documents/${filename}`,
    filename,
    size: optimized.byteLength,
    mimeType: 'image/webp'
  }
}
