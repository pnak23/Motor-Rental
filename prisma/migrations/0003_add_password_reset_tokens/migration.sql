-- Adds password reset tokens for the admin "forgot password" flow.
-- Tokens are stored hashed (SHA-256) so a leaked DB row alone can't be
-- used to reset a password; the raw token only ever exists in the
-- emailed link and the request that redeems it.
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");
