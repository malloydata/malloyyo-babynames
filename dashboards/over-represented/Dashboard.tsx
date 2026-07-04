// @ts-nocheck
// Over- / under-represented baby names dashboard.
//
// Props come from the host runtime — no data libs, no fetch, no credentials:
//   manifest  — this dashboard's manifest.json
//   givens    — current filter values, e.g. { STATE: "HI", DECADE_START: 1990, ... }
//   setGiven  — (name, value) => void, to change a filter (re-runs the Panel)
//   Panel     — <Panel givens={givens} /> runs manifest.query and renders it
import React from "react";

export default function Dashboard({ manifest, givens, setGiven, Panel }) {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: 24,
        maxWidth: 860,
        margin: "0 auto",
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{manifest.title}</h1>
      <p style={{ color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
        Each name&rsquo;s share of births in <strong>{givens.STATE}</strong> (
        {givens.DECADE_START}&ndash;{givens.DECADE_END}) compared with its share
        nationally. <code>overrep_index</code> above 100 means the name is more
        concentrated in the state than in the country as a whole; below 100 means
        under-represented. Ranked most over-represented first.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
          padding: "12px 16px",
          background: "#f6f7f9",
          borderRadius: 8,
        }}
      >
        {manifest.givens.map((g) => (
          <label key={g.name} style={{ fontSize: 13 }}>
            <div style={{ color: "#888", marginBottom: 4 }}>{g.label ?? g.name}</div>
            <select
              value={givens[g.name]}
              onChange={(e) =>
                setGiven(
                  g.name,
                  g.type === "number" ? Number(e.target.value) : e.target.value
                )
              }
              style={{
                fontSize: 14,
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "white",
              }}
            >
              {g.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <Panel givens={givens} />
    </div>
  );
}
