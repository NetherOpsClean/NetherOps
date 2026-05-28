/*
  Warnings:

  - You are about to drop the column `totalDiskMb` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `diskLimitMb` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Node" DROP COLUMN "totalDiskMb";

-- AlterTable
ALTER TABLE "Server" DROP COLUMN "diskLimitMb";
