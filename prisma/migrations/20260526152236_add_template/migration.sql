-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "softwareIdentifier" TEXT NOT NULL,
    "startupCommand" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_softwareIdentifier_key" ON "Template"("softwareIdentifier");

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
