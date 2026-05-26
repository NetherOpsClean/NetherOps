-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "memoryMb" INTEGER NOT NULL DEFAULT 1024,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "memoryCapacityMb" INTEGER NOT NULL,
    "totalDiskMb" INTEGER NOT NULL,
    "portRangeStart" INTEGER NOT NULL,
    "portRangeEnd" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "memoryLimitMb" INTEGER NOT NULL,
    "diskLimitMb" INTEGER NOT NULL,
    "allocatedPort" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "maxPlayers" INTEGER NOT NULL DEFAULT 20,
    "gameMode" TEXT NOT NULL DEFAULT 'SURVIVAL',
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',
    "pvpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "motd" TEXT NOT NULL DEFAULT 'A Minecraft Server',
    "cracked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Node_ipAddress_key" ON "Node"("ipAddress");

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
