document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.querySelector('.search-results__items');
  const searchResultsDiv = document.querySelector('.search-results');

  const script = document.createElement("script");
  script.src = searchIndexURL;
  script.onload = function () {
    const index = elasticlunr.Index.load(searchIndex);

    searchInput.addEventListener('input', function () {
      const query = this.value.trim();
      resultsContainer.innerHTML = '';
      searchResultsDiv.style.display = query.length > 0 ? 'block' : 'none';

      if (query.length > 0) {
        const results = index.search(query, { expand: true });

        if (results.length > 0) {
          results.forEach(function (result) {
            const post = searchIndex.documentStore.docs[result.ref]; // `searchIndex` is now globally defined
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = post.permalink;
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
  };

  script.onerror = function () {
    console.error('Failed to load search index script');
  };

  document.head.appendChild(script);

  // Hide results when clicking outside the search container
  document.addEventListener('click', function (event) {
    if (!event.target.closest('#search') && !event.target.closest('.search-results')) {
      searchResultsDiv.style.display = 'none';
    }
  });
});
