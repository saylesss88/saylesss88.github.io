document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.querySelector('.search-results__items');
  const searchResultsDiv = document.querySelector('.search-results');

  // Load the search index
  fetch('/search_index.en.json') // Changed path to .json
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch search index: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
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
              // The structure of the result is different with elasticlunr_json
              const post = result.doc; //  Access the document directly from the result
              const listItem = document.createElement('li');
              const link = document.createElement('a');
              link.href = post.url; // Use the 'url' field from the index
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
      //  Ideally, display a user-friendly message in the UI
      const listItem = document.createElement('li');
      listItem.textContent = 'Failed to load search index.';
      resultsContainer.appendChild(listItem);
    });

  // Hide results when clicking outside the search container
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-container')) {
      searchResultsDiv.style.display = 'none';
    }
  });
});
