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

// Generate a teaser for search results by highlighting search terms
function makeTeaser(body, terms) {
  var TERM_WEIGHT = 40;
  var NORMAL_WORD_WEIGHT = 2;
  var FIRST_WORD_WEIGHT = 8;
  var TEASER_MAX_WORDS = 30;

  var stemmedTerms = terms.map(function (w) {
    return elasticlunr.stemmer(w.toLowerCase());
  });

  var termFound = false;
  var index = 0;
  var weighted = [];

  var sentences = body.toLowerCase().split(". ");

  for (var i in sentences) {
    var words = sentences[i].split(" ");
    var value = FIRST_WORD_WEIGHT;

    for (var j in words) {
      var word = words[j];

      if (word.length > 0) {
        for (var k in stemmedTerms) {
          if (elasticlunr.stemmer(word).startsWith(stemmedTerms[k])) {
            value = TERM_WEIGHT;
            termFound = true;
          }
        }
        weighted.push([word, value, index]);
        value = NORMAL_WORD_WEIGHT;
      }
      index += word.length + 1;
    }
    index += 1;
  }

  if (weighted.length === 0) {
    return body;
  }

  var windowWeights = [];
  var windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);
  var curSum = 0;

  for (var i = 0; i < windowSize; i++) {
    curSum += weighted[i][1];
  }
  windowWeights.push(curSum);

  for (var i = 0; i < weighted.length - windowSize; i++) {
    curSum -= weighted[i][1];
    curSum += weighted[i + windowSize][1];
    windowWeights.push(curSum);
  }

  var maxSumIndex = 0;
  if (termFound) {
    var maxFound = 0;
    for (var i = windowWeights.length - 1; i >= 0; i--) {
      if (windowWeights[i] > maxFound) {
        maxFound = windowWeights[i];
        maxSumIndex = i;
      }
    }
  }

  var teaser = [];
  var startIndex = weighted[maxSumIndex][2];

  for (var i = maxSumIndex; i < maxSumIndex + windowSize; i++) {
    var word = weighted[i];
    if (startIndex < word[2]) {
      teaser.push(body.substring(startIndex, word[2]));
      startIndex = word[2];
    }
    if (word[1] === TERM_WEIGHT) {
      teaser.push("<b>");
    }
    startIndex = word[2] + word[0].length;
    teaser.push(body.substring(word[2], startIndex));
    if (word[1] === TERM_WEIGHT) {
      teaser.push("</b>");
    }
  }
  teaser.push("…");

  return teaser.join("");
}

// Function to extract and highlight search results
function formatSearchResultItem(item, terms) {
  const post = window.searchIndex.documentStore.docs[item.ref];

  // Ensure path exists before using it
  const permalink = post.path ? `${baseUrl}${post.path}` : item.ref;
  if (!post.path) {
    console.warn(`Missing path for search result ref: ${item.ref}, using ref as fallback.`);
  }

  return `<div class="search-results__item">
            <a href="${permalink}">${post.title || "Untitled"}</a>
            <div>${makeTeaser(post.body, terms)}</div>
          </div>`;
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
