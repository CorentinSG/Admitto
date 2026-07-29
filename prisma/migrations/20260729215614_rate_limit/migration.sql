-- CreateTable
CREATE TABLE "RateLimitHit" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimitHit_scope_key_at_idx" ON "RateLimitHit"("scope", "key", "at");

-- CreateIndex
CREATE INDEX "RateLimitHit_at_idx" ON "RateLimitHit"("at");
