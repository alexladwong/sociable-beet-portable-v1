-- Editorial workflow: extend SocialPostStatus + editorial fields/tables
ALTER TYPE "SocialPostStatus" ADD VALUE IF NOT EXISTS 'IN_REVIEW';
ALTER TYPE "SocialPostStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TABLE "SocialPost" ADD COLUMN IF NOT EXISTS "authorProfileId" TEXT;
ALTER TABLE "SocialPost" ADD COLUMN IF NOT EXISTS "reviewerProfileId" TEXT;
ALTER TABLE "SocialPost" ADD COLUMN IF NOT EXISTS "approverProfileId" TEXT;
CREATE TABLE IF NOT EXISTS "SocialPostEvent" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "actorProfileId" TEXT,
  "action" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialPostEvent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "SocialComment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "authorProfileId" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialComment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SocialPost_workspaceId_idx" ON "SocialPost"("workspaceId");
CREATE INDEX IF NOT EXISTS "SocialPostEvent_postId_idx" ON "SocialPostEvent"("postId");
CREATE INDEX IF NOT EXISTS "SocialComment_postId_idx" ON "SocialComment"("postId");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='SocialPost_authorProfileId_fkey') THEN
    ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='SocialPost_reviewerProfileId_fkey') THEN
    ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_reviewerProfileId_fkey" FOREIGN KEY ("reviewerProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='SocialPost_approverProfileId_fkey') THEN
    ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_approverProfileId_fkey" FOREIGN KEY ("approverProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='SocialPostEvent_postId_fkey') THEN
    ALTER TABLE "SocialPostEvent" ADD CONSTRAINT "SocialPostEvent_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='SocialPostEvent_actorProfileId_fkey') THEN
    ALTER TABLE "SocialPostEvent" ADD CONSTRAINT "SocialPostEvent_actorProfileId_fkey" FOREIGN KEY ("actorProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='SocialComment_postId_fkey') THEN
    ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='SocialComment_authorProfileId_fkey') THEN
    ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
