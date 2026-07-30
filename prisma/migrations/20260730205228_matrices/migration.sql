-- CreateTable
CREATE TABLE "RuleRevision" (
    "ruleId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleRevision_pkey" PRIMARY KEY ("ruleId","revision")
);

-- CreateTable
CREATE TABLE "BlockRevision" (
    "key" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockRevision_pkey" PRIMARY KEY ("key","revision")
);
