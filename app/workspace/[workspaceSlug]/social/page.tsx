import { requireWorkspaceMembership, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { canManageProjects } from "@/lib/permissions/roles";
import { listWorkspacePosts } from "@/lib/social";
import type { SocialPostStatus } from "@prisma/client";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { EmptyState } from "@/components/workspace/empty-state";
import Link from "next/link";

export const dynamic = "force-dynamic";

const COLUMNS: SocialPostStatus[] = ["DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED"];
const channelShort: Record<string, string> = {
  LinkedIn: "LI", Facebook: "FB", Instagram: "IG", X: "X", Threads: "TH",
  Telegram: "TG", WhatsApp: "WA", YouTube: "YT",
};

export default async function SocialStudioPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  const { profile, membership, workspace } = await requireWorkspaceMembership(workspaceSlug);
  const [memberships, posts] = await Promise.all([
    listMembershipsForProfile(profile.id),
    listWorkspacePosts(workspace.id),
  ]);
  const canCreate = canManageProjects(membership.role) || membership.role === "MEMBER";

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Social">
      <section className="hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Social Studio</h1>
          <p>Draft, review and schedule inspirational content.</p>
        </div>
        {canCreate && (
          <Link href={`/workspace/${workspaceSlug}/social/new`} className="btn primary">New post</Link>
        )}
      </section>

      {posts.length === 0 ? (
        <div className="card" style={{ marginTop: 20 }}>
          <EmptyState
            message="No content yet. Draft your first inspirational post to start building your publishing flow."
            action={canCreate ? { label: "Create post", href: `/workspace/${workspaceSlug}/social/new` } : undefined}
          />
        </div>
      ) : (
        <div className="social-pipeline" style={{ display: "flex", gap: 12, marginTop: 20, overflowX: "auto", paddingBottom: 8 }}>
          {COLUMNS.map((status) => {
            const column = posts.filter((p) => p.status === status);
            return (
              <div className="card social-col" key={status} style={{ minWidth: 240, flex: "1 1 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="section-title" style={{ margin: 0 }}>{status.replace(/_/g, " ")}</span>
                  <span className="pill" style={{ marginRight: 0 }}>{column.length}</span>
                </div>
                {column.length === 0 ? (
                  <p className="small">Nothing here.</p>
                ) : (
                  column.map((p) => (
                    <Link key={p.id} href={`/workspace/${workspaceSlug}/social/posts/${p.id}`} className="social-card-link">
                      <strong style={{ fontSize: 13 }}>{p.title || p.body.slice(0, 48)}{!p.title && "…"}</strong>
                      <div className="small" style={{ marginTop: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.title ? p.body : ""}
                      </div>
                      <div className="meta" style={{ marginTop: 6 }}>
                        {p.type[0] + p.type.slice(1).toLowerCase()}
                        {p.author?.name ? ` · ${p.author.name}` : ""}
                        {p.scheduledAt ? ` · ${p.scheduledAt.toLocaleString()}` : ""}
                      </div>
                      {p.channels.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                          {p.channels.slice(0, 6).map((c) => (
                            <span className="channel-dot" key={c} title={c}>{channelShort[c] || c.slice(0, 2)}</span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </WorkspaceShell>
  );
}
