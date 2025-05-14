document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.querySelector('.search-results__items');
  const searchResultsDiv = document.querySelector('.search-results');

  if (typeof window.searchIndex === 'undefined') {
    console.error('Search index not loaded globally (window.searchIndex is undefined).');
    return;
  }

  const index = elasticlunr.Index.load(window.searchIndex);

  searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    resultsContainer.innerHTML = '';
    searchResultsDiv.style.display = query.length > 0 ? 'block' : 'none';

    if (query.length > 0) {
      const results = index.search(query, { expand: true });

      if (results.length > 0) {
        results.forEach(function(result) {
          // Correctly access the document data from the loaded index's documentStore
          const post = index.documentStore.docs[result.ref];

          // Check if post data was found before trying to use it
          if (post) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            // Ensure 'permalink' is available and use it
            // This assumes 'permalink' is a top-level field due to extra_fields = ["permalink"]
            if (post.permalink) {
              link.href = post.permalink;
            } else {
              // Fallback or error handling if permalink is unexpectedly missing
              console.error("Permalink missing for post with ref:", result.ref, post);
              // You might want to set a default href or skip this result
              link.href = '#'; // Example fallback
            }


            // Ensure 'title' is available before using it
            const title = post.title ? post.title.replace(new RegExp(query, 'gi'), '<mark>$&</mark>') : 'Untitled'; // Fallback title

            link.innerHTML = title;
            listItem.appendChild(link);
            resultsContainer.appendChild(listItem);
          } else {
            console.error("Document data not found in index for ref:", result.ref);
          }
        });
      } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'No results found.';
        resultsContainer.appendChild(listItem);
      }
    }
  });

  // Hide results when clicking outside the search container
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-container')) {
      searchResultsDiv.style.display = 'none';
    }
  });
});
