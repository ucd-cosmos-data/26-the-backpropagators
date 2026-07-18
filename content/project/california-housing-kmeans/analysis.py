"""Reproduce the California housing K-means regional analysis and final map."""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.datasets import fetch_california_housing
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler


# Load one row per California census block group. MedHouseVal is measured in
# units of $100,000 in this dataset.
housing = fetch_california_housing(as_frame=True)
df = housing.frame.copy()

# K-means operates on geography and price, so the resulting groups should be
# interpreted as geographic price-market regions rather than map boundaries.
features = df[["Longitude", "Latitude", "MedHouseVal"]]
scaled_features = StandardScaler().fit_transform(features)

# Compare candidate values of K with inertia and silhouette score.
selection_rows = []
for candidate_k in range(2, 11):
    candidate_model = KMeans(
        n_clusters=candidate_k,
        init="k-means++",
        n_init=20,
        random_state=42,
    )
    candidate_labels = candidate_model.fit_predict(scaled_features)
    selection_rows.append(
        {
            "K": candidate_k,
            "Inertia": candidate_model.inertia_,
            "Silhouette": silhouette_score(
                scaled_features,
                candidate_labels,
                sample_size=5_000,
                random_state=42,
            ),
        }
    )

selection_results = pd.DataFrame(selection_rows).set_index("K")
selected_k = 6

# Fit the final model.
model = KMeans(
    n_clusters=selected_k,
    init="k-means++",
    n_init=20,
    random_state=42,
)
df["cluster"] = model.fit_predict(scaled_features)

# K-means labels are arbitrary. Relabel centroids north-to-south so the region
# numbers remain readable and reproducible.
centroids = (
    df.groupby("cluster")[["Longitude", "Latitude"]]
    .mean()
    .sort_values(["Latitude", "Longitude"], ascending=[False, True])
)
region_lookup = {
    cluster_id: region_number
    for region_number, cluster_id in enumerate(centroids.index, start=1)
}
df["Region"] = df["cluster"].map(region_lookup)

# Summarize price and geographic center by region.
region_summary = (
    df.groupby("Region")
    .agg(
        Mean_Price_USD=("MedHouseVal", lambda values: values.mean() * 100_000),
        Block_Groups=("MedHouseVal", "size"),
        Centroid_Longitude=("Longitude", "mean"),
        Centroid_Latitude=("Latitude", "mean"),
    )
    .round(
        {
            "Mean_Price_USD": 0,
            "Centroid_Longitude": 2,
            "Centroid_Latitude": 2,
        }
    )
)

print("Model-selection results")
print(selection_results.round({"Inertia": 0, "Silhouette": 3}))
print("\nRegional results")
print(region_summary.to_string())

# Create the requested final scatter map.
colors = ["#5eead4", "#38bdf8", "#fbbf24", "#a78bfa", "#fb7185", "#60a5fa"]
fig, ax = plt.subplots(figsize=(10, 8), facecolor="#08192e")
ax.set_facecolor("#08192e")

for region_number, region_data in df.groupby("Region"):
    ax.scatter(
        region_data["Longitude"],
        region_data["Latitude"],
        s=8,
        alpha=0.62,
        color=colors[region_number - 1],
        label=f"Region {region_number}",
        linewidths=0,
    )

ax.set(
    title="California Housing Market Regions from K-means Clustering",
    xlabel="Longitude",
    ylabel="Latitude",
)
ax.tick_params(colors="#d3e3f5")
ax.xaxis.label.set_color("#d3e3f5")
ax.yaxis.label.set_color("#d3e3f5")
ax.title.set_color("#eaf3ff")
for spine in ax.spines.values():
    spine.set_color("#355273")
ax.grid(alpha=0.16, color="#d3e3f5")
legend = ax.legend(title="Cluster", markerscale=2.2, frameon=True)
legend.get_frame().set_facecolor("#0a1f3a")
legend.get_frame().set_edgecolor("#355273")
legend.get_title().set_color("#eaf3ff")
for label in legend.get_texts():
    label.set_color("#d3e3f5")

fig.tight_layout()
output_path = Path(__file__).with_name("kmeans-regions.png")
fig.savefig(output_path, dpi=180, bbox_inches="tight", facecolor=fig.get_facecolor())
print(f"\nSaved figure to {output_path}")
