import Link from "next/link";
import { requireWorkspaceMembership, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { getCalendarEvents, type CalendarBucket, type CalendarFilters } from "@/lib/calendar";
import type { UpcomingItem } from "@/lib/upcoming-types";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export const dynamic = "force-dynamic";

const DAY_MS = 86400000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseDateInput(value: string | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

function monthShift(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString(undefined, { day: "numeric" });
}

function fmtLong(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function EventRow({ event, dense = false }: { event: UpcomingItem; dense?: boolean }) {
  const body = (
    <>
      <span className={`cal-kind cal-kind-${event.kind}`} />
      <span className="cal-event-title">{event.title}</span>
      {!dense && <span className="cal-event-meta">{event.meta}</span>}
    </>
  );
  return event.href ? (
    <Link href={event.href} className="cal-event">
      {body}
    </Link>
  ) : (
    <span className="cal-event" title="Scheduled content (Social Studio arrives in a later phase)">
      {body}
    </span>
  );
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{
    view?: string;
    from?: string;
    projects?: string;
    tasks?: string;
    posts?: string;
  }>;
}) {
  const { workspaceSlug } = await params;
  const sp = await searchParams;

  const { profile, membership, workspace } = await requireWorkspaceMembership(workspaceSlug);
  const memberships = await listMembershipsForProfile(profile.id);

  const view: CalendarBucket =
    sp.view === "week" || sp.view === "agenda" ? sp.view : "month";

  const filters: CalendarFilters = {
    projects: sp.projects !== "0",
    tasks: sp.tasks !== "0",
    posts: sp.posts !== "0",
  };

  const cursor = startOfDay(parseDateInput(sp.from) ?? new Date());

  // Window per view
  let from: Date;
  let to: Date;
  if (view === "month") {
    from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  } else if (view === "week") {
    from = cursor;
    to = addDays(cursor, 6);
  } else {
    from = cursor;
    to = addDays(cursor, 29);
  }
  from = startOfDay(from);
  to = startOfDay(to);

  const events = await getCalendarEvents(workspace.id, workspace.slug, from, to, filters);

  const byDay = new Map<string, UpcomingItem[]>();
  for (const e of events) {
    const k = dayKey(e.date);
    const list = byDay.get(k) ?? [];
    list.push(e);
    byDay.set(k, list);
  }

  // Navigation links keep view + filters
  const qs = (extra: Record<string, string>) =>
    new URLSearchParams({
      view,
      ...(filters.projects === false ? { projects: "0" } : {}),
      ...(filters.tasks === false ? { tasks: "0" } : {}),
      ...(filters.posts === false ? { posts: "0" } : {}),
      ...extra,
    }).toString();

  const nav = (delta: number) => {
    const next =
      view === "month"
        ? monthShift(cursor, delta)
        : view === "week"
          ? addDays(cursor, delta * 7)
          : addDays(cursor, delta * 30);
    return `/workspace/${workspaceSlug}/calendar?${qs({ from: dayKey(next) })}`;
  };

  const filterLink = (key: "projects" | "tasks" | "posts", value: boolean) =>
    `/workspace/${workspaceSlug}/calendar?${qs({ [key]: value ? "1" : "0" })}`;

  const viewLink = (v: CalendarBucket) =>
    `/workspace/${workspaceSlug}/calendar?${qs({ view: v })}`;

  const headerLabel =
    view === "month"
      ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : view === "week"
        ? `${fmtLong(from)} – ${fmtLong(to)}`
        : `${fmtLong(from)} – ${fmtLong(to)}`;

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Calendar">
      <section className="hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Calendar</h1>
          <p>Deadlines, due dates and scheduled content in one place.</p>
        </div>
        <div className="cal-toolbar">
          <a className="btn" href={nav(-1)} aria-label="Previous">
            ←
          </a>
          <Link className="btn" href={`/workspace/${workspaceSlug}/calendar`}>
            Today
          </Link>
          <a className="btn" href={nav(1)} aria-label="Next">
            →
          </a>
          <span className="cal-window">{headerLabel}</span>
        </div>
      </section>

      <div className="cal-bar" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 16 }}>
        <nav className="cal-views" aria-label="Calendar view">
          {(["month", "week", "agenda"] as const).map((v) => (
            <Link key={v} href={viewLink(v)} className={`btn${view === v ? " cal-view-active" : ""}`}>
              {v[0].toUpperCase() + v.slice(1)}
            </Link>
          ))}
        </nav>
        <div className="cal-filters" role="group" aria-label="Show">
          <Link href={filterLink("projects", !(filters.projects === false))} className={`pill cal-filter${filters.projects === false ? " off" : ""}`}>
            Projects
          </Link>
          <Link href={filterLink("tasks", !(filters.tasks === false))} className={`pill cal-filter${filters.tasks === false ? " off" : ""}`}>
            Tasks
          </Link>
          <Link href={filterLink("posts", !(filters.posts === false))} className={`pill cal-filter${filters.posts === false ? " off" : ""}`}>
            Social posts
          </Link>
        </div>
      </div>

      {view === "month" && (
        <div className="card cal-scroll">
          <div className="cal-grid">
            {WEEKDAYS.map((w) => (
              <div key={w} className="cal-weekday">{w}</div>
            ))}
            {Array.from({ length: 42 }).map((_, i) => {
              // Monday-first month grid (6 weeks)
              const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
              const offset = (first.getDay() + 6) % 7;
              const cell = addDays(first, i - offset);
              const inMonth = cell.getMonth() === cursor.getMonth();
              const isToday = dayKey(cell) === dayKey(new Date());
              const items = byDay.get(dayKey(cell)) ?? [];
              return (
                <div key={i} className={`cal-day${inMonth ? "" : " muted"}${isToday ? " today" : ""}`}>
                  <div className="cal-day-num">{fmtDay(cell)}</div>
                  <div className="cal-day-events">
                    {items.slice(0, 3).map((e) => (
                      <EventRow key={e.id} event={e} dense />
                    ))}
                    {items.length > 3 && <div className="cal-more">+{items.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="card cal-scroll">
          <div className="cal-grid">
            {WEEKDAYS.map((w) => (
              <div key={w} className="cal-weekday">{w}</div>
            ))}
            {Array.from({ length: 7 }).map((_, i) => {
              const day = addDays(from, i);
              const isToday = dayKey(day) === dayKey(new Date());
              const items = byDay.get(dayKey(day)) ?? [];
              return (
                <div key={i} className={`cal-day week${isToday ? " today" : ""}`}>
                  <div className="cal-day-num">
                    {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                  <div className="cal-day-events">
                    {items.length === 0 ? (
                      <span className="cal-none">—</span>
                    ) : (
                      items.map((e) => <EventRow key={e.id} event={e} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "agenda" && (
        <div className="card cal-agenda">
          {events.length === 0 ? (
            <p className="small" style={{ margin: 0 }}>
              Nothing scheduled in this window. Deadlines, task due dates and scheduled posts will appear here.
            </p>
          ) : (
            (() => {
              const rows: { key: string; label: string; items: UpcomingItem[] }[] = [];
              for (const e of events) {
                const k = dayKey(e.date);
                const last = rows[rows.length - 1];
                if (!last || last.key !== k) {
                  rows.push({ key: k, label: fmtLong(e.date), items: [e] });
                } else {
                  last.items.push(e);
                }
              }
              return rows.map((group) => (
                <div key={group.key} className="cal-agenda-group">
                  <div className="cal-agenda-date">{group.label}</div>
                  {group.items.map((e) => (
                    <div className="row" key={e.id}>
                      <EventRow event={e} />
                    </div>
                  ))}
                </div>
              ));
            })()
          )}
        </div>
      )}
    </WorkspaceShell>
  );
}
