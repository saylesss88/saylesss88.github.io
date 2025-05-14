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

  // Ensure path exists before using it
  const permalink = post.path ? `${baseUrl}${post.path}` : item.ref;
  if (!post.path) {
    console.warn(`Missing path for search result ref: ${item.ref}, using ref as fallback.`);
  }

  return `<a href="${permalink}">${post.title || "Untitled"}</a>`;
}

// Initialize search functionality
async function initSearch() {
  const $searchInput = document.getElementById("search");
  const $searchResults = document.querySelector(".search-results");
  const $searchResultsItems = document.querySelector(".search-results__items");
  const MAX_ITEMS = 10;
  const options = { bool: "OR", expand: true, fields: { title: { boost: 2 }, body: { boost: 1 }, path: { boost: 1 } } };

  await loadSearchIndex(); // Ensure index is loaded first

  $searchInput.addEventListener("keyup", debounce(async function () {
    console.log("Search triggered!");

    const term = $searchInput.value.trim();
    console.log("Search term:", term);

    $searchResultsItems.innerHTML = "";
    $searchResults.style.display = term ? "block" : "none";

    if (!term) return;

    const results = window.searchIndex.search(term, options);
    console.log("Search results:", results);

    if (results.length > 0) {
      results.forEach(result => {
        const post = window.searchIndex.documentStore.docs[result.ref];
        console.log("Adding result to UI:", post);

        const listItem = document.createElement("li");
        listItem.innerHTML = formatSearchResultItem(result, term.split(" "));
        $searchResultsItems.appendChild(listItem);
      });
      $searchResults.style.display = "block";
    } else {
      console.log("No matching results.");
      $searchResults.style.display = "none";
    }
  }, 150));

  window.addEventListener("click", function (e) {
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
