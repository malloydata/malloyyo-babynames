// @ts-nocheck
// Over-represented baby names dashboard.
//
// Props from the host runtime (no data libs / fetch / credentials here):
//   manifest  — this dashboard's manifest.json
//   givens    — current filter values, e.g. { STATE: "HI", YEAR_START: 1990, ... }
//   setGiven  — (name, value) => void, to change a filter (re-runs the Panel)
//   Panel     — <Panel givens={givens} /> runs manifest.query and renders it
import React from "react";

const RANGE_CSS = `
.yr { position: relative; width: 260px; height: 34px; }
.yr .track { position:absolute; top:15px; left:0; right:0; height:4px; border-radius:2px; background:#d5d8dd; }
.yr .fill  { position:absolute; top:15px; height:4px; border-radius:2px; background:#1a1a1a; }
.yr input[type=range] {
  position:absolute; top:6px; left:0; width:100%; height:22px; margin:0;
  -webkit-appearance:none; appearance:none; background:transparent; pointer-events:none;
}
.yr input[type=range]::-webkit-slider-thumb {
  -webkit-appearance:none; appearance:none; pointer-events:auto; cursor:pointer;
  height:18px; width:18px; border-radius:50%; background:#fff; border:2px solid #1a1a1a; box-sizing:border-box;
}
.yr input[type=range]::-moz-range-thumb {
  pointer-events:auto; cursor:pointer;
  height:18px; width:18px; border-radius:50%; background:#fff; border:2px solid #1a1a1a; box-sizing:border-box;
}
.yr input[type=range]::-moz-range-track { background:transparent; }
`;

// A single track with two thumbs. Values are committed (which re-runs the query)
// only on release, not on every drag tick. Thumbs clamp so lo <= hi.
function DualYearSlider({ min, max, lo, hi, onCommit }) {
  const [draft, setDraft] = React.useState([lo, hi]);
  React.useEffect(() => setDraft([lo, hi]), [lo, hi]);
  const [dLo, dHi] = draft;

  const pct = (v) => ((v - min) / (max - min)) * 100;
  const commit = () => onCommit(draft[0], draft[1]);

  return (
    <div>
      <style>{RANGE_CSS}</style>
      <div style={{ color: "#888", marginBottom: 6, fontSize: 13 }}>
        Years:{" "}
        <strong style={{ color: "#333" }}>
          {dLo}&ndash;{dHi}
        </strong>
      </div>
      <div className="yr">
        <div className="track" />
        <div className="fill" style={{ left: `${pct(dLo)}%`, width: `${pct(dHi) - pct(dLo)}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={dLo}
          // Keep the low thumb reachable when both sit near the top of the range.
          style={{ zIndex: dLo > (min + max) / 2 ? 5 : 3 }}
          onChange={(e) => setDraft(([, h]) => [Math.min(Number(e.target.value), h), h])}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={dHi}
          style={{ zIndex: 4 }}
          onChange={(e) => setDraft(([l]) => [l, Math.max(Number(e.target.value), l)])}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
        />
      </div>
    </div>
  );
}

export default function Dashboard({ manifest, givens, setGiven, Panel }) {
  const byName = Object.fromEntries(manifest.givens.map((g) => [g.name, g]));
  const selects = manifest.givens.filter((g) => g.control === "select");
  const yStart = byName.YEAR_START;
  const yEnd = byName.YEAR_END;

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
        Each name&rsquo;s share of births in <strong>{givens.STATE}</strong> over{" "}
        <strong>
          {givens.YEAR_START}&ndash;{givens.YEAR_END}
        </strong>{" "}
        compared with its share nationally. <code>overrep_index</code> above 100 means the
        name is more concentrated in the state than in the country as a whole. Ranked most
        over-represented first.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: 24,
          marginBottom: 20,
          padding: "14px 16px",
          background: "#f6f7f9",
          borderRadius: 8,
        }}
      >
        {selects.map((g) => (
          <label key={g.name} style={{ fontSize: 13 }}>
            <div style={{ color: "#888", marginBottom: 4 }}>{g.label ?? g.name}</div>
            <select
              value={givens[g.name]}
              onChange={(e) =>
                setGiven(g.name, g.type === "number" ? Number(e.target.value) : e.target.value)
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

        {yStart && yEnd && (
          <DualYearSlider
            min={yStart.min}
            max={yEnd.max}
            lo={givens.YEAR_START}
            hi={givens.YEAR_END}
            onCommit={(lo, hi) => {
              if (lo !== givens.YEAR_START) setGiven("YEAR_START", lo);
              if (hi !== givens.YEAR_END) setGiven("YEAR_END", hi);
            }}
          />
        )}
      </div>

      <Panel givens={givens} />
    </div>
  );
}
