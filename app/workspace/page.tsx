import { auth } from "@/lib/auth/server";
import { Shell } from "@/components/shell";
import { signOutAction } from "./actions";

// Session data depends on cookies, so this page must render dynamically.
export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const { data: session } = await auth.getSession();

  return (
    <Shell title="Workspace">
      <section className="hero">
        <h1>Signed in as {session?.user?.name || session?.user?.email}</h1>
        <p>This page is protected by Neon Auth middleware (see proxy.ts) - you can only see it while signed in.</p>
      </section>
      <div className="card">
        <h2 className="section-title">Account</h2>
        <div className="row"><strong>Email</strong><div className="meta">{session?.user?.email}</div></div>
        <form action={signOutAction}>
          <button type="submit" className="btn" style={{ marginTop: 16 }}>Sign out</button>
        </form>
      </div>
    </Shell>
  );
}
