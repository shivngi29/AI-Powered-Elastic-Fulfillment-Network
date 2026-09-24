# Elastic Fulfillment Network — MVP data

Nine CSVs: 6 nodes (3 active + 3 standby), 3 suppliers, 6 products, 6 customer regions, 18 supplier-product links, 36 inventory rows, 24 directed edges, 6 scenario events and 1 configuration row. No training or external libraries are required to read these files.

## Start here

1. Import suppliers, products, supplier_products, regions, fulfillment_nodes, inventory and network_edges. Keep string IDs, or retain them as unique codes when MongoDB generates ObjectIds.
2. Use M5 history to build 36 daily series (6 selected items × 6 selected stores). Keep the downloaded M5 files unchanged.
3. Run a trailing-28-day mean baseline and optionally apply the demo normalization below. Load simulation_config and scenario_events for the 14-day scenario.
4. Evaluate capacity, activate a flex node in advance, move stock, then route deliveries. Save forecasts, transfers and scaling decisions as runtime outputs.

All businesses, product labels, costs, capacity, stock, routes and events here are invented demonstration assumptions. Cities and approximate coordinates provide an Indian setting; they are not surveyed facilities or road measurements. Product names do not describe the actual anonymized Walmart items. INR values are not converted M5 prices. The simulation starts September 19, 2026; the sale is fictional and does not assert real festival dates.

## Which files feed each component?

| Component | Inputs |
|---|---|
| Forecasting | Your M5 sales file + calendar.csv; optional sell_prices.csv; products.csv and regions.csv for joins |
| Elasticity | Forecasts + fulfillment_nodes.csv + simulation_config.csv; reachable network edges, inventory and costs constrain decisions |
| Inventory allocation | inventory.csv + products.csv + suppliers.csv + supplier_products.csv + forecasts + node storage limits |
| Routing | network_edges.csv + node states + regions.csv; stock availability and residual capacities |
| Scenario simulator | scenario_events.csv + simulation_config.csv; overlay on forecasts, not historical observations |

DATA_DICTIONARY.md defines every column, type, unit and key. CSVs flatten the implementation plan's nested location fields and use snake_case names. Node processing is measured in units/hour. Runtime currentUtilization, orders, forecasts, ScalingEvents and InventoryTransfers are intentionally not seeded with fabricated operational results. Supplier.products comes from supplier_products; a product can have several suppliers, so there is no single manufacturerId.

## Connect M5 correctly

- Select one sales file: sales_train_validation.csv OR sales_train_evaluation.csv, never append both. The latter contains a longer, overlapping history.
- Filter sales.item_id using products.m5_item_id and sales.store_id using regions.m5_store_id. Verify all 36 selected pairs exist in your downloaded version before importing. The local M5 files were not available for this package's validation.
- Unpivot available d_* columns to (item_id, store_id, d, units_sold). Join calendar.d to obtain the original historical date and wm_yr_wk. Preserve zeros; investigate missing values instead of treating them as zero demand.
- Join item_id to products.m5_item_id → product_id. Join store_id to regions.m5_store_id → region_id. M5 store is a customer demand region, not a fulfillment node. CA/TX/WI are arbitrary source labels mapped to NCR/Mumbai/Bengaluru; this does not claim Indian demand was measured.
- Optional price join: (item_id, store_id, wm_yr_wk) to sell_prices.csv. M5 sell_price stays a source-series feature; use synthetic INR product and transport costs for the network. Missing weekly prices can occur; do not fill them with synthetic INR prices.
- Calendar events and SNAP flags describe the original US observations. Do not rename them as Indian events. Scenario events are a separate overlay.
- Resulting history grain: (product_id, region_id, historical_date), one row per day. Sales are a demand proxy and may understate unconstrained demand when stock was unavailable.

## Small forecasting baseline and demo scaling

For each selected product/region, take the mean of its last 28 available historical days, using a common cutoff across all series. Repeat that mean for each future demo day. This is a baseline forecast, not a pretrained AI model; no model training is required. Keep the historical dates, and map the future horizon by demo-day index to September 19 onward. Do not relabel old observations as 2026 sales. Backtest only on original dates with no future leakage.

To match this small network, normalize each region's combined daily forecast to its baseline_units_per_day (100): normalized_product_forecast = product_mean / sum_of_six_product_means_in_region × 100. This preserves product shares, not the original absolute sales volume. Reject a zero or missing denominator and choose an observed window with sales. Keep forecasts fractional; when creating integer orders, use largest remainders per region/day to preserve the rounded regional total. For a changing forecast, calculate one normalization factor from the initial historical window and hold it fixed.

