document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.querySelector('.search-results__items');
  const searchResultsDiv = document.querySelector('.search-results');

  // Prevent form submission on Enter
  searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  });

  // Load the search index
  fetch('/search_index.en.js')
    .then(response => response.json())
    .then(indexData => {
      console.log("Search Index Data:", indexData);
      const index = elasticlunr.Index.load(indexData);

      searchInput.addEventListener('input', function () {
        const query = this.value.trim();
        resultsContainer.innerHTML = '';
        searchResultsDiv.style.display = query.length > 0 ? 'block' : 'none';

        if (query.length > 0) {
          const results = index.search(query, { expand: true });

          if (results.length > 0) {
            results.forEach(function (result) {
              const post = indexData.documentStore.docs[result.ref];
              const listItem = document.createElement('li');
              const link = document.createElement('a');

              const permalink = post.permalink || '/';
              link.href = window.location.origin + permalink;
              link.textContent = post.title;

              // Optional: Highlight matched text with <mark>
              // link.innerHTML = post.title.replace(new RegExp(query, 'gi'), '<mark>$&</mark>');

              // Manual navigation to ensure it works
              link.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = this.href;
              });

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
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.search-container')) {
      searchResultsDiv.style.display = 'none';
    }
  });
});
