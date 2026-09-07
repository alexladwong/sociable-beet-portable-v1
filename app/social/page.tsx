import { redirect } from "next/navigation";

// Mock-data demo page replaced by the real workspace module (see /workspace).
export default function Page() {
  redirect("/workspace");
}
