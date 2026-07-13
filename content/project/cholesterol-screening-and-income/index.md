---
title: "Mini Project 1: Cholesterol Screening and Income"
date: 2026-07-10
icon: "❤️"
description: "An exploration of cholesterol screening and per capita income across California counties."
summary: "We compare county-level cholesterol-screening prevalence with per capita income across all 58 California counties."
ShowToc: true
TocOpen: true
UseHugoToc: true
---

## Introduction

This project explores whether per capita income is associated with the percentage of adults who report receiving a cholesterol screening in California counties. Access to preventive health care can vary with local economic conditions, so comparing these measures may reveal geographic patterns and disparities. This is an observational county-level analysis; it identifies association, not causation.

## Data Acquisition

**Cholesterol Screening**: County-level, age-adjusted cholesterol-screening prevalence estimates for all 58 California counties were retrieved from the CDC PLACES county dataset through its Socrata API. The analysis uses the `cholscreen_adjprev` measure.

**Per Capita Income**: Annual 2023 county-level per capita personal income and population data were obtained from California Labor Market Information. The analysis retained the Bureau of Economic Analysis per capita personal income rows.

County names and five-digit county FIPS codes were cleaned and checked before the two datasets were joined one-to-one. The resulting dataset contains 58 counties with complete values for both measures.

## EDA

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-icon">🩺</div>
    <div class="stat-value">81.1%–86.6%</div>
    <div class="stat-label">screening prevalence range</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon">💰</div>
    <div class="stat-value">$38.2K–$180.6K</div>
    <div class="stat-label">per capita income range</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon">🗺️</div>
    <div class="stat-value">58</div>
    <div class="stat-label">California counties analyzed</div>
  </div>
  <div class="stat-card">
    <div class="stat-icon">📈</div>
    <div class="stat-value">0.785</div>
    <div class="stat-label">income–screening correlation</div>
  </div>
</div>

Across the 58 counties, estimated cholesterol-screening prevalence ranges from 81.1% in Imperial County to 86.6% in Marin County. Per capita income ranges from &#36;38,243 in Trinity County to &#36;180,575 in Marin County. The county-level Pearson correlation between income and screening prevalence is 0.785, indicating a strong positive association in this dataset.

<div class="meter" id="correlation-meter">
  <div class="meter-label"><span>Pearson correlation (income ↔ screening)</span><strong>0.785</strong></div>
  <div class="meter-track"><div class="meter-fill" id="correlation-fill" style="--meter-value: 78.5%;"></div></div>
</div>

<span class="eyebrow">Explore the data</span>

Counties with higher per capita income generally have higher estimated cholesterol-screening prevalence. Switch between the views below to compare the trend line and the two geographic patterns side by side. The plots show association, not causation.

<div class="tab-group" id="figure-tabs">
  <div class="tab-buttons">
    <button class="tab-btn active" data-target="tab-scatter">Scatter</button>
    <button class="tab-btn" data-target="tab-screening-map">Screening Map</button>
    <button class="tab-btn" data-target="tab-income-map">Income Map</button>
  </div>

  <div class="tab-panel active" id="tab-scatter">
    <p>Counties with higher per capita income generally have higher estimated cholesterol-screening prevalence. The fitted trend line summarizes this positive relationship, but the plot does not establish that income causes greater screening.</p>
    <figure id="cholesterol-income" style="margin: 1rem 0 0; padding: 1rem; background: var(--entry); border: 1px solid var(--border); border-radius: var(--radius);">
      <iframe src="/26-the-backpropagators/figures/cholesterol-income-scatter.html" title="Cholesterol screening prevalence versus per capita income" style="width: 100%; height: 560px; border: 0; display: block; border-radius: calc(var(--radius) - 2px);" loading="lazy"></iframe>
      <figcaption style="margin-top: 0.5rem; text-align: center; color: var(--secondary);"><strong>Fig 1.</strong> Cholesterol screening prevalence vs. per capita income</figcaption>
    </figure>
  </div>

  <div class="tab-panel" id="tab-screening-map">
    <p>Estimated cholesterol-screening prevalence varies geographically. Although the overall range is fairly narrow, darker counties have higher screening estimates and lighter counties have lower estimates.</p>
    <figure id="cholesterol-choropleth" style="margin: 1rem 0 0; padding: 1rem; background: var(--entry); border: 1px solid var(--border); border-radius: var(--radius);">
      <iframe src="/26-the-backpropagators/figures/cholesterol-screening-choropleth.html" title="Cholesterol screening prevalence by California county" style="width: 100%; height: 600px; border: 0; display: block; border-radius: calc(var(--radius) - 2px);" loading="lazy"></iframe>
      <figcaption style="margin-top: 0.5rem; text-align: center; color: var(--secondary);"><strong>Fig 2.</strong> Cholesterol screening prevalence by county</figcaption>
    </figure>
  </div>

  <div class="tab-panel" id="tab-income-map">
    <p>Per capita income shows a wider geographic contrast than screening prevalence does. Comparing this map with the screening map helps illustrate the positive county-level relationship seen in the scatter plot.</p>
    <figure id="income-choropleth" style="margin: 1rem 0 0; padding: 1rem; background: var(--entry); border: 1px solid var(--border); border-radius: var(--radius);">
      <iframe src="/26-the-backpropagators/figures/per-capita-income-choropleth.html" title="Per capita income by California county" style="width: 100%; height: 600px; border: 0; display: block; border-radius: calc(var(--radius) - 2px);" loading="lazy"></iframe>
      <figcaption style="margin-top: 0.5rem; text-align: center; color: var(--secondary);"><strong>Fig 3.</strong> Per capita income by county</figcaption>
    </figure>
  </div>
</div>

<script>
(function () {
  var group = document.getElementById('figure-tabs');
  if (group) {
    var buttons = group.querySelectorAll('.tab-btn');
    var panels = group.querySelectorAll('.tab-panel');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
      });
    });
  }

  var fill = document.getElementById('correlation-fill');
  if (fill && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fill.style.width = 'var(--meter-value)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    io.observe(fill);
  } else if (fill) {
    fill.style.width = 'var(--meter-value)';
  }
})();
</script>
