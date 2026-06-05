-- Allow products without a description, matching the HTTP DTO.
ALTER TABLE "Product" ALTER COLUMN "description" DROP NOT NULL;

-- Add timestamps to stores.
ALTER TABLE "Store"
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Store" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Ensure one global stock record per product.
CREATE UNIQUE INDEX "GlobalStock_productId_key" ON "GlobalStock"("productId");
