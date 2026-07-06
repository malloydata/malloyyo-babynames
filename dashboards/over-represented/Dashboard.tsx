// @ts-nocheck
// Over-represented baby names — custom layout over the model's declared
// contract. The `# artifact` tag on `over_represented_names` declares this
// dashboard; the given: declarations (with # label / control / suggest /
// range_min tags) declare the filters. This file only decides presentation:
// intro copy, control order, and a custom threshold select.
import React from "react";
import { Controls, Given, Select, Panel, filters, useGiven } from "@malloyyo/dashboard";

const THRESHOLDS = [10, 20, 50, 100, 200, 500, 1000];

export default function Dashboard({ dashboard, givens }) {
  const state = useGiven("STATE");
  const years = filters.numberRange(givens.YEAR_RANGE ?? "");

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
      <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{dashboard.title}</h1>
      <p style={{ color: "#666", margin: "0 0 20px", lineHeight: 1.5 }}>
        Each name&rsquo;s share of births in <strong>{state.value}</strong>
        {years && (
          <>
            {" "}over{" "}
            <strong>
              {years.lo}&ndash;{years.hi}
            </strong>
          </>
        )}{" "}
        compared with its share nationally. <code>overrep_index</code> above 100 means the
        name is more concentrated in the state than in the country as a whole. Ranked most
        over-represented first.
      </p>

      <Controls>
        <Given name="STATE" />
        <Given name="YEAR_RANGE" />
        <Select
          given="MIN_SAMPLE"
          options={THRESHOLDS.map((n) => ({ value: filters.greaterThan(n), text: `> ${n}` }))}
        />
      </Controls>

      <Panel givens={givens} />
    </div>
  );
}
