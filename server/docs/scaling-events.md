# Scaling event records

GET `/api/scaling/events` returns `{ "data": [...] }`, newest creation first.
It reads persisted ScalingEvent records only; no fallback fixtures, seeding,
decision generation, status transitions, or execution endpoints are provided.

`node_id` uses the existing node business code (for example N02).
`cluster_id` denotes the service region (for example NCR), not a customer-region
Rxx ID. Node is required for SCALE_OUT/SCALE_IN; a cluster-wide MAINTAIN can
leave it null. A future writer must verify node existence and cluster membership.

Demand and all capacity fields are daily unit quantities, including fractional
forecast values. They are supplied by the future intelligence engine; the model
does not calculate required capacity or decide actions. Available capacity is
the pre-action cluster processing capacity snapshot, not storage capacity.
Cost/savings are INR estimates for the event; null means unknown, not zero.
The future producer must describe its cost-estimation horizon in the reason.

Statuses: RECORDED (default, no execution implied), PENDING, EXECUTED, FAILED,
CANCELLED. These are MVP contract choices because no event dataset or detailed
implementation-design document is present. Creation time is immutable;
execution time is nullable and required for EXECUTED. Source must explicitly
be `intelligence` or `demo`; the frontend labels demo records.

Validation applies to document validation/save. Future query-based writers
must preserve these cross-field invariants explicitly. No automatic foreign-key
validation or scaling business logic is implemented.
