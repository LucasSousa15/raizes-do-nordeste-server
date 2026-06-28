-- CreateTable
CREATE TABLE "CustomerPromotion" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPromotion_customerId_promotionId_key" ON "CustomerPromotion"("customerId", "promotionId");

-- AddForeignKey
ALTER TABLE "CustomerPromotion" ADD CONSTRAINT "CustomerPromotion_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPromotion" ADD CONSTRAINT "CustomerPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
