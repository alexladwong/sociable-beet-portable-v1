import type { SocialPost } from "@prisma/client";
import { EmptyState } from "./empty-state";

export function Upcoming({ posts }: { posts: SocialPost[] }) {
  return (
    <div className="card">
      <h2 className="section-title">Upcoming</h2>
      {posts.length === 0 ? (
        <EmptyState message="Nothing scheduled yet. Deadlines and scheduled posts will show up here." />
      ) : (
        posts.map((post) => (
          <div className="row" key={post.id}>
            <strong>{post.title || post.body.slice(0, 40)}</strong>
            <div className="meta">
              {post.scheduledAt ? post.scheduledAt.toLocaleString() : "Unscheduled"} · {post.type}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
