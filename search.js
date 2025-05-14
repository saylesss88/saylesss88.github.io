function debounce(func, wait) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

// Fetch search index correctly as JSON
async function loadSearchIndex() {
  try {
    const response = await fetch("/search_index.en.json");
    const data = await response.json();
    window.searchIndex = elasticlunr.Index.load(data);
    console.log("Search index successfully loaded:", window.searchIndex);
  } catch (error) {
    console.error("Failed to load search index:", error);
  }
}

// Ensure index is fully loaded before calling search functions
document.addEventListener("DOMContentLoaded", async () => {
  await loadSearchIndex();  // Wait for search index to load
  initSearch(); // Start search functionality
});


// Function to extract and highlight search results
function formatSearchResultItem(item, terms) {
  const post = window.searchIndex.documentStore.docs[item.ref];

  if (!post || !post.permalink) {
    console.warn(`Missing permalink for search result ref: ${item.ref}`);
    return `<div class="search-results__item">No valid link found.</div>`;
  }

  return `<div class="search-results__item">
            <a href="${post.permalink}">${post.title}</a>
            <div>${makeTeaser(post.body, terms)}</div>
          </div>`;
}

// Initialize search functionality
async function initSearch() {
  const $searchInput = document.getElementById("search");
  const $searchResults = document.querySelector(".search-results");
  const $searchResultsItems = document.querySelector(".search-results__items");
  const MAX_ITEMS = 10;
  const options = { bool: "AND", fields: { title: { boost: 2 }, body: { boost: 1 } } };

  await loadSearchIndex(); // Ensure index is loaded first

  $searchInput.addEventListener("keyup", debounce(async function() {
    const term = $searchInput.value.trim();
    $searchResults.style.display = term ? "block" : "none";
    $searchResultsItems.innerHTML = "";

    if (!term) return;

    const results = window.searchIndex.search(term, options);
    if (results.length === 0) {
      $searchResults.style.display = "none";
      return;
    }

    for (let i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
      const item = document.createElement("li");
      item.innerHTML = formatSearchResultItem(results[i], term.split(" "));
      $searchResultsItems.appendChild(item);
    }
  }, 150));

  window.addEventListener("click", function(e) {
    if ($searchResults.style.display === "block" && !$searchResults.contains(e.target)) {
      $searchResults.style.display = "none";
    }
  });
}

// Ensure search initializes once DOM is ready
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  initSearch();
} else {
  document.addEventListener("DOMContentLoaded", initSearch);
}
