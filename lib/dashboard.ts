import "server-only";

import { prisma } from "@/lib/prisma";
import { getUpcomingCalendarItems } from "@/lib/calendar";
import type { UpcomingItem } from "@/lib/upcoming-types";

// All-real-data dashboard queries for a workspace. No fabricated rows - an
// empty result just means the corresponding UI section renders its empty
// state. Projects/Tasks/SocialPost models already existed before RBAC; this
// only reads them scoped to the given workspace.
export async function getWorkspaceDashboardData(workspaceId: string, workspaceSlug: string) {
  const now = new Date();

  const [activeProjectsCount, tasksCompletedCount, scheduledPostsCount, recentProjects, upcomingPosts, upcomingItems] =
    await Promise.all([
      prisma.project.count({
        where: { workspaceId, status: { notIn: ["ARCHIVED", "COMPLETED"] } },
      }),
      prisma.task.count({ where: { status: "COMPLETED", project: { workspaceId } } }),
      prisma.socialPost.count({ where: { workspaceId, status: "SCHEDULED" } }),
      prisma.project.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.socialPost.findMany({
        where: { workspaceId, status: "SCHEDULED", scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      getUpcomingCalendarItems(workspaceId, workspaceSlug, 14),
    ]);

  const dailyInspirationPost = upcomingPosts.find((p) => p.type === "INSPIRATION") ?? null;

  return {
    activeProjectsCount,
    tasksCompletedCount,
    scheduledPostsCount,
    recentProjects,
    upcomingPosts,
    upcomingItems: upcomingItems as UpcomingItem[],
    dailyInspirationPost,
  };
}
