import type { UpcomingItem } from "@/lib/upcoming-types";
import { kindLabel } from "@/lib/calendar";
import Link from "next/link";
import { EmptyState } from "./empty-state";

function Row({ item }: { item: UpcomingItem }) {
  const body = (
    <>
      <strong>{item.title}</strong>
      <div className="meta">
        {kindLabel(item.kind)}
        {item.meta ? ` · ${item.meta}` : ""} · {item.date.toLocaleDateString()}
      </div>
    </>
  );
  return item.href ? (
    <Link className="row row-link" href={item.href}>
      {body}
    </Link>
  ) : (
    <div className="row">{body}</div>
  );
}

export function Upcoming({ items }: { items: UpcomingItem[] }) {
  return (
    <div className="card">
      <h2 className="section-title">Upcoming</h2>
      {items.length === 0 ? (
        <EmptyState message="Nothing upcoming. Project deadlines, task due dates and scheduled posts will show up here." />
      ) : (
        items.map((item) => <Row key={`${item.kind}-${item.id}`} item={item} />)
      )}
    </div>
  );
}
