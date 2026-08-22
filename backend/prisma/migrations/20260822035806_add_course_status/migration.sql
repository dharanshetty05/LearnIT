-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE';