Raw M5 mode is also valid: skip normalization and recalibrate node capacities/stock. The expected demo transitions below apply only to normalized mode.

Apply the matching event multiplier once per cluster/day, across all products and both regions. Days without events use 1.0. Event intervals are inclusive and do not overlap in a cluster. They represent a known scenario assumption; they are not a forecast learned from data.

| Demo days | Demand per cluster/day | Raw processing capacity | Intended behavior |
|---|---:|---:|---|
| 1–3 | 200 | 320 main | Maintain; prepare stock and activation for day 4 |
| 4–10 | 440 | 640 main + flex | Scale out; 68.75% combined utilization |
| 11–14 | 120 | 640, then 320 | After 3 low-demand days, consolidate and scale in if feasible |

At target utilization 0.8, required raw capacity is demand / 0.8. The peak requires 550 units/day, exceeding one node's 320 but fitting two nodes' 640. For a 3-day forecast sum, divide by 3 before comparing with daily capacity. An event crossing the forecast horizon can trigger activation before day 4. Evaluate by cluster and feasible routes; do not count remote capacity with no route.

## Stock, routes and costs

Stock starts at 250 available units per SKU in each main node; flex nodes start empty. Available is unreserved on-hand stock; physical on-hand = available + reserved. Safety stock is a target within available stock, never extra inventory. Replenish by SKU: aggregate stock sufficiency does not guarantee the right SKU is available.

Use max(0, forecast over replenishment coverage + safety stock - available - incoming arriving within coverage) as a replenishment request. Coverage must include supplier handling (1 day) plus route transit. Honor SKU minimum purchase lots, supplier capacity shared across destinations/SKUs, storage, and donor safety stock. Initial in_transit is zero; runtime transfers need ETA records. Reserve capacity at the source and debit/credit stock exactly once; do not deliver stock before arrival.

Each node has 8 operating hours × 40 units/hour = 320 outbound units/day, shared by customer shipments AND stock transfers. Each supplier can provide 600 units/day total, not 600 per SKU or per edge. Pre-position stock ahead of the spike; a newly activated empty node cannot immediately fulfill demand. Daily buckets can conservatively make transfers usable the next day. Storage is a simplified count of mixed retail units; product dimensions/weights are supplied for later refinement.

Edges are directed; reverse transfers have separate rows. Enable eligible edges after all node endpoints are ACTIVE and activation delay has elapsed. Disable them when a node closes. Standby nodes cannot forward goods. Delivery radius applies only to NODE → CUSTOMER_REGION edges. Congestion multiplies travel time; edge costs are INR per shipped unit, with no fixed truck charge. Distance is descriptive and is not multiplied into the cost again.

For a simple router, choose the cheapest feasible delivery edge from an active node with stock, within the SLA and residual node/edge capacity. Transfers/replenishment use their own directed edges and lead times. Dijkstra can find paths, but does not enforce stock or shared capacity by itself. Final-mile SLA starts at dispatch, not at supplier ordering.

Charge operating cost per active day, standby cost per standby day and activation cost once per activation. Compare incremental activation, operating, transfer and delivery costs against avoided unserved-unit penalty over the expected active period. The 100 INR penalty is a configurable simulation objective, not a measured loss. Capacity pressure alone is not proof that activation is economical.

For scale-in, require utilization below 0.35 for 3 days, at least 3 active days, and remaining active capacity able to serve demand at 0.8 target utilization. Stop replenishment; finish reservations/transfers and consolidate stock within recipient storage/handling limits before returning flex to STANDBY. Scale-in timing is conditional, not guaranteed by an event label.

## Source and validation

Schema basis: uploaded AI_Elastic_Fulfillment_Network_Implementation_Design.docx, sections 5 (data model), 8 (services), 9 (scale flows) and 10 (scenario). M5 files are supplied separately by you; no M5 observations are redistributed here.

Package checks cover unique keys, foreign keys, complete node/SKU inventory, initial edge/node status consistency, nonnegative stock, storage limits, customer reachability, delivery radii and the capacity arithmetic above. These are seed-data checks, not an end-to-end simulation or proof of forecast accuracy. Reset from the CSV snapshot before each demo run.
