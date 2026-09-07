import type { SocialPost } from "@prisma/client";
import { EmptyState } from "./empty-state";

export function DailyInspiration({ post }: { post: SocialPost | null }) {
  return (
    <div className="card social">
      <h2 className="section-title">Daily Inspiration</h2>
      {post ? (
        <>
          <blockquote>{post.body}</blockquote>
          <div className="small">
            Scheduled for {post.scheduledAt ? post.scheduledAt.toLocaleString() : "soon"}
          </div>
          {post.channels.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {post.channels.map((c) => <span className="pill" key={c}>{c}</span>)}
            </div>
          )}
          <a href="/social" className="btn" style={{ marginTop: 14, display: "inline-block" }}>
            Open Social Studio
          </a>
        </>
      ) : (
        <EmptyState
          message="No inspirational post scheduled today."
          action={{ label: "Create today's post", href: "/social" }}
        />
      )}
    </div>
  );
}
