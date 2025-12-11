// --- Global data (filled AFTER fetch) ---
let allEpisodes = [];

// --- DOM references / build UI ---
const root = document.getElementById("root");

// Build header
const header = document.createElement("header");
const title = document.createElement("h1");
title.textContent = "TV Show Episodes";
title.id = "pageTitle";

// Controls container
const controls = document.createElement("div");
controls.className = "controls";

// --- Show selector dropdown (Requirement 1) ---
const showSelect = document.createElement("select");
showSelect.id = "showSelect";
showSelect.setAttribute("aria-label", "Select show");
showSelect.disabled = true; // disabled until shows are loaded

// Search bar
const searchBar = document.createElement("input");
searchBar.type = "search";
searchBar.placeholder = "Search episodes...";
searchBar.id = "searchBar";
searchBar.setAttribute("aria-label", "Search episodes");
searchBar.disabled = true; // disabled until data loaded

// Episode dropdown
const episodeSelect = document.createElement("select");
episodeSelect.id = "episodeSelect";
episodeSelect.setAttribute("aria-label", "Select episode");
episodeSelect.disabled = true; // disabled until data loaded

// Episode count label
const countLabel = document.createElement("span");
countLabel.className = "episode-count";
countLabel.setAttribute("aria-live", "polite"); // announce changes

// Append controls: showSelect first
controls.appendChild(showSelect);
controls.appendChild(searchBar);
controls.appendChild(episodeSelect);
controls.appendChild(countLabel);

header.appendChild(title);
header.appendChild(controls);
root.appendChild(header);

// Container for episodes and loading/error
const episodeContainer = document.createElement("section");
episodeContainer.id = "episodes";
root.appendChild(episodeContainer);

