function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

// Fetch search index correctly as JSON
async function loadSearchIndex() {
  // Check if already loaded
  if (window.searchIndex) {
    console.log("Search index already loaded");
    return;
  }
  
  try {
    console.log("Loading search index...");
    const response = await fetch("/search_index.en.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    window.searchIndex = elasticlunr.Index.load(data);
    console.log("Search index successfully loaded:", window.searchIndex);
  } catch (error) {
    console.error("Failed to load search index:", error);
  }
}

// Function to extract and highlight search results
function formatSearchResultItem(item) {
  const post = window.searchIndex.documentStore.getDoc(item.ref);
  
  // Use safer property access
  if (!post) {
    console.error(`Missing document for ref: ${item.ref}`);
    return `<a href="${item.ref}">${item.ref}</a>`;
  }
  
  // Ensure path exists and handle properly
  const permalink = post.path ? `${baseUrl || ''}${post.path}` : item.ref;
  
  return `<a href="${permalink}">${post.title || "Untitled"}</a>`;
}

// Initialize search functionality
async function initSearch() {
  const $searchInput = document.getElementById("search");
  const $searchResults = document.querySelector(".search-results");
  const $searchResultsItems = document.querySelector(".search-results__items");
  
  // Exit if search elements don't exist on the page
  if (!$searchInput || !$searchResults || !$searchResultsItems) {
    console.log("Search elements not found on page");
    return;
  }
  
  // Make sure index is loaded
  await loadSearchIndex();
  
  // Search options
  const options = { 
    bool: "OR", 
    expand: true, 
    fields: { 
      title: { boost: 2 }, 
      body: { boost: 1 }, 
      path: { boost: 1 } 
    } 
  };
  
  // Handle search input with debouncing
  $searchInput.addEventListener("input", debounce(function () {
    const term = $searchInput.value.trim();
    console.log("Search triggered with term:", term);
    
    // Clear previous results
    $searchResultsItems.innerHTML = "";
    
    // Hide results if no search term
    if (!term) {
      $searchResults.style.display = "none";
      return;
    }
    
    // Make sure search index is available
    if (!window.searchIndex) {
      console.error("Search index not loaded yet!");
      return;
    }
    
    // Perform search
    const results = window.searchIndex.search(term, options);
    console.log("Search results:", results);
    
    if (results.length > 0) {
      // Add results to UI
      results.forEach(result => {
        const listItem = document.createElement("li");
        listItem.innerHTML = formatSearchResultItem(result);
        $searchResultsItems.appendChild(listItem);
      });
      $searchResults.style.display = "block";
    } else {
      // Show "no results" message
      const noResults = document.createElement("li");
      noResults.classList.add("search-results__no-results");
      noResults.textContent = "No results found";
      $searchResultsItems.appendChild(noResults);
      $searchResults.style.display = "block";
    }
  }, 150));
  
  // Show results when input is focused (if there's a value)
  $searchInput.addEventListener("focus", function() {
    if ($searchInput.value.trim() !== "") {
      // Trigger search to display existing results
      $searchInput.dispatchEvent(new Event("input"));
    }
  });
  
  // Hide results when clicking outside
  document.addEventListener("click", function (e) {
    if (!$searchInput.contains(e.target) && !$searchResults.contains(e.target)) {
      $searchResults.style.display = "none";
    }
  });
  
  // Prevent form submission
  const $searchForm = $searchInput.closest("form");
  if ($searchForm) {
    $searchForm.addEventListener("submit", function(e) {
      e.preventDefault();
      $searchInput.dispatchEvent(new Event("input"));
    });
  }
}

// Proper initialization sequence
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  loadSearchIndex().then(initSearch);
} else {
  document.addEventListener("DOMContentLoaded", function() {
    loadSearchIndex().then(initSearch);
  });
}
