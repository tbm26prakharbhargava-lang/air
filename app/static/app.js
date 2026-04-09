const state = {
  samples: [],
  packets: [],
  activeRunId: null,
};

function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (text !== undefined) {
    el.textContent = text;
  }
  return el;
}

function showToast(message, kind = "info") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { error: text || `Request failed with ${response.status}` };
  }
  if (!response.ok) {
    throw new Error(payload.error || text || `Request failed with ${response.status}`);
  }
  return payload;
}

function formatJson(payload) {
  return JSON.stringify(payload ?? {}, null, 2);
}

function setDefaults() {
  $("#policy-name").value = "Pradhan Mantri Jan Arogya Yojana (PM-JAY)";
  $("#policy-question").value =
    "Assess the policy and implementation implications of expanding PM-JAY coverage to all senior citizens aged 70 and above in India.";
  $("#capture-publisher").value = "Press Information Bureau";
  $("#capture-ministry").value = "Ministry of Health and Family Welfare";
  $("#capture-sector").value = "Health";
}

function buildAnalyzePayload() {
  return {
    policy_name: $("#policy-name").value.trim(),
    policy_question: $("#policy-question").value.trim(),
    packets: state.packets,
  };
}

function renderPackets() {
  const container = $("#packet-list");
  container.innerHTML = "";
  $("#packet-count").textContent = `${state.packets.length} packet${state.packets.length === 1 ? "" : "s"}`;

  if (!state.packets.length) {
    container.appendChild(createEl("div", "empty-state", "No source packets loaded yet."));
    return;
  }

  state.packets.forEach((packet, index) => {
    const card = createEl("article", "packet-card");
    const title = createEl("h4", "", packet.title || `Packet ${index + 1}`);
    const meta = createEl(
      "div",
      "packet-meta",
      `Tier ${packet.source_tier ?? "?"} • ${packet.publisher || "Unknown publisher"} • ${packet.document_type || "Unknown type"}`
    );
    const summary = createEl("p", "", packet.summary || "No summary available.");
    const remove = createEl("button", "pill-button danger", "Remove");
    remove.type = "button";
    remove.addEventListener("click", () => {
      state.packets.splice(index, 1);
      renderPackets();
    });
    card.append(title, meta, summary, remove);
    container.appendChild(card);
  });
}

function renderSampleList() {
  const list = $("#sample-list");
  list.innerHTML = "";
  if (!state.samples.length) {
    list.appendChild(createEl("div", "empty-state", "No sample workflows configured."));
    return;
  }

  state.samples.forEach((sample) => {
    const button = createEl("button", "sample-button");
    button.type = "button";
    button.innerHTML = `<strong>${sample.name}</strong><span>${sample.description}</span>`;
    button.addEventListener("click", () => loadSample(sample.id));
    list.appendChild(button);
  });

  const select = $("#sample-select");
  select.innerHTML = "";
  const placeholder = createEl("option", "", "Choose a sample dataset");
  placeholder.value = "";
  select.appendChild(placeholder);
  state.samples.forEach((sample) => {
    const option = createEl("option", "", sample.name);
    option.value = sample.id;
    select.appendChild(option);
  });
}

function renderRunHistory(runs) {
  const list = $("#run-history");
  list.innerHTML = "";
  if (!runs.length) {
    list.appendChild(createEl("div", "empty-state", "No saved runs yet."));
    return;
  }

  runs.forEach((run) => {
    const button = createEl("button", "run-button");
    button.type = "button";
    if (run.run_id === state.activeRunId) {
      button.classList.add("active");
    }
    button.innerHTML = `
      <strong>${run.policy_name}</strong>
      <span>${run.created_at || "Unknown time"}</span>
      <span>${run.packet_count} packets • ${run.verdict_confidence} confidence</span>
    `;
    button.addEventListener("click", () => loadRun(run.run_id));
    list.appendChild(button);
  });
}

function renderBrief(brief, markdown) {
  $("#brief-json").textContent = formatJson(brief);
  $("#brief-markdown").textContent = markdown || "No executive brief generated.";

  const verdictCard = $("#verdict-card");
  verdictCard.innerHTML = "";
  verdictCard.classList.remove("empty-state");
  verdictCard.appendChild(createEl("div", "brand-kicker", brief?.verdict_confidence || "UNKNOWN"));
  verdictCard.appendChild(createEl("p", "verdict-text", brief?.one_line_verdict || "No verdict generated."));

  const list = $("#recommendations-list");
  list.innerHTML = "";
  (brief?.recommendations || []).forEach((recommendation) => {
    const item = createEl("li", "recommendation-item");
    item.innerHTML = `
      <strong>${recommendation.action}</strong>
      <span>${recommendation.lead_agency}</span>
      <p>${recommendation.rationale}</p>
      <small>${recommendation.confidence} confidence • ${recommendation.timeline}</small>
    `;
    list.appendChild(item);
  });
}

