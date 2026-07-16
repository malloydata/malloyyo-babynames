// @ts-nocheck
// Name explorer — the `# artifact` tag on `name_report` declares this
// dashboard; $NAME's declaration (filter<string> with a # suggest tag)
// declares the control, so <Search given="NAME"/> gets server-side typeahead
// for free. This file adds intro copy around it.
import React from "react";
import { Controls, Search, Panel } from "@malloyyo/dashboard";

export default function Dashboard({ dashboard, givens }) {
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
      <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{dashboard.title}</h1>
      <p style={{ color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
        Pick a name to see <strong>where it&rsquo;s most concentrated per-capita</strong>{" "}
        (map colored by births with the name per 100,000 births in each state — this
        normalizes for state size) and <strong>how it trends over time</strong>. The
        filter takes alternatives (<code>Emma, Olivia</code>) and wildcards (<code>Em%</code>) too.
      </p>

      <Controls>
        <Search given="NAME" placeholder="Type a name, press Enter" />
      </Controls>

      <Panel givens={givens} />
    </div>
  );
}

