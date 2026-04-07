-- CreateEnum
CREATE TYPE "LessonLength" AS ENUM ('short', 'medium', 'long');

-- AlterTable
ALTER TABLE "story" ADD COLUMN "lessonLength" "LessonLength";
