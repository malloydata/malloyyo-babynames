// @ts-nocheck
// Name explorer — headline numbers for one name, where it's most concentrated
// per-capita (ranked states), and how it trends over time. Full React/JS: pulls
// three flat queries (name_explorer / name_by_state / name_over_time) via
// useQuery and draws Vega-Lite. No Malloy renderer / <Panel>. The animated
// choropleth version of the geographic view lives in the `time-series`
// dashboard; here a ranked bar reads the "which states" question more directly.
//
// The little viz "kit" below (theme tokens, responsive width, palette, chart
// chrome, Card/Figure/StatTile) is copied across the dashboards on purpose —
// jsx components are sandboxed (only React + @malloyyo/dashboard import), so
// there is no shared local module to import.
import React from "react";
import { Controls, Search, VegaChart, useQuery } from "@malloyyo/dashboard";

/* ============================ shared viz kit ============================ */
const SERIES = {
  light: { F: "#e87ba4", M: "#2a78d6" }, // Female magenta, Male blue
  dark: { F: "#d55181", M: "#3987e5" },
};
const INK = {
  light: { surface: "#fcfcfb", grid: "#e1e0d9", axis: "#c3c2b7", muted: "#898781", text: "#0b0b0b", text2: "#52514e", bar: "#2a78d6" },
  dark: { surface: "#1a1a19", grid: "#2c2c2a", axis: "#383835", muted: "#898781", text: "#ffffff", text2: "#c3c2b7", bar: "#3987e5" },
};

