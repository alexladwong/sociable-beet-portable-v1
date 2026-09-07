import "server-only";

import { prisma } from "@/lib/prisma";
import type { UpcomingItem, UpcomingKind } from "@/lib/upcoming-types";

export type CalendarFilters = {
  projects?: boolean;
  tasks?: boolean;
  posts?: boolean;
};

export type CalendarBucket = "month" | "week" | "agenda";

/**
 * Derives calendar events from the real project/task/social records of one
 * workspace - no separate calendar table. Every query is workspace-scoped.
 * Hrefs point back at the source object's UI route; social posts have no
 * detail route yet, so their href stays null rather than dead-linking.
 */
export async function getCalendarEvents(
  workspaceId: string,
  workspaceSlug: string,
  from: Date,
  to: Date,
  filters: CalendarFilters = {}
): Promise<UpcomingItem[]> {
  const showProjects = filters.projects !== false;
  const showTasks = filters.tasks !== false;
  const showPosts = filters.posts !== false;

  const events: UpcomingItem[] = [];

  if (showProjects) {
    const projects = await prisma.project.findMany({
      where: {
        workspaceId,
        dueDate: { gte: from, lte: to },
        status: { not: "ARCHIVED" },
      },
      select: { id: true, name: true, dueDate: true, status: true },
      orderBy: { dueDate: "asc" },
    });
    for (const p of projects) {
      if (!p.dueDate) continue;
      events.push({
        id: `project-${p.id}`,
        kind: "project",
        title: p.name,
        date: p.dueDate,
        href: `/workspace/${workspaceSlug}/projects/${p.id}`,
        meta: p.status,
      });
    }
  }

  if (showTasks) {
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: { gte: from, lte: to },
        status: { not: "COMPLETED" },
        project: { workspaceId },
      },
      select: { id: true, title: true, dueDate: true, status: true, projectId: true },
      orderBy: { dueDate: "asc" },
    });
    for (const t of tasks) {
      if (!t.dueDate) continue;
      events.push({
        id: `task-${t.id}`,
        kind: "task",
        title: t.title,
        date: t.dueDate,
        href: `/workspace/${workspaceSlug}/projects/${t.projectId}?tab=tasks`,
        meta: t.status,
      });
    }
  }

  if (showPosts) {
    const posts = await prisma.socialPost.findMany({
      where: {
        workspaceId,
        status: "SCHEDULED",
        scheduledAt: { gte: from, lte: to },
      },
      select: { id: true, title: true, body: true, scheduledAt: true, type: true },
      orderBy: { scheduledAt: "asc" },
    });
    for (const s of posts) {
      if (!s.scheduledAt) continue;
      events.push({
        id: `post-${s.id}`,
        kind: "post",
        title: s.title || s.body.slice(0, 60),
        date: s.scheduledAt,
        href: null, // Social Studio UI is a later phase - no dead links
        meta: s.type,
      });
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Compact merged "what's next" feed for the dashboard Upcoming widget. */
export async function getUpcomingCalendarItems(
  workspaceId: string,
  workspaceSlug: string,
  days = 14
): Promise<UpcomingItem[]> {
  const now = new Date();
  const to = new Date(now.getTime() + days * 86400000);
  const items = await getCalendarEvents(workspaceId, workspaceSlug, now, to);
  return items.slice(0, 6);
}

export function kindLabel(kind: UpcomingKind): string {
  return kind === "project" ? "Project" : kind === "task" ? "Task" : "Post";
}
