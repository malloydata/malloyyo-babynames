# malloyyo-babynames

A [Malloy](https://www.malloydata.dev/) semantic model over U.S. Social Security
Administration baby-name data.

## Contents

- `baby_names.malloy` — the `baby_names` source: births by year, gender, name,
  and state, with derived dimensions (decade, era, region, name length) and
  measures (`total_babies`, `percent_of_population`, …) plus a couple of views.
- `top_10_la_baby_names.malloy` — example query: top 10 names in Louisiana.
- `index.malloy` — entry point that re-exports the `baby_names` source.
- `malloy-config.json` — the `duckdb` connection plus the `virtualMap` that
  supplies the data path (see below).

## Virtual source

The `baby_names` source is a **virtual source** (an experimental Malloy
feature): the model declares only the schema, and the actual table path lives in
`malloy-config.json` instead of being hardcoded in the `.malloy` file. This lets
the same model point at a different table per environment (dev / prod / test).

In `baby_names.malloy`:

```malloy
##! experimental.virtual_source
##! experimental.access_modifiers

type: baby_names_fields is {
  state :: string,
  gender :: string,
  `year` :: number,
  name :: string,
  `number` :: number
}

source: baby_names is duckdb.virtual('baby_names')::baby_names_fields
```

`duckdb.virtual('baby_names')` has no underlying table — the `type` defines the
fields. The name `baby_names` is resolved at query time by the `virtualMap` in
`malloy-config.json`:

```json
{
  "connections": { "duckdb": { "is": "duckdb" } },
  "virtualMap": {
    "duckdb": {
      "baby_names": "'https://storage.googleapis.com/malloyyo/baby_names/baby_names.parquet'"
    }
  }
}
```

The map is keyed by connection name, then by virtual name. Its value must be
**canonical SQL**, so a file/URL path is wrapped in single quotes so DuckDB reads
it as a string literal. If no mapping exists for a virtual name at query time,
the compiler errors — a virtual source has no SQL fallback.

Reference: <https://docs.malloydata.dev/documentation/experiments/virtual_sources>

Data source: `https://storage.googleapis.com/malloyyo/baby_names/baby_names.parquet`

## Running

Open the folder in VS Code with the
[Malloy extension](https://marketplace.visualstudio.com/items?itemName=malloydata.malloy-vscode),
or use the Malloyyo MCP server configured in `.mcp.json`.
