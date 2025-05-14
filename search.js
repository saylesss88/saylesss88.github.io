document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const searchResults = document.querySelector(".search-results__items");

  // Listen for input in the search field
  searchInput.addEventListener("input", function (event) {
    const query = event.target.value.trim().toLowerCase(); // Normalize search query
    if (query.length > 0) {
      const results = search(query);
      displayResults(results);
    } else {
      searchResults.innerHTML = ''; // Clear results when the input is empty
    }
  });

  function search(query) {
    const index = window.searchIndex.index;
    const results = [];

    console.log("Search query:", query);

    if (!query) {
      return results;
    }

    // Loop through the index to match the query
    for (const term in index) {
      if (index.hasOwnProperty(term)) {
        const termData = index[term];
        if (termData && termData.docs) {
          // Iterate through the documents associated with this term
          for (const url in termData.docs) {
            if (termData.docs.hasOwnProperty(url)) {
              // Assuming window.searchIndex also contains the title and body
              const docInfo = window.searchIndex.index.body.root.docs[url];
              if (docInfo && (url.toLowerCase().includes(query) ||
                              (docInfo.title && docInfo.title.toLowerCase().includes(query)) ||
                              (docInfo.body && docInfo.body.toLowerCase().includes(query)))) {
                results.push({ title: docInfo.title || url, url: url, score: termData.docs[url].tf });
              }
            }
          }
        }
      }
    }

    console.log("Search results:", results);
    return results;
  }

  function displayResults(results) {
    searchResults.innerHTML = ''; // Clear previous results
    if (!Array.isArray(results)) {
      console.error("Results is not an array:", results);
      return;
    }

    if (results.length === 0) {
      searchResults.innerHTML = '<li>No results found.</li>';
    } else {
      // Display the results
      results.forEach(result => {
        const resultItem = document.createElement('li');
        resultItem.innerHTML = `<a href="${result.url}" target="_blank">${result.title}</a>`;
        searchResults.appendChild(resultItem);
      });
    }
  }
});
