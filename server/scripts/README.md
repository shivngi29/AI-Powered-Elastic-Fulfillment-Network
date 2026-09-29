# Development/demo seed

From `server/`, configure `MONGODB_URI` in the ignored `.env` file and run:

```powershell
npm.cmd run seed:dev -- --development
```

Only local `elastic_fulfillment`, `elastic_fulfillment_dev`, or
`elastic_fulfillment_demo` databases are accepted. Remote URIs, URI query options,
and `NODE_ENV=production` are rejected. The flag explicitly identifies this run
as development/demo work; a database name alone cannot prove its contents are disposable.

The script reads the repository's `products.csv`, `fulfillment_nodes.csv`, and
`inventory.csv` under `data/synthetic/`. It preserves business IDs, quantities,
statuses, inventory version, and the instant represented by `last_updated`.
The inspected files use unquoted CSV fields; quoted fields are rejected rather
than misparsed. Missing files, schema mismatches, duplicate keys, and invalid
inventory references stop the seed before data writes.

All existing matching records are compared before insertion. Identical records
are skipped; conflicts abort without overwriting records. Unrelated records are
left untouched. Unique indexes prevent duplicate keys. Each run prints imported,
unchanged, and read-back verified counts per model.

Stop other database writers while seeding. This is not a multi-collection
transaction: a connection failure or concurrent write can leave a partial import.
Resolve the problem and rerun safely; there is no delete, reset, or overwrite mode.
No raw M5 data or other synthetic datasets are imported.
