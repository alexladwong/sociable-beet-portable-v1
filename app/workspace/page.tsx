import { redirect } from "next/navigation";
import { requireAuthenticatedProfile, ensureDefaultWorkspace } from "@/lib/permissions/workspace";

// Session/membership data depends on cookies, so this must render dynamically.
export const dynamic = "force-dynamic";

// Bare /workspace is an entry point, not a page: resolve the signed-in
// user's default workspace (creating one on first visit) and send them
// there. Actual dashboard content lives at /workspace/[workspaceSlug].
export default async function WorkspaceEntryPage() {
  const { profile } = await requireAuthenticatedProfile();
  const workspace = await ensureDefaultWorkspace(profile.id, profile.name || profile.email);
  redirect(`/workspace/${workspace.slug}`);
}
