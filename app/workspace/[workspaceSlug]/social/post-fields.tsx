"use client";

import { useState } from "react";
import { POST_TYPES, SOCIAL_CHANNELS } from "./schema";

export type PostDefaults = {
  title?: string | null;
  body?: string | null;
  type?: string;
  channels?: string[];
  hashtags?: string[];
};

// Channel multi-picker -> single hidden comma-joined input consumed by the
// server action's zod schema.
export function ChannelPicker({ defaultValue = [] }: { defaultValue?: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  return (
    <div className="channels-picker" role="group" aria-label="Channels">
      <input type="hidden" name="channels" value={selected.join(",")} />
      {SOCIAL_CHANNELS.map((c) => {
        const on = selected.includes(c);
        return (
          <button
            key={c}
            type="button"
            aria-pressed={on}
            className={`channel-chip${on ? " on" : ""}`}
            onClick={() => setSelected((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

export function PostFields({ defaults = {} }: { defaults?: PostDefaults }) {
  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Type</div>
          <select name="type" defaultValue={defaults.type || "INSPIRATION"}>
            {POST_TYPES.map((t) => (
              <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Title (optional)</div>
          <input name="title" placeholder="e.g. Monday inspiration" defaultValue={defaults.title || ""} maxLength={160} />
        </div>
      </div>
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Content</div>
        <textarea name="body" rows={6} placeholder="Write the post…" defaultValue={defaults.body || ""} required minLength={5} />
      </div>
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Channels</div>
        <ChannelPicker defaultValue={defaults.channels || []} />
      </div>
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Hashtags (space or comma separated)</div>
        <input name="hashtags" placeholder="#inspiration #leadership" defaultValue={(defaults.hashtags || []).join(" ")} />
      </div>
    </>
  );
}