// Utility: format SxxExx
function formatCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(
    2,
    "0",
  )}`;
}

// Utility: safe text extractor (summary may be null and may contain HTML)
function extractSummaryText(summaryHtml) {
  if (!summaryHtml) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = summaryHtml;
  return tmp.textContent || tmp.innerText || "";
}

// --- Show loading UI (visible) ---
function showLoadingUI() {
  // disable controls while loading
  searchBar.disabled = true;
  episodeSelect.disabled = true;
  showSelect.disabled = true;

  episodeContainer.innerHTML = "";
  const loading = document.createElement("div");
  loading.setAttribute("role", "status");
  loading.className = "loading";
  loading.innerHTML = `<p>Loading episodes… please wait.</p>`;
  episodeContainer.appendChild(loading);
}

// --- Show error UI with Retry ---
function showErrorUI(
  message = "Failed to load episodes. Please check your connection.",
) {
  episodeContainer.innerHTML = "";
  const err = document.createElement("div");
  err.className = "error";
  err.setAttribute("role", "alert");
  err.innerHTML = `<p>${message}</p>`;

  const retryBtn = document.createElement("button");
  retryBtn.type = "button";
  retryBtn.textContent = "Retry";
  retryBtn.addEventListener("click", () => {
    fetchAndInit();
  });

  err.appendChild(retryBtn);
  episodeContainer.appendChild(err);

  // keep controls disabled
  searchBar.disabled = true;
  episodeSelect.disabled = true;
  showSelect.disabled = true;
}

// --- Fetch episodes once and initialize UI ---
async function fetchEpisodesOnce() {
  const url = "https://api.tvmaze.com/shows/82/episodes";
  const resp = await APICache.fetch(url);
  return resp;
}

async function fetchAndInit() {
  showLoadingUI();
  try {
    const episodes = await fetchEpisodesOnce();
    // Cache once
    allEpisodes = episodes;
    initUIWithData(allEpisodes);
  } catch (err) {
    console.error("Failed to load episodes:", err);
    showErrorUI("❌ Failed to load episodes. Please refresh or try Retry.");
  }
}

// --- Initialize controls and rendering once we have data ---
function initUIWithData(episodes) {
  // populate episode dropdown
  makeEpisodeDropdown(episodes);

  // enable controls
  searchBar.disabled = false;
  episodeSelect.disabled = false;
  showSelect.disabled = false;

  // render all episodes
  renderEpisodes(episodes);
  updateCount(episodes.length);

  // Search handler (debounced)
  let timer = null;
  searchBar.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => applyFilters(), 180);
  });

  // Select handler
  episodeSelect.addEventListener("change", () => applyFilters());
}

// --- Apply filters using cached allEpisodes (no new fetches) ---
function applyFilters() {
  if (!Array.isArray(allEpisodes)) return;

  const q = (searchBar.value || "").trim().toLowerCase();
  const selectedVal = episodeSelect.value;

  let results = allEpisodes;

  // If a specific episode selected
  if (selectedVal && selectedVal !== "all") {
    const found = allEpisodes.find(
      (ep) => String(ep.id) === String(selectedVal),
    );
    if (!found) {
      renderNoResults();
      updateCount(0);
      return;
    }
    results = [found];
    renderEpisodes(results);
    updateCount(1);
    return;
  }

  // Otherwise filter by query (title, summary text, or code)
  if (q) {
    results = allEpisodes.filter((ep) => {
      const title = (ep.name || "").toLowerCase();
      const summaryText = extractSummaryText(ep.summary).toLowerCase();
      const code = formatCode(ep.season, ep.number).toLowerCase();
      return title.includes(q) || summaryText.includes(q) || code.includes(q);
    });
  }

  if (results.length === 0) {
    renderNoResults();
  } else {
    renderEpisodes(results);
  }
  updateCount(results.length);
}

// --- Render "no results" message ---
function renderNoResults() {
  episodeContainer.innerHTML = `<p>No episodes found.</p>`;
}

// --- Render episode cards (handles missing images & missing summary) ---
function renderEpisodes(list) {
  episodeContainer.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "episode-grid";

  list.forEach((ep) => {
    const card = document.createElement("article");
    card.className = "episode";
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-labelledby", `title-${ep.id}`);
    card.dataset.episodeId = ep.id;

    const header = document.createElement("header");
    header.className = "episode-header";

    const h2 = document.createElement("h2");
    h2.id = `title-${ep.id}`;
    h2.textContent = `${formatCode(ep.season, ep.number)} - ${
      ep.name || "Untitled"
    }`;
    header.appendChild(h2);

    const meta = document.createElement("p");
    meta.className = "episode-meta";
    meta.textContent = `Airdate: ${ep.airdate || "Unknown"} • Runtime: ${
      ep.runtime ? ep.runtime + " min" : "Unknown"
    }`;
    header.appendChild(meta);

    card.appendChild(header);

    if (ep.image && (ep.image.medium || ep.image.original)) {
      const img = document.createElement("img");
      img.className = "episode-image";
      img.src = ep.image.medium || ep.image.original;
      img.alt = `${ep.name || "Episode image"}`;
      img.loading = "lazy";
      card.appendChild(img);
    }

    const summarySection = document.createElement("section");
    summarySection.className = "episode-summary";
    summarySection.setAttribute("aria-label", "Episode summary");
    summarySection.innerHTML = ep.summary || "<p>No summary available.</p>";
    card.appendChild(summarySection);

    grid.appendChild(card);
  });

  episodeContainer.appendChild(grid);
}

// --- Build dropdown options ---
function makeEpisodeDropdown(episodes) {
  episodeSelect.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "all";
  defaultOpt.textContent = "All Episodes";
  episodeSelect.appendChild(defaultOpt);

  episodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${formatCode(ep.season, ep.number)} - ${
      ep.name || "Untitled"
    }`;
    episodeSelect.appendChild(opt);
  });
}

// --- Update visible count label ---
function updateCount(n) {
  countLabel.textContent = `Showing ${n} episode(s)`;
}

// --- Start app (fetch once) ---
fetchAndInit();
