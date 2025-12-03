function setup() {
  const allEpisodes = getAllEpisodes(); // provided by episodes.js
  makePageForEpisodes(allEpisodes);
}

function formatEpisodeCode(season, number) {
  // Format like S01E01
  const s = String(season).padStart(2, "0");
  const e = String(number).padStart(2, "0");
  return `S${s}E${e}`;
}

function makeEpisodeCard(episode) {
  // Destructure the values we need
  const { name, season, number, image, summary, runtime, airdate } = episode;

  // Create article (semantic)
  const article = document.createElement("article");
  article.className = "episode";
  article.setAttribute("tabindex", "0"); // make focusable for keyboard users
  article.setAttribute("aria-labelledby", `title-${season}-${number}`);

  // Header with title and meta
  const header = document.createElement("header");
  header.className = "episode-header";

  const h2 = document.createElement("h2");
  h2.id = `title-${season}-${number}`;
  h2.textContent = `${formatEpisodeCode(season, number)} - ${name}`;
  header.appendChild(h2);

  const meta = document.createElement("p");
  meta.className = "episode-meta";
  meta.textContent = `Airdate: ${airdate || "Unknown"} • Runtime: ${
    runtime ? runtime + " min" : "Unknown"
  }`;
  header.appendChild(meta);

  article.appendChild(header);

  // Image (if provided) with accessible alt text
  if (image && image.medium) {
    const img = document.createElement("img");
    img.src = image.medium;
    img.alt = `${name} (Season ${season} Episode ${number})`;
    img.loading = "lazy";
    img.className = "episode-image";
    article.appendChild(img);
  }

  // Summary: the API summary contains HTML; preserve it but ensure it's safe

  const summarySection = document.createElement("section");
  summarySection.className = "episode-summary";
  summarySection.innerHTML = summary || "<p>No summary available.</p>";
  article.appendChild(summarySection);

  return article;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  // clear previous content
  rootElem.innerHTML = "";

  // Top heading and count (semantic)
  const main = document.createElement("main");
  main.className = "site-main";

  const heading = document.createElement("h1");
  heading.textContent = "TV Show Episodes";
  main.appendChild(heading);

  // Episode count
  const count = document.createElement("p");
  count.className = "episode-count";
  count.textContent = `Showing ${episodeList.length} episode(s)`;
  main.appendChild(count);

  // --- ADD SEARCH BOX ---
  const searchLabel = document.createElement("label");
  searchLabel.textContent = "Search episodes: ";
  searchLabel.setAttribute("for", "search-input");

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Type to search by name or summary...";

  searchLabel.appendChild(searchInput);
  main.appendChild(searchLabel);
  // ----------------------

  // Container for episodes
  const list = document.createElement("section");
  list.className = "episode-grid";
  list.setAttribute("aria-label", "Episodes list");

  // Create and append each episode card
  episodeList.forEach((ep) => {
    const card = makeEpisodeCard(ep);
    list.appendChild(card);
  });

  main.appendChild(list);
  rootElem.appendChild(main);

  function setup() {
  const allEpisodes = getAllEpisodes(); // provided by episodes.js
  makePageForEpisodes(allEpisodes);
}

function formatEpisodeCode(season, number) {
  // Format like S01E01
  const s = String(season).padStart(2, "0");
  const e = String(number).padStart(2, "0");
  return `S${s}E${e}`;
}

function makeEpisodeCard(episode) {
  // Destructure the values we need
  const { name, season, number, image, summary, runtime, airdate } = episode;

  // Create article (semantic)
  const article = document.createElement("article");
  article.className = "episode";
  article.setAttribute("tabindex", "0"); // make focusable for keyboard users
  article.setAttribute("aria-labelledby", `title-${season}-${number}`);

  // Header with title and meta
  const header = document.createElement("header");
  header.className = "episode-header";

  const h2 = document.createElement("h2");
  h2.id = `title-${season}-${number}`;
  h2.textContent = `${formatEpisodeCode(season, number)} - ${name}`;
  header.appendChild(h2);

  const meta = document.createElement("p");
  meta.className = "episode-meta";
  meta.textContent = `Airdate: ${airdate || "Unknown"} • Runtime: ${
    runtime ? runtime + " min" : "Unknown"
  }`;
  header.appendChild(meta);

  article.appendChild(header);

  // Image (if provided) with accessible alt text
  if (image && image.medium) {
    const img = document.createElement("img");
    img.src = image.medium;
    img.alt = `${name} (Season ${season} Episode ${number})`;
    img.loading = "lazy";
    img.className = "episode-image";
    article.appendChild(img);
  }

  // Summary: the API summary contains HTML; preserve it but ensure it's safe

  const summarySection = document.createElement("section");
  summarySection.className = "episode-summary";
  summarySection.innerHTML = summary || "<p>No summary available.</p>";
  article.appendChild(summarySection);

  return article;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  // clear previous content
  rootElem.innerHTML = "";

  // Top heading and count (semantic)
  const main = document.createElement("main");
  main.className = "site-main";

  const heading = document.createElement("h1");
  heading.textContent = "TV Show Episodes";
  main.appendChild(heading);

  // Episode count
  const count = document.createElement("p");
  count.className = "episode-count";
  count.textContent = `Showing ${episodeList.length} episode(s)`;
  main.appendChild(count);

  // --- ADD SEARCH BOX ---
  const searchLabel = document.createElement("label");
  searchLabel.textContent = "Search episodes: ";
  searchLabel.setAttribute("for", "search-input");

  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Type to search by name or summary...";

  searchLabel.appendChild(searchInput);
  main.appendChild(searchLabel);
  // ----------------------

  // Container for episodes
  const list = document.createElement("section");
  list.className = "episode-grid";
  list.setAttribute("aria-label", "Episodes list");

  // Create and append each episode card
  episodeList.forEach((ep) => {
    const card = makeEpisodeCard(ep);
    list.appendChild(card);
  });

  main.appendChild(list);
  rootElem.appendChild(main);
}

// --- HANDLE LIVE SEARCH ---
searchInput.addEventListener("input", () => {
  // Get the current value from the search input and convert it to lowercase for case-insensitive search
  const term = searchInput.value.toLowerCase();

  // Initialize a counter to track how many episodes match the search term
  let matched = 0;

  // Convert the HTMLCollection of episode cards to an array so we can use forEach
  Array.from(list.children).forEach((card, i) => {
    // Get the corresponding episode object from the episodeList array
    const ep = episodeList[i];

    // Check if the episode name or summary contains the search term
    // summary may be undefined, so we check it exists first
    const isMatch =
      ep.name.toLowerCase().includes(term) ||
      (ep.summary && ep.summary.toLowerCase().includes(term));

    // If the episode matches, show it and increase the matched counter
    if (isMatch) {
      card.style.display = "";
      matched++;
    } else {
      // If it doesn't match, hide the episode card
      card.style.display = "none";
    }
  });

  // Update the episode count paragraph to show how many episodes are currently displayed
  count.textContent = `Showing ${matched} episode(s)`;
});

window.onload = setup;

}


window.onload = setup;
