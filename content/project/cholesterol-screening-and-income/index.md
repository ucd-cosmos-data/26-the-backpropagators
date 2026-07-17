---
title: "Mini Project 1: Cholesterol Screening and Income"
date: 2026-07-10
weight: 15
icon: "❤️"
tabTitle: "Cholesterol & Income"
description: "An exploration of cholesterol screening and per capita income across California counties."
summary: "We compare county-level cholesterol-screening prevalence with per capita income across all 58 California counties."
ShowToc: true
TocOpen: true
UseHugoToc: true
---

The Backpropagators

## Introduction

This project explores whether per capita income is associated with the percentage of adults who report receiving a cholesterol screening in California counties. Access to preventive health care can vary with local economic conditions, so comparing these measures may reveal geographic patterns and disparities. This is an observational county-level analysis; it identifies association, not causation.

## Data Acquisition

**Cholesterol Screening**: County-level, age-adjusted cholesterol-screening prevalence estimates for all 58 California counties were retrieved from the CDC PLACES county dataset through its Socrata API. The analysis uses the `cholscreen_adjprev` measure.

**Per Capita Income**: Annual 2023 county-level per capita personal income and population data were obtained from California Labor Market Information. The analysis retained the Bureau of Economic Analysis per capita personal income rows.

County names and five-digit county FIPS codes were cleaned and checked before the two datasets were joined one-to-one. The resulting dataset contains 58 counties with complete values for both measures.

## EDA

Across the 58 counties, estimated cholesterol-screening prevalence ranges from 81.1% in Imperial County to 86.6% in Marin County. Per capita income ranges from &#36;38,243 in Trinity County to &#36;180,575 in Marin County. The county-level Pearson correlation between income and screening prevalence is 0.785, indicating a strong positive association in this dataset.

In Figure [1](#cholesterol-income) counties with higher per capita income generally have higher estimated cholesterol-screening prevalence. The fitted trend line summarizes this positive relationship, but the plot does not establish that income causes greater screening.

<figure id="cholesterol-income" style="margin: 1.5rem 0;">
  <iframe src="/26-the-backpropagators/figures/cholesterol-income-scatter.html" title="Cholesterol screening prevalence versus per capita income" style="width: 100%; height: 560px; border: 0; display: block;" loading="lazy"></iframe>
  <figcaption style="text-align: center;"><strong>Fig 1.</strong> Cholesterol screening prevalence vs. per capita income</figcaption>
</figure>

Figure [2](#cholesterol-choropleth) shows how estimated cholesterol-screening prevalence varies geographically. Although the overall range is fairly narrow, darker counties have higher screening estimates and lighter counties have lower estimates.

<figure id="cholesterol-choropleth" style="margin: 1.5rem 0;">
  <iframe src="/26-the-backpropagators/figures/cholesterol-screening-choropleth.html" title="Cholesterol screening prevalence by California county" style="width: 100%; height: 600px; border: 0; display: block;" loading="lazy"></iframe>
  <figcaption style="text-align: center;"><strong>Fig 2.</strong> Cholesterol screening prevalence by county</figcaption>
</figure>

Figure [3](#income-choropleth) shows a wider geographic contrast in per capita income. Comparing Figures 2 and 3 helps illustrate the positive county-level relationship seen in Figure 1.

<figure id="income-choropleth" style="margin: 1.5rem 0;">
  <iframe src="/26-the-backpropagators/figures/per-capita-income-choropleth.html" title="Per capita income by California county" style="width: 100%; height: 600px; border: 0; display: block;" loading="lazy"></iframe>
  <figcaption style="text-align: center;"><strong>Fig 3.</strong> Per capita income by county</figcaption>
</figure>
