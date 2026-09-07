import {
  requireWorkspaceMembership,
  listMembershipsForProfile,
  listMembersForWorkspace,
} from "@/lib/permissions/workspace";
import { getWorkspaceDashboardData } from "@/lib/dashboard";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { StatCard } from "@/components/workspace/stat-card";
import { RecentProjects } from "@/components/workspace/recent-projects";
import { MyTasks } from "@/components/workspace/my-tasks";
import { Upcoming } from "@/components/workspace/upcoming";
import { RecentActivity } from "@/components/workspace/recent-activity";
import { DailyInspiration } from "@/components/workspace/daily-inspiration";
import { canManageProjects } from "@/lib/permissions/roles";

// Session/membership data depends on cookies, so this must render dynamically.
export const dynamic = "force-dynamic";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { profile, membership, workspace } = await requireWorkspaceMembership(workspaceSlug);
  const [memberships, members, dashboard] = await Promise.all([
    listMembershipsForProfile(profile.id),
    listMembersForWorkspace(workspace.id),
    getWorkspaceDashboardData(workspace.id),
  ]);

  const firstName = (profile.name || profile.email).split(/\s+/)[0];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Dashboard">
      <div className="dash-welcome">
        <div>
          <h1>{greeting()}, {firstName}</h1>
          <p>Here&apos;s what&apos;s happening across your workspace.</p>
        </div>
        <div className="dash-date">{today}</div>
      </div>

      <section className="grid metrics">
        <StatCard label="Active Projects" value={dashboard.activeProjectsCount} />
        <StatCard label="Tasks Completed" value={dashboard.tasksCompletedCount} />
        <StatCard label="Team Members" value={members.length} />
        <StatCard label="Scheduled Posts" value={dashboard.scheduledPostsCount} />
      </section>

      <section className="grid two dash-main">
        <RecentProjects
          projects={dashboard.recentProjects}
          workspaceSlug={workspace.slug}
          canCreate={canManageProjects(membership.role)}
        />
        <div className="grid" style={{ gap: 16 }}>
          <MyTasks />
          <Upcoming posts={dashboard.upcomingPosts} />
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <RecentActivity />
        <DailyInspiration post={dashboard.dailyInspirationPost} />
      </section>
    </WorkspaceShell>
  );
}
