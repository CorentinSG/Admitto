-- CreateTable
CREATE TABLE "SchoolChoice" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partnershipId" TEXT,
    "ambition" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "applicationDeadline" TIMESTAMP(3),
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolChoice_assessmentId_idx" ON "SchoolChoice"("assessmentId");

-- AddForeignKey
ALTER TABLE "SchoolChoice" ADD CONSTRAINT "SchoolChoice_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
