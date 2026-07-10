---
title: "California Cholesterol and Income"
date: 2026-07-09
weight: 20
icon: "CA"
description: "County-level choropleth maps and a scatterplot comparing cholesterol screening and per capita income across California."
summary: "We mapped California county cholesterol screening and per capita income, then compared the two measures with a scatterplot and trend line."
---

This mini project looks at county-level differences in cholesterol screening and per capita income across California. The choropleth maps show where each measure is higher or lower, and the scatterplot compares the two variables directly.

## County maps

<div style="display: grid; gap: 1.5rem; margin: 1.5rem 0;">
  <figure style="margin: 0; padding: 1rem; background: var(--entry); border: 1px solid var(--border); border-radius: var(--radius);">
    <iframe src="figures/cholesterol-screening-map.html" title="California cholesterol screening by county" loading="lazy" style="width: 100%; height: 580px; border: 0; display: block;"></iframe>
    <figcaption style="margin-top: 0.75rem; text-align: center; color: var(--secondary); font-weight: 500;">Figure 1: California counties shaded by adjusted cholesterol screening percentage. Darker blue counties have higher screening rates.</figcaption>
  </figure>

  <figure style="margin: 0; padding: 1rem; background: var(--entry); border: 1px solid var(--border); border-radius: var(--radius);">
    <iframe src="figures/per-capita-income-map.html" title="California per capita income by county" loading="lazy" style="width: 100%; height: 580px; border: 0; display: block;"></iframe>
    <figcaption style="margin-top: 0.75rem; text-align: center; color: var(--secondary); font-weight: 500;">Figure 2: California counties shaded by per capita income. Darker green counties have higher income values.</figcaption>
  </figure>
</div>

## Income and cholesterol screening

<figure style="margin: 1.5rem 0; padding: 1rem; background: var(--entry); border: 1px solid var(--border); border-radius: var(--radius);">
  <iframe src="figures/income-cholesterol-scatter.html" title="Cholesterol screening versus per capita income by California county" loading="lazy" style="width: 100%; height: 540px; border: 0; display: block;"></iframe>
  <figcaption style="margin-top: 0.75rem; text-align: center; color: var(--secondary); font-weight: 500;">Figure 3: Each point represents a California county. The trend line shows a positive relationship between per capita income and cholesterol screening, with a correlation of 0.785.</figcaption>
</figure>

## Quick takeaway

Counties with higher per capita income generally also have higher cholesterol screening percentages. This does not prove income causes screening differences, but it suggests income may be connected to access, awareness, or other county-level factors worth exploring further.
