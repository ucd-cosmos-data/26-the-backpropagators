(function () {
  "use strict";

  const root = document.getElementById("cell-predictor");
  if (!root) return;

  const form = document.getElementById("cell-form");
  const queryInput = document.getElementById("cell-query");
  const predictButton = document.getElementById("predict-button");
  const randomButton = document.getElementById("random-cell");
  const status = document.getElementById("model-status");
  const error = document.getElementById("cell-error");
  const result = document.getElementById("prediction-result");
  const probabilityBars = document.getElementById("probability-bars");

  let payload;
  let cellsByBarcode;

  const setText = (id, value) => {
    document.getElementById(id).textContent = value;
  };

  const formatSplit = (split) => {
    const labels = {
      training: "Training",
      validation: "Validation",
      test: "Untouched test"
    };
    return labels[split] || split;
  };

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
    if (/^\d+$/.test(trimmed)) {
      const number = Number(trimmed);
      return payload.cells[number - 1];
    }
    return cellsByBarcode.get(trimmed.toUpperCase());
  };

  const splitMessage = (cell) => {
    if (cell.split === "test") {
      return "This cell was in the untouched test set. XGBoost did not see it while learning or while the model family was selected, so this is the fairest kind of example.";
    }
    if (cell.split === "validation") {
      return "This cell was not used to fit XGBoost, but its split helped compare model families. Treat the result as a model-selection example, not a final test.";
    }
    return "This cell was in the training set, so XGBoost learned from it. Its confidence here may be higher than the confidence you would expect for a really new cell.";
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
    const matchesReview = cell.predicted === cell.reviewed;
    setText("predicted-type", cell.predicted);
    setText("confidence-value", `${(cell.confidence * 100).toFixed(1)}%`);
    setText("result-number", cell.number.toLocaleString());
    setText("result-barcode", cell.barcode);
    setText("result-split", formatSplit(cell.split));
    setText("result-reviewed", cell.reviewed);
    setText(
      "result-verdict",
      matchesReview
        ? "The prediction matches the reviewed cell label."
        : "The prediction differs from the reviewed cell label."
    );
    document.getElementById("result-verdict").className =
      `result-verdict ${matchesReview ? "is-match" : "is-different"}`;
    setText("split-note", splitMessage(cell));
    renderProbabilities(cell);
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();
    const cell = findCell(queryInput.value);
    if (!cell) {
      showError(
        `No such cell found. Please enter a number from 1 to ${payload.cell_count.toLocaleString()} or a complete barcode.`
      );
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

  fetch(new URL("../data/pbmc3k-cell-predictions.json", document.baseURI))
    .then((response) => {
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      return response.json();
    })
    .then((data) => {
      payload = data;
      cellsByBarcode = new Map(
        data.cells.map((cell) => [cell.barcode.toUpperCase(), cell])
      );
      queryInput.disabled = false;
      predictButton.disabled = false;
      randomButton.disabled = false;
      status.innerHTML =
        `<span class="status-dot" aria-hidden="true"></span>Ready · ${data.cell_count.toLocaleString()} cells`;
      status.classList.add("is-ready");
      const initialCell = new URLSearchParams(window.location.search).get("cell");
      if (initialCell) {
        queryInput.value = initialCell;
        form.requestSubmit();
      } else {
        queryInput.focus();
      }
    })
    .catch(() => {
      status.innerHTML = '<span class="status-dot" aria-hidden="true"></span>Data unavailable';
      status.classList.add("is-error");
      error.textContent = "The prediction data could not be loaded. Please refresh the page and retry.";
      error.hidden = false;
    });
})();
