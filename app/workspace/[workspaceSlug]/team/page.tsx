import {
  requireWorkspaceMembership,
  listMembershipsForProfile,
  listMembersForWorkspace,
} from "@/lib/permissions/workspace";
import { canManageMembers } from "@/lib/permissions/roles";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { UserAvatar } from "@/components/workspace/user-avatar";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const { profile, membership, workspace } = await requireWorkspaceMembership(workspaceSlug);
  const [memberships, members] = await Promise.all([
    listMembershipsForProfile(profile.id),
    listMembersForWorkspace(workspace.id),
  ]);

  const canManage = canManageMembers(membership.role);

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Team">
      <section className="hero">
        <h1>Team</h1>
        <p>Everyone with access to {workspace.name}.</p>
      </section>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            {members.length} member{members.length === 1 ? "" : "s"}
          </h2>
          {canManage && (
            <button type="button" className="btn" disabled title="Invitations are coming in a later phase">
              Invite member
            </button>
          )}
        </div>
        {members.map((m) => (
          <div
            className="row"
            key={m.id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <UserAvatar name={m.profile.name} email={m.profile.email} size={30} />
              <div>
                <strong>{m.profile.name || m.profile.email}</strong>
                <div className="meta">{m.profile.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span className="pill">{m.role}</span>
              <span className="small">Joined {m.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
