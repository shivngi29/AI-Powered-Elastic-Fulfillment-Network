# Data dictionary

UTF-8 CSV, comma delimiter, header row. Integers are nonnegative; costs are INR, capacities are units (not orders). Booleans are true/false. No missing fields. IDs are stable text keys. PK = primary key; FK = foreign key. All network facts are synthetic.

## regions.csv (6 rows)

| Field | Definition |
|---|---|
| region_id | text PK; customer-region graph endpoint |
| name | text; synthetic service area |
| city | text; Indian city |
| state | text; Indian state |
| cluster_id | text; independent service cluster |
| latitude | decimal degrees; approximate centroid |
| longitude | decimal degrees; approximate centroid |
| m5_store_id | text UNIQUE; M5 store join key |
| m5_state_id | text; original M5 state; not Indian geography |
| baseline_units_per_day | integer; optional normalized demo demand across all six SKUs |
| sla_minutes | integer; delivery target after dispatch |

## suppliers.csv (3 rows)

| Field | Definition |
|---|---|
| supplier_id | text PK |
| name | text; fictional business |
| city | text |
| cluster_id | text; intended replenishment cluster |
| latitude | decimal degrees |
| longitude | decimal degrees |
| production_capacity_units_per_day | integer; shared across all products and destination nodes |
| lead_time_days | integer; handling/production before route transit |
| reliability_score | decimal 0..1; assumed on-time probability |

## products.csv (6 rows)

| Field | Definition |
|---|---|
| product_id | text PK; also Product.sku |
| name | text; invented Indian retail label, NOT identity of M5 item |
| category | text; synthetic retail category |
| m5_item_id | text UNIQUE; join M5 item_id |
| m5_dept_id | text; M5 dept_id |
| m5_cat_id | text; M5 cat_id |
| unit_cost_inr | decimal; synthetic purchase cost per unit |
| selling_price_inr | decimal; synthetic selling price per unit |
| weight_kg | decimal per unit |
| length_cm | decimal packaged length |
| width_cm | decimal packaged width |
| height_cm | decimal packaged height |
| reorder_point_units | integer; default per node/product; override by forecast |

## supplier_products.csv (18 rows)

| Field | Definition |
|---|---|
| supplier_id | text FK suppliers |
| product_id | text FK products; composite PK with supplier_id |
| minimum_order_units | integer per purchase line |
| lead_time_days | integer; product-specific handling lead time; route transit is additional |

## fulfillment_nodes.csv (6 rows)

| Field | Definition |
|---|---|
| node_id | text PK; also FulfillmentNode.code |
| name | text; fictional facility |
| type | enum WAREHOUSE / MICRO_FC |
| status | enum ACTIVE / STANDBY; initial state |
| city | text |
| cluster_id | text; service cluster |
| latitude | decimal degrees |
| longitude | decimal degrees |
| storage_capacity_units | integer; shared across all SKUs; unit-equivalent simplification |
| processing_capacity_units_per_hour | integer; outbound handling shared by deliveries and transfers |
| operating_hours_per_day | integer; daily capacity = hourly capacity times hours |
| operating_cost_inr_per_day | decimal; charged only while ACTIVE |
| standby_cost_inr_per_day | decimal; charged while STANDBY |
| activation_cost_inr | decimal; one-time per activation |
| activation_time_hours | integer; delay before usable |
| max_delivery_radius_km | decimal; final delivery edges only |
| is_elastic | boolean; only elastic nodes may scale in |

## inventory.csv (36 rows)

| Field | Definition |
|---|---|
| node_id | text FK nodes; composite PK with product_id |
| product_id | text FK products |
| available_qty | integer; unreserved on-hand stock |
| reserved_qty | integer; additional on-hand stock committed to orders |
| in_transit_qty | integer; incoming stock not yet on hand; initial zero |
| safety_stock | integer; target buffer, included within available_qty, not additional stock |
| last_updated | ISO 8601; snapshot at start of demo day 1 |
| version | integer; optimistic concurrency version |

## network_edges.csv (24 rows)

| Field | Definition |
|---|---|
| edge_id | text PK; directed route |
| from_type | enum SUPPLIER / NODE |
| from_id | text FK selected by from_type |
| to_type | enum NODE / CUSTOMER_REGION |
| to_id | text FK selected by to_type |
| status | enum ACTIVE / INACTIVE; initial state |
| distance_km | decimal; assumed road distance, not measured |
| travel_time_minutes | integer; base transport time; excludes supplier handling |
| transport_cost_inr_per_unit | decimal; per shipped unit; route cost is quantity times sum of edge costs |
| capacity_units_per_day | integer; shared across SKUs on this directed edge |
| congestion_factor | decimal >=1; multiply travel time only |

## scenario_events.csv (6 rows)

| Field | Definition |
|---|---|
| event_id | text PK |
| scenario_id | text; run DEMO_FESTIVAL alone |
| name | text; fictional event, not actual festival calendar |
| start_day | integer inclusive; demo day 1 = snapshot date |
| end_day | integer inclusive |
| cluster_id | text FK cluster used in regions/nodes |
| demand_multiplier | decimal; apply once to base forecast |
| description | text; intended scenario effect; not a recorded scaling decision |

## simulation_config.csv (1 rows)

| Field | Definition |
|---|---|
| config_id | text PK |
| snapshot_date | ISO date; start of demo day 1, Asia/Kolkata |
| simulation_days | integer |
| forecast_horizon_days | integer; total units over this horizon divided by days for capacity comparison |
| baseline_window_days | integer; trailing M5 history used for mean |
| target_utilization | decimal; demand / raw processing capacity target |
| scale_in_utilization | decimal; cluster demand / current active raw capacity must be below this |
| scale_in_consecutive_days | integer; persistence requirement |
| minimum_active_days | integer; cooldown after activation |
| unserved_penalty_inr_per_unit | decimal; hypothetical objective penalty, not observed revenue |
| normalization_mode | enum REGION_TOTAL; optional demo-only scaling |
| scenario_id | text FK scenario_events scenario_id |
