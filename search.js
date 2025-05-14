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

  // Log the query to check
  console.log("Search query:", query);

  if (!query) {
    return results; // Return an empty array if no query is provided
  }

  for (const [key, value] of Object.entries(index)) {
    const doc = value.docs;
    for (const [url, { tf }] of Object.entries(doc)) {
      if (url.toLowerCase().includes(query) || doc[url].title.toLowerCase().includes(query) || doc[url].body.toLowerCase().includes(query)) {
        results.push({ title: doc[url].title, url: key, score: tf });
      }
    }
  }

  // Log the results for debugging
  console.log("Search results:", results);
  return results; // Ensure results is always an array
}

function displayResults(results) {
  const searchResults = document.querySelector(".search-results__items");
  searchResults.innerHTML = ''; // Clear previous results
  if (!Array.isArray(results)) {
    console.error("Results is not an array:", results);
    return;
  }

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

