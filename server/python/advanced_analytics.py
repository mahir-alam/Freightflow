import json
import sys
import pandas as pd


def safe_float(value):
    try:
        if value is None or value == "":
            return 0.0
        return float(value)
    except Exception:
        return 0.0


def main():
    raw_input = sys.stdin.read().strip()

    if not raw_input:
        print(json.dumps({
            "mostProfitableRoutes": [],
            "lowestMarginRoutes": [],
            "routeBenchmarks": [],
            "monthlyShipmentTrend": [],
            "truckTypeProfitability": [],
            "summary": {
                "averageMarginPercent": 0,
                "highestMarginPercent": 0,
                "lowestMarginPercent": 0,
            },
        }))
        return

    payload = json.loads(raw_input)
    shipments = payload.get("shipments", [])
    trucks = payload.get("trucks", [])

    if not shipments:
        print(json.dumps({
            "mostProfitableRoutes": [],
            "lowestMarginRoutes": [],
            "routeBenchmarks": [],
            "monthlyShipmentTrend": [],
            "truckTypeProfitability": [],
            "summary": {
                "averageMarginPercent": 0,
                "highestMarginPercent": 0,
                "lowestMarginPercent": 0,
            },
        }))
        return

    df = pd.DataFrame(shipments)

    # numeric cleanup
    df["negotiatedPrice"] = df["negotiatedPrice"].apply(safe_float)
    df["commissionAmount"] = df["commissionAmount"].apply(safe_float)

    # derived fields
    df["route"] = df["pickupLocation"].fillna("") + " → " + df["dropoffLocation"].fillna("")
    df["marginPercent"] = df.apply(
        lambda row: (row["commissionAmount"] / row["negotiatedPrice"] * 100)
        if row["negotiatedPrice"] > 0 else 0,
        axis=1,
    )

    # shipment date handling
    df["shipmentDate"] = pd.to_datetime(df["shipmentDate"], errors="coerce")
    df["shipmentMonth"] = df["shipmentDate"].dt.strftime("%b %Y")

    # route profitability
    route_profitability = (
        df.groupby(["pickupLocation", "dropoffLocation", "route"], dropna=False)
        .agg(
            shipmentCount=("id", "count"),
            averagePrice=("negotiatedPrice", "mean"),
            totalRevenue=("negotiatedPrice", "sum"),
            totalCommission=("commissionAmount", "sum"),
            averageMarginPercent=("marginPercent", "mean"),
        )
        .reset_index()
    )

    most_profitable_routes = (
        route_profitability.sort_values(
            by=["totalCommission", "shipmentCount", "averageMarginPercent"],
            ascending=[False, False, False],
        )
        .head(5)
        .round(2)
        .to_dict(orient="records")
    )

    lowest_margin_routes = (
        route_profitability.sort_values(
            by=["averageMarginPercent", "shipmentCount"],
            ascending=[True, False],
        )
        .head(5)
        .round(2)
        .to_dict(orient="records")
    )

    route_benchmarks = (
        route_profitability.sort_values(
            by=["shipmentCount", "averagePrice"],
            ascending=[False, False],
        )
        .head(10)
        .round(2)
        .to_dict(orient="records")
    )

    # monthly trend
    monthly_trend = []
    monthly_df = df.dropna(subset=["shipmentDate"]).copy()

    if not monthly_df.empty:
        monthly_summary = (
            monthly_df.groupby("shipmentMonth", dropna=False)
            .agg(
                shipmentCount=("id", "count"),
                averagePrice=("negotiatedPrice", "mean"),
                totalCommission=("commissionAmount", "sum"),
            )
            .reset_index()
        )

        monthly_summary["monthOrder"] = pd.to_datetime(
            monthly_summary["shipmentMonth"], format="%b %Y", errors="coerce"
        )
        monthly_summary = monthly_summary.sort_values("monthOrder").drop(columns=["monthOrder"])

        monthly_trend = monthly_summary.round(2).to_dict(orient="records")

    # truck type profitability
    truck_type_profitability = (
        df.groupby("truckType", dropna=False)
        .agg(
            shipmentCount=("id", "count"),
            averagePrice=("negotiatedPrice", "mean"),
            totalCommission=("commissionAmount", "sum"),
            averageMarginPercent=("marginPercent", "mean"),
        )
        .reset_index()
        .sort_values(by=["shipmentCount", "totalCommission"], ascending=[False, False])
        .round(2)
        .to_dict(orient="records")
    )

    summary = {
        "averageMarginPercent": round(float(df["marginPercent"].mean()), 2) if not df.empty else 0,
        "highestMarginPercent": round(float(df["marginPercent"].max()), 2) if not df.empty else 0,
        "lowestMarginPercent": round(float(df["marginPercent"].min()), 2) if not df.empty else 0,
        "truckCountAnalyzed": len(trucks),
        "shipmentCountAnalyzed": len(shipments),
    }

    result = {
        "mostProfitableRoutes": most_profitable_routes,
        "lowestMarginRoutes": lowest_margin_routes,
        "routeBenchmarks": route_benchmarks,
        "monthlyShipmentTrend": monthly_trend,
        "truckTypeProfitability": truck_type_profitability,
        "summary": summary,
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()