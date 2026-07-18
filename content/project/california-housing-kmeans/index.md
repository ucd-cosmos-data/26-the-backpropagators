---
title: "Mini Project 2: California Housing Market Regions"
date: 2026-07-17
weight: 20
icon: "🏠"
tabTitle: "California Housing"
description: "Using K-means to identify geographic price-market regions in California housing data."
summary: "We cluster California census block groups by longitude, latitude, and median house value, then compare the six resulting regional housing markets."
ShowToc: true
TocOpen: true
UseHugoToc: true
math: true
---

The Backpropagators

## Research goal

This analysis uses K-means clustering to divide California census block groups into a small set of housing-market regions. Unlike a supervised model, K-means does not predict a known label. Its purpose here is exploratory: it looks for block groups that are similar in both location and median house value, making broad geographic price patterns easier to see.

The source is scikit-learn's California Housing dataset, derived from the 1990 U.S. Census. Each of its 20,640 rows represents one census block group. The price variable is the block group's median house value in units of &#36;100,000, so all dollar results below describe the historical dataset—not current home prices. Some values are capped at &#36;500,001, which can also pull high-price observations together.

## Methodology: K-means

### Data structure

The algorithm receives a numeric matrix with 20,640 rows and three columns: longitude, latitude, and median house value. A row can be written as \(x_i = (x_{i1}, x_{i2}, x_{i3})\). Longitude and latitude locate a block group, while house value introduces an economic dimension. Price is used to form the clusters; it is not included only after clustering. Consequently, the output represents **geographic price markets**, not administrative borders or strictly contiguous geographic zones.

Before fitting the model, each column is standardized by subtracting its sample mean and dividing by its sample standard deviation:

$$
z_{ij}=\frac{x_{ij}-\bar{x}_j}{s_j}.
$$

### Minimization problem

For a chosen number of clusters \(K\), K-means divides the standardized observations into sets \(C_1,\ldots,C_K\). It chooses the partition and a centroid \(\mu_k\) for each set to minimize the within-cluster sum of squared Euclidean distances:

$$
\min_{C_1,\ldots,C_K,\,\mu_1,\ldots,\mu_K}
\sum_{k=1}^{K}\sum_{z_i\in C_k}\lVert z_i-\mu_k\rVert_2^2.
$$

This objective is also called inertia. A smaller value means observations lie closer to their assigned centroids, although inertia always decreases as more clusters are added and therefore cannot select \(K\) by itself.

### How the algorithm solves it

The global minimization problem is difficult to solve exactly, so K-means uses an iterative approximation. First, the k-means++ procedure selects initial centroids that are spread through the data. The assignment step sends every observation to its nearest centroid. The update step replaces each centroid with the mean of the observations currently assigned to it. Assignment and update repeat until the labels stop changing materially or the centroid movement satisfies the convergence tolerance. Because the result can depend on initialization, the full procedure is run 20 times and the solution with the smallest inertia is retained.

### Hyperparameters and selection

The main hyperparameter is \(K\), the number of clusters. Candidate values from 2 through 10 were compared using two diagnostics. The silhouette score measures whether observations are closer to their own cluster than to neighboring clusters; larger values indicate clearer separation. Inertia was inspected for an elbow, where adding another cluster begins to produce smaller improvements.

The highest silhouette score was **0.545 at \(K=2\)**. We selected **\(K=6\)** for the final analysis because two clusters hide much of the regional detail, while six produces a still-manageable set that separates several coastal, inland, northern, and southern price markets. This is a deliberate tradeoff: the six-cluster silhouette score is lower (**0.415**), so the extra detail comes with less distinct separation. The choice should not be interpreted as proof that California has exactly six natural housing regions.

The remaining settings control reproducibility and stability. `k-means++` supplies dispersed starting centers; `n_init=20` fits 20 initializations to reduce the risk of keeping a poor local solution; and `random_state=42` makes those starts repeatable. The candidate range of 2–10 and the 5,000-observation silhouette sample are evaluation choices rather than parameters of the final fitted model. Finally, arbitrary cluster IDs are relabeled north-to-south by average latitude so that Region 1 through Region 6 remain understandable and reproducible.

### Why scaling is required

K-means is based entirely on distance. Without scaling, a feature's influence depends on its numerical range and units: a one-unit price change, a one-degree latitude change, and a one-degree longitude change would enter the calculation as if they were directly comparable. Standardization gives each feature mean zero and variance one, preventing a column from dominating merely because of its scale.

