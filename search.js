document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.querySelector('.search-results__items');
  const searchResultsDiv = document.querySelector('.search-results');

  // Load the search index (adjust the path if needed)
  fetch('/search_index.js')
    .then(response => response.json())
    .then(indexData => {
      console.log("Search Index Data:", indexData); // Keep for debugging
      const index = elasticlunr.Index.load(indexData);

      searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        resultsContainer.innerHTML = '';
        searchResultsDiv.style.display = query.length > 0 ? 'block' : 'none';

        if (query.length > 0) {
          const results = index.search(query, { expand: true });

          if (results.length > 0) {
            results.forEach(function(result) {
              const post = indexData[result.ref]; // Access data directly by ref
              const listItem = document.createElement('li');
              const link = document.createElement('a');
              link.href = post.permalink; // Assuming 'permalink' is a top-level field
              const title = post.title.replace(new RegExp(query, 'gi'), '<mark>$&</mark>');
              link.innerHTML = title;
              listItem.appendChild(link);
              resultsContainer.appendChild(listItem);
            });
          } else {
            const listItem = document.createElement('li');
            listItem.textContent = 'No results found.';
            resultsContainer.appendChild(listItem);
          }
        }
      });
    })
    .catch(error => {
      console.error('Failed to load search index:', error);
    });

  // Hide results when clicking outside the search container
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-container')) {
      searchResultsDiv.style.display = 'none';
    }
  });
});
