// Skeleton loading primitives shared by every route-level loading.tsx.
// Theme-aware (--surface blocks + shimmer), reduced-motion safe.
export function SkeletonBlock({
  width,
  height = 14,
  radius = 8,
  style,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="sk"
      style={{ width: width ?? "100%", height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

// --- Content-area skeletons -------------------------------------------------
const contentSkeletons = {
  dashboard() {
    return (
      <>
        <div style={{ display: "grid", gap: 8 }}>
          <SkeletonBlock width="46%" height={26} />
          <SkeletonBlock width="30%" height={13} />
        </div>
        <div className="grid metrics">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="card" key={i}>
              <SkeletonBlock width="50%" height={12} />
              <SkeletonBlock width={56} height={26} style={{ marginTop: 14 }} />
            </div>
          ))}
        </div>
        <div className="grid two dash-main" style={{ marginTop: 16 }}>
          <div className="card">
            <SkeletonBlock width="30%" height={14} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="row" key={i}>
                <SkeletonBlock width="55%" height={14} />
                <SkeletonBlock width="80%" height={12} style={{ marginTop: 8 }} />
                <SkeletonBlock width="100%" height={6} radius={99} style={{ marginTop: 10 }} />
              </div>
            ))}
          </div>
          <div className="grid" style={{ gap: 16 }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div className="card" key={i}>
                <SkeletonBlock width="30%" height={14} />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div className="row" key={j}>
                    <SkeletonBlock width="70%" height={13} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  },

  projects() {
    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <SkeletonBlock width={130} height={26} />
            <SkeletonBlock width={210} height={13} />
          </div>
          <SkeletonBlock width={118} height={36} radius={9} />
        </div>
        <div className="card" style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <SkeletonBlock width="32%" height={38} radius={9} />
          <SkeletonBlock width="18%" height={38} radius={9} />
          <SkeletonBlock width="18%" height={38} radius={9} />
          <SkeletonBlock width={80} height={38} radius={9} />
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="row" key={i}>
              <SkeletonBlock width="40%" height={14} />
              <SkeletonBlock width="70%" height={12} style={{ marginTop: 7 }} />
              <SkeletonBlock width="100%" height={6} radius={99} style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      </>
    );
  },

  detail() {
    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "grid", gap: 8, flex: 1 }}>
            <SkeletonBlock width="55%" height={28} />
            <SkeletonBlock width="75%" height={13} />
          </div>
          <SkeletonBlock width={86} height={24} radius={999} />
        </div>
        <div style={{ display: "flex", gap: 4, margin: "20px 0" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} width={72} height={32} radius={8} />
          ))}
        </div>
        <section className="grid metrics">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="card" key={i}>
              <SkeletonBlock width="45%" height={12} />
              <SkeletonBlock width={70} height={22} style={{ marginTop: 12 }} />
            </div>
          ))}
        </section>
        <div className="card" style={{ marginTop: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="row" key={i}>
              <SkeletonBlock width="24%" height={13} />
              <SkeletonBlock width="38%" height={13} style={{ marginTop: 6 }} />
            </div>
          ))}
        </div>
      </>
    );
  },

  form() {
    return (
      <>
        <div style={{ display: "grid", gap: 8 }}>
          <SkeletonBlock width={150} height={26} />
          <SkeletonBlock width={220} height={13} />
        </div>
        <div className="card" style={{ marginTop: 20, maxWidth: 560, display: "grid", gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gap: 6 }}>
              <SkeletonBlock width={i % 3 === 0 ? 90 : 130} height={12} />
              <SkeletonBlock width="100%" height={i === 1 ? 84 : 40} radius={9} />
            </div>
          ))}
          <SkeletonBlock width={132} height={40} radius={9} />
        </div>
      </>
    );
  },

  list() {
    return (
      <>
        <div style={{ display: "grid", gap: 8 }}>
          <SkeletonBlock width={120} height={26} />
          <SkeletonBlock width={190} height={13} />
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="row" key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SkeletonBlock width={36} height={36} radius={999} />
              <div style={{ flex: 1, display: "grid", gap: 6 }}>
                <SkeletonBlock width="42%" height={13} />
                <SkeletonBlock width="64%" height={11} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  },
};

export type SkeletonVariant = keyof typeof contentSkeletons;

export function WorkspaceSkeleton({ variant = "dashboard" }: { variant?: SkeletonVariant }) {
  return (
    <div className="shell workspace-shell">
      <div className="ws-chrome pinned sk-chrome" aria-hidden="true">
        <div style={{ padding: "16px 12px 12px" }}>
          <SkeletonBlock width={56} height={28} radius={8} />
        </div>
        <div style={{ margin: "0 10px 12px" }}>
          <SkeletonBlock width="100%" height={40} radius={10} />
        </div>
        <div style={{ flex: 1, margin: "4px 6px", display: "grid", gap: 4, alignContent: "start" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBlock key={i} width="100%" height={38} radius={9} />
          ))}
        </div>
        <div style={{ padding: "8px" }}>
          <SkeletonBlock width="100%" height={38} radius={10} />
        </div>
      </div>
      <main className="main">
        <div className="topbar">
          <SkeletonBlock width={150} height={16} />
          <div style={{ display: "flex", gap: 8 }}>
            <SkeletonBlock width={36} height={36} radius={9} />
            <SkeletonBlock width={36} height={36} radius={9} />
            <SkeletonBlock width={36} height={36} radius={999} />
          </div>
        </div>
        <div className="content">{contentSkeletons[variant]()}</div>
      </main>
    </div>
  );
}
