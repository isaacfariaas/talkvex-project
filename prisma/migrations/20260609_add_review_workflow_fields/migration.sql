-- AlterTable
ALTER TABLE "weekly_reviews" ADD COLUMN     "goalId" TEXT,
ADD COLUMN     "questions" JSONB,
ADD COLUMN     "answers" JSONB,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "suggestions" JSONB,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "weekly_reviews" ADD CONSTRAINT "weekly_reviews_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
