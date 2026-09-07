// Shared, framework-free types for calendar/upcoming items - importable from
// server and client modules (no "server-only" here).
export type UpcomingKind = "project" | "task" | "post";

export interface UpcomingItem {
  id: string;
  kind: UpcomingKind;
  title: string;
  /** Event date (project due / task due / post scheduled). */
  date: Date;
  /** Link back to the source object; null when no UI route exists yet. */
  href: string | null;
  /** Small context line, e.g. status or type. */
  meta: string;
}