function renderExtraction(extraction) {
  $("#extraction-json").textContent = formatJson(extraction);

  const summary = $("#extraction-summary");
  summary.innerHTML = "";
  summary.classList.remove("empty-state");
  const rows = [
    ["Ministry owner", extraction?.ministry_owner || "Unknown"],
    ["Sector", extraction?.sector || "Unknown"],
    ["Launch year", extraction?.launch_year ?? "Unknown"],
    ["Primary group", extraction?.target_beneficiaries?.primary_group || "Unknown"],
    ["Top bottleneck", extraction?.implementation_status?.top_bottleneck || "Unknown"],
    ["Top recommendation", extraction?.top_recommendation?.action || "Unknown"],
  ];
  rows.forEach(([label, value]) => {
    const row = createEl("div", "summary-row");
    row.appendChild(createEl("span", "summary-label", label));
    row.appendChild(createEl("span", "summary-value", String(value)));
    summary.appendChild(row);
  });
}

function renderEvidence(packets) {
  const table = $("#evidence-table-body");
  table.innerHTML = "";
  if (!packets.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="5" class="empty-state">No evidence packets in the current run.</td>';
    table.appendChild(row);
    return;
  }

  packets.forEach((packet) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${packet.title || "Unknown"}</td>
      <td>Tier ${packet.source_tier ?? "?"}</td>
      <td>${packet.publisher || "Unknown"}</td>
      <td>${packet.document_type || "Unknown"}</td>
      <td>${packet.summary || "No summary"}</td>
    `;
    table.appendChild(row);
  });
}

async function refreshRuns() {
  const payload = await fetchJson("/api/runs");
  renderRunHistory(payload.runs || []);
}

async function loadSamples() {
  const payload = await fetchJson("/api/samples");
  state.samples = payload.samples || [];
  renderSampleList();
}

async function loadSample(sampleId) {
  const payload = await fetchJson(`/api/samples/${sampleId}`);
  $("#policy-name").value = payload.policy_name || "";
  $("#policy-question").value = payload.policy_question || "";
  state.packets = payload.packets || [];
  renderPackets();
  showToast(`Loaded sample: ${payload.name}`, "success");
}

async function loadRun(runId) {
  const payload = await fetchJson(`/api/runs/${runId}`);
  state.activeRunId = runId;
  $("#policy-name").value = payload.metadata?.policy_name || "";
  $("#policy-question").value = payload.metadata?.policy_question || "";
  state.packets = payload.packets || [];
  renderPackets();
  renderBrief(payload.brief, payload.brief_markdown);
  renderExtraction(payload.extraction);
  renderEvidence(payload.packets || []);
  await refreshRuns();
  showToast("Loaded saved run.", "success");
}

async function runAnalysis() {
  const payload = buildAnalyzePayload();
  if (!payload.policy_name || !payload.policy_question) {
    showToast("Policy name and policy question are required.", "error");
    return;
  }
  if (!payload.packets.length) {
    showToast("Add at least one packet before running analysis.", "error");
    return;
  }

  const button = $("#run-analysis");
  button.disabled = true;
  button.textContent = "Running...";
  try {
    const result = await fetchJson("/api/analyze-packets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    state.activeRunId = result.run_id;
    renderBrief(result.brief, result.brief_markdown);
    renderExtraction(result.extraction);
    renderEvidence(result.packets || []);
    await refreshRuns();
    showToast("Analysis complete.", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Run analysis";
  }
}

async function uploadPackets(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    return;
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const payload = await fetchJson("/api/upload-packets", {
      method: "POST",
      body: formData,
    });
    state.packets.push(...(payload.packets || []));
    renderPackets();
    showToast(`Added ${payload.packets.length} packet${payload.packets.length === 1 ? "" : "s"}.`, "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    event.target.value = "";
  }
}

async function captureSource() {
  const payload = {
    url: $("#capture-url-input").value.trim(),
    publisher: $("#capture-publisher").value.trim(),
    published_at: "Unknown",
    source_tier: Number($("#capture-tier").value),
    document_type: $("#capture-document-type").value.trim(),
    ministry_owner: $("#capture-ministry").value.trim(),
    sector: $("#capture-sector").value.trim(),
    jurisdiction: $("#capture-jurisdiction").value.trim() || "India",
    title: "",
    use_openclaw: $("#capture-openclaw").value === "true",
    browser_profile: "openclaw",
  };

  if (!payload.url || !payload.publisher || !payload.document_type || !payload.ministry_owner || !payload.sector) {
    showToast("Fill all live capture fields before capturing.", "error");
    return;
  }

  const button = $("#capture-url");
  button.disabled = true;
  button.textContent = "Capturing...";
  try {
    const result = await fetchJson("/api/capture-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    state.packets.push(result.packet);
    renderPackets();
    showToast("Captured source packet.", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = "Capture source";
  }
}

function bindEvents() {
  $("#run-analysis").addEventListener("click", runAnalysis);
  $("#load-demo").addEventListener("click", () => loadSample("pmjay-demo"));
  $("#sample-select").addEventListener("change", (event) => {
    if (event.target.value) {
      loadSample(event.target.value);
    }
  });
  $("#upload-input").addEventListener("change", uploadPackets);
  $("#capture-url").addEventListener("click", captureSource);
  $("#clear-packets").addEventListener("click", () => {
    state.packets = [];
    renderPackets();
  });
}

async function bootstrap() {
  setDefaults();
  bindEvents();
  renderPackets();
  renderEvidence([]);
  await Promise.all([loadSamples(), refreshRuns()]);
}

window.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error(error);
    showToast(`Failed to load app: ${error.message}`, "error");
  });
});
