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
    const documentStore = window.searchIndex.documentStore.store; // Access the document store
    const results = [];

    console.log("Search query:", query);

    if (!query) {
      return results;
    }

    for (const term in index) {
      if (index.hasOwnProperty(term) && index[term].docs) {
        for (const ref in index[term].docs) { // 'ref' is the document ID
          if (index[term].docs.hasOwnProperty(ref)) {
            const tf = index[term].docs[ref].tf;
            const doc = documentStore[ref]; // Look up the document in the store

            if (doc && (doc.title.toLowerCase().includes(query) ||
                        doc.body.toLowerCase().includes(query))) {
              results.push({ title: doc.title, url: doc.path, score: tf }); // Use doc.path for the URL
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
