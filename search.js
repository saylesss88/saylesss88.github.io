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
    const index = window.searchIndex.index.body;
    const results = [];

    // Search through the index and filter by matching query (e.g., title or body)
    for (const [key, value] of Object.entries(index)) {
      const doc = value.docs;
      for (const [url, { tf }] of Object.entries(doc)) {
        if (url.toLowerCase().includes(query) || doc[url].title.toLowerCase().includes(query) || doc[url].body.toLowerCase().includes(query)) {
          results.push({ title: doc[url].title, url: key, score: tf });
        }
      }
    }
    return results;
  }

  function displayResults(results) {
    searchResults.innerHTML = ''; // Clear previous results
    if (results.length === 0) {
      searchResults.innerHTML = '<li>No results found.</li>';
    } else {
      results.forEach(result => {
        const resultItem = document.createElement('li');
        resultItem.innerHTML = `<a href="${result.url}" target="_blank">${result.title}</a>`;
        searchResults.appendChild(resultItem);
      });
    }
  }
});
