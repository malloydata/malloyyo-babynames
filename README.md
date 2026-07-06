# malloyyo-babynames

A [Malloy](https://www.malloydata.dev/) semantic model over U.S. Social Security
Administration baby-name data — and the reference example for **model-declared
dashboards** (see `docs/repo-artifacts.md` in the malloyyo repo for the design).

## Contents

- `baby_names.malloy` — the `baby_names` source: births by year, gender, name,
  and state, with derived dimensions (decade, era, region, name length) and
  measures (`total_babies`, `percent_of_population`, …), the dashboard givens,
  and three `# artifact`-tagged dashboard queries.
- `top_10_la_baby_names.malloy` — example query: top 10 names in Louisiana.
- `index.malloy` — entry point that re-exports the source, givens, and queries.
- `dashboards/` — optional custom React components (one dashboard has none —
  see below).

Data source: `https://storage.googleapis.com/malloyyo/baby_names/baby_names.parquet`

## Dashboards — declared in the model, not in JSON

There is no manifest file. A dashboard is a top-level query tagged `# artifact`;
its filters are the model's `given:` declarations (Malloy **filter expressions**,
applied with `~`), and `# tags` on those declarations drive the controls:

```malloy
given:
  # label="State" control=select suggest { source=baby_names dimension=state }
  STATE :: filter<string> is f'NY'
  # label="Years" range_min=1910 range_max=2025
  YEAR_RANGE :: filter<number> is f'[1910 to 1930]'

#" Births per year for the name, split male / female
# artifact title="Name trend"
query: name_trend is baby_names -> births_by_gender + { where: name ~ $NAME }
```

- `suggest { source=… dimension=… }` populates a control's options from the
  dimension's distinct values; because the dimension is named, typing in a
  Search control refines the options **server-side** (case-insensitive prefix).
  `suggest { query=<named_query> }` uses a curated query's first column instead.
- Filter values are expressions: `'NY'`, `'NY, CA'`, `'Em%'`, `'[1910 to 1930]'`,
  `'> 200'`. An empty expression means "no filter".
- `# artifact { … givens { X="…" } }` can set per-dashboard starting values.

The three dashboards here:

| slug | query | component |
|---|---|---|
| `over-represented` | `over_represented_names` | custom `Dashboard.tsx` (widgets + copy) |
| `name-explorer` | `name_report` | custom `Dashboard.tsx` (typeahead Search) |
| `name_trend` | `name_trend` | **none — the runtime's default UI** (tag-only dashboard) |

Custom components import from `@malloyyo/dashboard`: widgets
(`Controls`, `Given`, `Select`, `Search`, `Range`, `Checkbox`, `Panel`), hooks
(`useGiven`, `useOptions`, `useQuery`), and `filters` helpers for
building/reading filter expressions with correct escaping.

## Running

- `malloyyo dashboard dev` — preview server with hot reload.
- `malloyyo lint` — validates the tagged queries, given suggest declarations,
  and any `Dashboard.tsx`.
- Or open the folder in VS Code with the
  [Malloy extension](https://marketplace.visualstudio.com/items?itemName=malloydata.malloy-vscode),
  or use the Malloyyo MCP server configured in `.mcp.json`.