function relLum(c) {
  if (!c) return null;
  c = c.trim();
  let r, g, b, m;
  if ((m = c.match(/^#([0-9a-f]{3})$/i))) { const h = m[1]; r = parseInt(h[0] + h[0], 16); g = parseInt(h[1] + h[1], 16); b = parseInt(h[2] + h[2], 16); }
  else if ((m = c.match(/^#([0-9a-f]{6})$/i))) { const h = m[1]; r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16); }
  else if ((m = c.match(/rgba?\(([^)]+)\)/i))) { const p = m[1].split(",").map((x) => parseFloat(x)); [r, g, b] = p; }
  else return null;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function useTheme() {
  const [dark, setDark] = React.useState(false);
  React.useLayoutEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.body || document.documentElement);
      const lum = relLum(cs.getPropertyValue("--dash-fg"));
      setDark(lum != null ? lum > 0.5 : window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    return () => { mq.removeEventListener("change", read); obs.disconnect(); };
  }, []);
  return { dark, ink: dark ? INK.dark : INK.light, series: dark ? SERIES.dark : SERIES.light };
}

function useWidth(fallback) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(fallback);
  React.useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0].contentRect.width;
      if (cw > 0) setW(Math.round(cw));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function vegaConfig(ink) {
  return {
    background: "transparent",
    font: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    axis: {
      labelColor: ink.muted, titleColor: ink.text2, titleFontWeight: 500,
      gridColor: ink.grid, domainColor: ink.axis, tickColor: ink.axis,
      labelFontSize: 11, titleFontSize: 12, titlePadding: 8,
    },
    legend: { labelColor: ink.text2, titleColor: ink.text2, symbolType: "stroke", labelFontSize: 12 },
    view: { stroke: "transparent" },
  };
}

const num = (x) => (x == null || x === "" ? 0 : +x);

function Card({ ink, children, style }) {
  return (
    <div style={{
      background: ink.surface, border: "1px solid var(--dash-border)",
      borderRadius: "var(--dash-radius, 10px)", padding: 16, ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ ink, children, note }) {
  return (
    <div style={{ margin: "0 0 12px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.2, color: ink.text }}>{children}</div>
      {note && <div style={{ fontSize: 12, color: ink.muted, marginTop: 2 }}>{note}</div>}
    </div>
  );
}

// A chart card that measures its own width so charts fill their column.
function Figure({ ink, title, note, height, data, buildSpec }) {
  const [ref, w] = useWidth(640);
  return (
    <Card ink={ink}>
      {title && <SectionTitle ink={ink} note={note}>{title}</SectionTitle>}
      <div ref={ref}>
        <VegaChart spec={buildSpec(Math.max(w - 32, 260), height)} data={data} />
      </div>
    </Card>
  );
}

function StatTile({ ink, label, value, sub }) {
  return (
    <Card ink={ink} style={{ flex: "1 1 150px", minWidth: 140 }}>
      <div style={{ fontSize: 12, color: ink.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.05, color: ink.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: ink.text2, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

// Horizontal ranked bars (single-hue magnitude ranking).
function barSpec({ width, height, ink, xField, yField, xTitle, valueTitle, extraTip }) {
  return {
    width, height, background: "transparent", config: vegaConfig(ink),
    mark: { type: "bar", cornerRadiusEnd: 4, color: ink.bar, height: { band: 0.72 } },
    encoding: {
      y: { field: yField, type: "nominal", sort: "-x", axis: { title: null, labelFontWeight: 500, labelColor: ink.text2 } },
      x: { field: xField, type: "quantitative", axis: { title: xTitle, format: "~s", grid: true, gridDash: [2, 3] } },
      tooltip: [
        { field: yField, type: "nominal", title: "State" },
        { field: xField, type: "quantitative", title: valueTitle, format: ",.0f" },
        ...(extraTip || []),
      ],
    },
  };
}

// Layered gender line + invisible nearest-point hover layer carrying the tooltip.
function genderLineSpec({ width, height, ink, series, yField, yTitle }) {
  return {
    width, height, background: "transparent", config: vegaConfig(ink),
    encoding: {
      x: { field: "birth_year", type: "quantitative", scale: { nice: false },
           axis: { title: null, format: "d", grid: false, tickCount: 8 } },
      y: { field: yField, type: "quantitative",
           axis: { title: yTitle, format: "~s", grid: true, gridDash: [2, 3] } },
      color: { field: "gender", type: "nominal",
               scale: { domain: ["F", "M"], range: [series.F, series.M] },
               legend: { title: null, orient: "top", offset: 4,
                         labelExpr: "datum.label === 'F' ? 'Female' : 'Male'" } },
    },
    layer: [
      { mark: { type: "line", strokeWidth: 2, interpolate: "monotone" } },
      {
        params: [{ name: "hover", select: { type: "point", fields: ["birth_year"], nearest: true, on: "pointerover", clear: "pointerout" } }],
        mark: { type: "point", size: 55, filled: true },
        encoding: {
          opacity: { condition: { param: "hover", empty: false, value: 1 }, value: 0 },
          tooltip: [
            { field: "birth_year", title: "Year", format: "d" },
            { field: "gender", title: "Sex", type: "nominal" },
            { field: yField, title: "Births", format: "," },
          ],
        },
      },
    ],
  };
}
/* ========================== end shared viz kit ========================= */

export default function Dashboard({ dashboard, givens }) {
  const { ink, series } = useTheme();
  const tiles = useQuery({ query: "name_explorer", givens });
  const byState = useQuery({ query: "name_by_state", givens });
  const overTime = useQuery({ query: "name_over_time", givens });

  const stat = (tiles.rows && tiles.rows[0]) || null;
  const topStates = React.useMemo(
    () => (byState.rows || [])
      .map((r) => ({ state: r.state, per_100k: num(r.per_100k), babies_named: num(r.babies_named) }))
      .slice(0, 15),
    [byState.rows]
  );
  const timeRows = React.useMemo(
    () => (overTime.rows || []).map((r) => ({ birth_year: r.birth_year, gender: r.gender, babies_named: num(r.babies_named) })),
    [overTime.rows]
  );

  const pctMale = stat ? Math.round(num(stat.percent_male) * 100) : null;
  const anyLoading = tiles.loading || byState.loading || overTime.loading;
  const err = tiles.error || byState.error || overTime.error;
  const hasData = stat && num(stat.total_births) > 0;

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: 24, color: "var(--dash-fg)" }}>
      <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>{dashboard.title}</h1>
      <p style={{ color: "var(--dash-muted)", margin: "0 0 20px", lineHeight: 1.5 }}>
        Pick a name for its headline numbers, the states where it&rsquo;s most{" "}
        <strong>concentrated per-capita</strong> (births with the name per 100,000 births
        in each state, which normalizes for state size), and how it{" "}
        <strong>trends over time</strong>. The filter takes alternatives
        (<code>Emma, Olivia</code>) and wildcards (<code>Em%</code>) too.
      </p>

      <Controls>
        <Search given="NAME" placeholder="Type a name, press Enter" />
      </Controls>

      {err ? (
        <Card ink={ink} style={{ marginTop: 8 }}><div style={{ color: "var(--dash-danger)" }}>{String(err)}</div></Card>
      ) : anyLoading && !stat ? (
        <Card ink={ink} style={{ marginTop: 8 }}><div style={{ color: ink.muted }}>Loading&hellip;</div></Card>
      ) : !hasData ? (
        <Card ink={ink} style={{ marginTop: 8 }}><div style={{ color: ink.muted }}>No data for that name &mdash; try another.</div></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatTile ink={ink} label="Total births (all years)" value={num(stat.total_births).toLocaleString()} />
            <StatTile ink={ink} label="National rank" value={stat.overall_rank == null ? "—" : `#${stat.overall_rank}`} sub="across all names, all years" />
            <StatTile ink={ink} label="Boys / girls" value={pctMale == null ? "—" : `${pctMale}% / ${100 - pctMale}%`} sub="share of babies with the name" />
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))" }}>
            <Figure
              ink={ink}
              title="Most concentrated states"
              note="Top 15 by births with the name per 100,000 births"
              height={topStates.length * 22 + 30}
              data={topStates}
              buildSpec={(w, h) => barSpec({
                width: w, height: h, ink,
                yField: "state", xField: "per_100k",
                xTitle: "Per 100,000 births", valueTitle: "Per 100K",
                extraTip: [{ field: "babies_named", type: "quantitative", title: "Babies", format: "," }],
              })}
            />
            <Figure
              ink={ink}
              title="Popularity over time"
              note="Births per year, male / female"
              height={topStates.length * 22 + 30}
              data={timeRows}
              buildSpec={(w, h) => genderLineSpec({ width: w, height: h, ink, series, yField: "babies_named", yTitle: "Births / year" })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
