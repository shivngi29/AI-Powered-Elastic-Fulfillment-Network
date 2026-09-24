predicted_demand = 900

W1 = {
    "name": "Warehouse 1",
    "capacity": 300,
    "status": "ACTIVE"
}

W2 = {
    "name": "Warehouse 2",
    "capacity": 300,
    "status": "ACTIVE"
}

W3 = {
    "name": "Warehouse 3",
    "capacity": 500,
    "status": "STANDBY"
}

active_capacity = W1["capacity"] + W2["capacity"]

print("Predicted Demand:", predicted_demand)
print("Active Capacity:", active_capacity)

if predicted_demand > active_capacity:

    print("\n⚠ Demand exceeds capacity")
    print("Decision: SCALE OUT")

    W3["status"] = "ACTIVE"

    print("Activating:", W3["name"])

    active_capacity += W3["capacity"]

    print("New Capacity:", active_capacity)