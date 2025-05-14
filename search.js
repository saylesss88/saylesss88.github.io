document.addEventListener("DOMContentLoaded", function () {
  // Ensure the searchIndex is available
  if (window.searchIndex) {
    console.log('Search index loaded:', window.searchIndex);
    // Initialize your search functionality here
    initializeSearch();
  } else {
    console.error('Search index not found.');
  }
});

function initializeSearch() {
  const searchInput = document.getElementById("search");
  const searchResults = document.querySelector(".search-results__items");

  searchInput.addEventListener("input", function (event) {
    const query = event.target.value;
    const results = search(query); // assuming a search function is available
    displayResults(results);
  });

  function search(query) {
    // Perform search logic based on `window.searchIndex`
    return window.searchIndex.index.body; // Adjust this part as per your actual search logic
  }

  function displayResults(results) {
    searchResults.innerHTML = ''; // Clear previous results
    // Loop through results and append them to the searchResults container
    results.forEach(result => {
      const resultItem = document.createElement('li');
      resultItem.textContent = result; // Display result, adjust this as per your data structure
      searchResults.appendChild(resultItem);
    });
  }
}
