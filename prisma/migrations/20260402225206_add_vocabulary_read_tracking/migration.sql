-- CreateTable
CREATE TABLE "vocabulary_read" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hanzi" TEXT NOT NULL,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_read_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vocabulary_read_userId_lastReadAt_idx" ON "vocabulary_read"("userId", "lastReadAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_read_userId_hanzi_key" ON "vocabulary_read"("userId", "hanzi");

-- AddForeignKey
ALTER TABLE "vocabulary_read" ADD CONSTRAINT "vocabulary_read_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
