# malloyyo-babynames

A [Malloy](https://www.malloydata.dev/) semantic model over U.S. Social Security
Administration baby-name data.

## Contents

- `baby_names.malloy` — the `baby_names` source: births by year, gender, name,
  and state, with derived dimensions (decade, era, region, name length) and
  measures (`total_babies`, `percent_of_population`, …) plus a couple of views.
- `top_10_la_baby_names.malloy` — example query: top 10 names in Louisiana.
- `index.malloy` — entry point that re-exports the `baby_names` source.

Data source: `https://storage.googleapis.com/malloyyo/baby_names/baby_names.parquet`

## Running

Open the folder in VS Code with the
[Malloy extension](https://marketplace.visualstudio.com/items?itemName=malloydata.malloy-vscode),
or use the Malloyyo MCP server configured in `.mcp.json`.
