import { redirect } from "next/navigation";

// The pre-auth demo shell was replaced by the authenticated workspace; the
// real dashboard lives at /workspace/<slug> (Neon Auth guards it).
export default function Home() {
  redirect("/workspace");
}