Scaling does not remove every modeling assumption. Euclidean distance still gives equal overall weight to the three standardized variables, and longitude/latitude in degrees are only an approximation to physical distance. The clusters are therefore useful summaries of this feature choice, not official geographic boundaries.

## Results

<figure id="kmeans-region-map" style="margin: 1.5rem 0; padding: 1rem; background: var(--entry); border: 1px solid var(--border); border-radius: var(--radius);">
  <img src="kmeans-regions.png" alt="Scatter plot of California census block groups with longitude on the horizontal axis, latitude on the vertical axis, and color indicating one of six K-means clusters" style="width: 100%; height: auto; border-radius: calc(var(--radius) - 2px);" />
  <figcaption style="margin-top: 0.75rem; text-align: center; color: var(--secondary);"><strong>Figure 1.</strong> Six K-means housing-market regions. Every point is a census block group; color indicates cluster membership.</figcaption>
</figure>

### Mean house value by region

| Region | Mean house value | Block groups | Geographic center (longitude, latitude) |
| --- | ---: | ---: | ---: |
| Region 1 | &#36;137,015 | 4,968 | −121.82, 38.40 |
| Region 2 | &#36;340,844 | 2,763 | −122.15, 37.58 |
| Region 3 | &#36;91,495 | 1,657 | −119.69, 36.25 |
| Region 4 | &#36;249,640 | 3,956 | −118.17, 33.91 |
| Region 5 | &#36;437,609 | 1,673 | −118.24, 33.90 |
| Region 6 | &#36;137,962 | 5,623 | −117.66, 33.77 |

### Interpretation

**Region 1 — northern and north-central, lower-price market.** This large region is centered near the Sacramento area and extends through much of northern California. Its mean value of about &#36;137,000 is well below the statewide coastal clusters, suggesting that the model groups a broad set of less-expensive northern and interior block groups.

**Region 2 — Bay Area and nearby coastal, high-price market.** Centered near longitude −122.15 and latitude 37.58, this region follows the San Francisco Bay Area and portions of the north-central coast. Its &#36;340,844 mean is the second highest, consistent with a concentrated high-value coastal market.

**Region 3 — Central Valley, lowest-price market.** This is the smallest-priced cluster, averaging &#36;91,495 and centered in the inland Central Valley. Its separation from the coastal groups illustrates the strong inland–coastal price contrast in the 1990 data.

**Region 4 — southern coastal and metropolitan, middle-to-high-price market.** This cluster is centered in greater Los Angeles and averages &#36;249,640. It captures moderately expensive southern metropolitan observations that are geographically close to Region 5 but lower in price.

**Region 5 — premium Southern California market.** Region 5 has almost the same geographic center as Region 4 but the highest mean value, &#36;437,609. This overlap is informative: because price is a clustering feature, K-means separates high-value block groups from nearby moderate-value block groups rather than drawing one simple boundary around Los Angeles and Orange County.

**Region 6 — broad southern and inland, lower-price market.** The largest cluster by row count spreads across southern and inland California and averages &#36;137,962. It forms a lower-price counterpart to the coastal metropolitan clusters.

The clearest overall pattern is a coastal premium, especially around the Bay Area and Southern California, alongside lower average values in the Central Valley and broader inland areas. Regions 4 and 5 demonstrate why the colors should not be read as contiguous political regions: observations can occupy similar coordinates yet receive different labels because their prices differ. The analysis is descriptive, and the cluster names are interpretations based on their plotted locations and centroids rather than county or city boundaries.

## Appendix: full runnable code

The script below reproduces model selection, the final six-cluster fit, the region summary, and Figure 1. It requires Python with pandas, matplotlib, and scikit-learn. It is also available as a [standalone Python file](analysis.py).

```python
"""Reproduce the California housing K-means regional analysis and final map."""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.datasets import fetch_california_housing
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

housing = fetch_california_housing(as_frame=True)
df = housing.frame.copy()

features = df[["Longitude", "Latitude", "MedHouseVal"]]
scaled_features = StandardScaler().fit_transform(features)

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

model = KMeans(
    n_clusters=selected_k,
    init="k-means++",
    n_init=20,
    random_state=42,
)
df["cluster"] = model.fit_predict(scaled_features)

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
```
