import { requireWorkspaceRole, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  // Gate the whole page on ADMIN+ - Owners/Admins only, enforced server-side.
  const { profile, membership, workspace } = await requireWorkspaceRole(workspaceSlug, "ADMIN");
  const memberships = await listMembershipsForProfile(profile.id);

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Settings">
      <section className="hero">
        <h1>Workspace settings</h1>
        <p>Only Owners and Admins can update these details.</p>
      </section>
      <div className="card" style={{ maxWidth: 520, marginBottom: 16 }}>
        <div className="row" style={{ borderTop: "none", paddingTop: 0, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div className="label">Your role</div>
            <strong>{membership.role}</strong>
          </div>
          <div>
            <div className="label">Workspace ID</div>
            <span className="small">{workspace.id}</span>
          </div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 520 }}>
        <SettingsForm workspace={workspace} />
      </div>
    </WorkspaceShell>
  );
}
