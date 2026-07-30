(function () {
  "use strict";

  const root = document.getElementById("cell-predictor");
  if (!root) return;

  const datasets = {
    pbmc3k: {
      label: "PBMC3k",
      url: "../data/pbmc3k-cell-predictions.json",
      description: "PBMC3k uses the original nine-class XGBoost results and the original training, validation, and untouched test splits.",
      method: "PBMC3k uses the original nine-class XGBoost model. Its reviewed labels came from expression-based clustering and marker review."
    },
    pbmc4k: {
      label: "PBMC4k",
      url: "../data/pbmc4k-cell-predictions.json",
      description: "PBMC4k is an external donor dataset. The PBMC3k-trained model reports six broad cell categories; reviewed dendritic cells are identified separately.",
      method: "PBMC4k uses the PBMC3k-trained XGBoost model, with fine probabilities combined into six broad categories. Its 95.9% broad-label agreement is measured on 4,097 supported PBMC4k cells. The 34 dendritic cells are shown from reviewed marker annotation, not from XGBoost."
    }
  };

  const form = document.getElementById("cell-form");
  const queryInput = document.getElementById("cell-query");
  const predictButton = document.getElementById("predict-button");
  const randomButton = document.getElementById("random-cell");
  const status = document.getElementById("model-status");
  const error = document.getElementById("cell-error");
  const result = document.getElementById("prediction-result");
  const probabilityBars = document.getElementById("probability-bars");
  const probabilitySection = document.getElementById("probability-section");
  const confidenceDial = document.getElementById("confidence-dial");
  const datasetButtons = Array.from(document.querySelectorAll("[data-dataset]"));

  const payloads = new Map();
  let payload;
  let cellsByBarcode = new Map();

  const setText = (id, value) => {
    document.getElementById(id).textContent = value;
  };

  const formatSplit = (split) => ({
    training: "Training",
    validation: "Validation",
    test: "Untouched test",
    external: "External test"
  }[split] || split);

  const showError = (message) => {
    error.textContent = message;
    error.hidden = false;
    queryInput.setAttribute("aria-invalid", "true");
    queryInput.focus();
  };

  const clearError = () => {
    error.hidden = true;
    queryInput.removeAttribute("aria-invalid");
  };

  const findCell = (query) => {
    const trimmed = query.trim();
    if (/^\d+$/.test(trimmed)) return payload.cells[Number(trimmed) - 1];
    return cellsByBarcode.get(trimmed.toUpperCase());
  };

  const splitMessage = (cell) => {
    if (cell.annotation_only) {
      return "This dendritic identity comes from the reviewed PBMC4k marker annotation. Dendritic cells were outside the six-class XGBoost model, so no model confidence is shown.";
    }
    if (cell.split === "external") {
      return "This PBMC4k cell is from a different donor and was never used to train the PBMC3k model. Its probabilities were combined into six broad cell categories.";
    }
    if (cell.split === "test") {
      return "This cell was in the untouched test set. XGBoost did not see it while learning or while the model family was selected, so this is the fairest PBMC3k example.";
    }
    if (cell.split === "validation") {
      return "This cell was not used to fit XGBoost, but its split helped compare model families. Treat it as a model-selection example, not a final test.";
    }
    return "This cell was in the training set, so XGBoost learned from it. Its confidence may be higher than for a genuinely new cell.";
  };

  const renderProbabilities = (cell) => {
    const probabilities = payload.classes
      .map((name, index) => ({ name, value: cell.probabilities[index] }))
      .filter(({ value }) => Number((value * 100).toFixed(1)) > 0)
      .sort((left, right) => right.value - left.value);

    probabilityBars.replaceChildren();
    probabilities.forEach(({ name, value }) => {
      const row = document.createElement("div");
      row.className = "probability-row";
      const label = document.createElement("div");
      label.className = "probability-label";
      const nameElement = document.createElement("span");
      nameElement.textContent = name;
      const valueElement = document.createElement("strong");
      valueElement.textContent = `${(value * 100).toFixed(1)}%`;
      label.append(nameElement, valueElement);
      const track = document.createElement("div");
      track.className = "probability-track";
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-label", name);
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", "100");
      track.setAttribute("aria-valuenow", (value * 100).toFixed(1));
      const fill = document.createElement("span");
      fill.style.setProperty("--probability", `${value * 100}%`);
      track.appendChild(fill);
      row.append(label, track);
      probabilityBars.appendChild(row);
    });
  };

  const renderCell = (cell) => {
    const annotationOnly = Boolean(cell.annotation_only);
    const matchesReview = cell.predicted === cell.reviewed;
    setText("result-label", annotationOnly ? "Reviewed annotation" : "XGBoost predicts");
    setText("predicted-type", cell.predicted);
    setText("confidence-value", annotationOnly ? "—" : `${(cell.confidence * 100).toFixed(1)}%`);
    setText("result-number", cell.number.toLocaleString());
    setText("result-barcode", cell.barcode);
    setText("result-split", formatSplit(cell.split));
    setText("result-reviewed", cell.reviewed);
    setText("result-verdict", annotationOnly
      ? "Reviewed markers identify this cell as dendritic; this is not an XGBoost prediction."
      : matchesReview
        ? "The prediction matches the reviewed cell label."
        : "The prediction differs from the reviewed cell label.");
    document.getElementById("result-verdict").className =
      `result-verdict ${annotationOnly || matchesReview ? "is-match" : "is-different"}`;
    setText("split-note", splitMessage(cell));
    confidenceDial.hidden = annotationOnly;
    probabilitySection.hidden = annotationOnly;
    if (!annotationOnly) renderProbabilities(cell);
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const activateDataset = (key, preserveQuery) => {
    payload = payloads.get(key);
    cellsByBarcode = new Map();
    payload.cells.forEach((cell) => {
      cellsByBarcode.set(cell.barcode.toUpperCase(), cell);
      if (cell.cell_id) cellsByBarcode.set(cell.cell_id.toUpperCase(), cell);
    });
    datasetButtons.forEach((button) => {
      const isActive = button.dataset.dataset === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    setText("console-kicker", `${datasets[key].label} lookup`);
    setText("predictor-description", datasets[key].description);
    setText("method-note", `${datasets[key].method} This demo only looks up saved results and does not accept new sequencing data. Model confidence is not biological certainty.`);
    setText("cell-help", `Use a number from 1 to ${payload.cell_count.toLocaleString()}, or a complete cell barcode.`);
    status.innerHTML = `<span class="status-dot" aria-hidden="true"></span>Ready · ${payload.cell_count.toLocaleString()} cells`;
    status.className = "model-status is-ready";
    result.hidden = true;
    clearError();
    if (!preserveQuery) queryInput.value = "";
    const url = new URL(window.location.href);
    url.searchParams.set("dataset", key);
    url.searchParams.delete("cell");
    window.history.replaceState({}, "", url);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();
    const cell = findCell(queryInput.value);
    if (!cell) {
      showError(`No such cell found. Enter a number from 1 to ${payload.cell_count.toLocaleString()} or a complete barcode.`);
      return;
    }
    queryInput.value = String(cell.number);
    renderCell(cell);
  });

  randomButton.addEventListener("click", () => {
    clearError();
    const cell = payload.cells[Math.floor(Math.random() * payload.cells.length)];
    queryInput.value = String(cell.number);
    renderCell(cell);
  });

  datasetButtons.forEach((button) => button.addEventListener("click", () => {
    activateDataset(button.dataset.dataset, false);
    queryInput.focus();
  }));

  Promise.all(Object.entries(datasets).map(([key, config]) =>
    fetch(new URL(config.url, document.baseURI))
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        return response.json();
      })
      .then((data) => payloads.set(key, data))
  )).then(() => {
    queryInput.disabled = false;
    predictButton.disabled = false;
    randomButton.disabled = false;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("dataset");
    activateDataset(requested in datasets ? requested : "pbmc3k", true);
    const initialCell = params.get("cell");
    if (initialCell) {
      queryInput.value = initialCell;
      form.requestSubmit();
    } else {
      queryInput.focus();
    }
  }).catch(() => {
    status.innerHTML = '<span class="status-dot" aria-hidden="true"></span>Data unavailable';
    status.className = "model-status is-error";
    error.textContent = "The prediction data could not be loaded. Please refresh the page and retry.";
    error.hidden = false;
  });
})();
