-- AlterTable: extend the ProjectStatus enum with ON_HOLD (kept in the
-- declared position, after ACTIVE).
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'ON_HOLD' AFTER 'ACTIVE';
