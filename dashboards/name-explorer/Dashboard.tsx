// @ts-nocheck
// Name explorer dashboard.
//
// Renders the model's `name_report` query for a single NAME given. That query
// is a `# dashboard` view with two nested, renderer-tagged views:
//   • concentration_by_state — `# shape_map`, per-capita rate (name births per
//     100k births in the state, so it accounts for state population/size)
//   • over_time              — `# line_chart`, births with the name by year,
//                              split into male / female series
// The Malloy renderer draws both — this component only supplies the NAME filter.
//
// Props from the host runtime (no data libs / fetch / credentials here):
//   manifest, givens, setGiven, Panel  (see repo dashboard guidance)
import React from "react";

export default function Dashboard({ manifest, givens, setGiven, Panel }) {
  // Local draft so we re-run the query on commit (Enter / blur / quick-pick),
  // not on every keystroke.
  const [draft, setDraft] = React.useState(givens.NAME ?? "");

  // Keep the input in sync if the given changes elsewhere.
  React.useEffect(() => {
    setDraft(givens.NAME ?? "");
  }, [givens.NAME]);

  const commit = (value) => {
    const v = (value ?? draft).trim();
    if (v && v !== givens.NAME) setGiven("NAME", v);
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{manifest.title}</h1>
      <p style={{ color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
        Pick a name to see <strong>where it&rsquo;s most concentrated per-capita</strong>{" "}
        (map colored by births with the name per 100,000 births in each state — this
        normalizes for state size) and <strong>how it trends over time</strong>.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
          padding: "12px 16px",
          background: "#f6f7f9",
          borderRadius: 8,
        }}
      >
        <label style={{ fontSize: 13 }}>
          <div style={{ color: "#888", marginBottom: 4 }}>Name</div>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
            }}
            placeholder="Type a name, press Enter"
            style={{
              fontSize: 14,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "white",
              minWidth: 200,
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 20 }} />

      <Panel givens={givens} />
    </div>
  );
}
