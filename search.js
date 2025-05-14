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
          const post = index.documentStore.docs[result.ref];

          if (post) {
            console.log("Retrieved post data:", post); // ADD THIS FOR DEBUGGING

            const listItem = document.createElement('li');
            const link = document.createElement('a');

            if (post && post.id) {
              link.href = post.id; // use `id` which is the full URL
            } else if (post && post.path) {
              link.href = post.path; // fallback to path
            } else {
              console.error("Permalink missing for ref:", result.ref, "Post data:", post);
              link.href = '#';
            }


            const title = post?.title
              ? post.title.replace(new RegExp(query, 'gi'), '<mark>$&</mark>')
              : 'Untitled';

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

  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-container')) {
      searchResultsDiv.style.display = 'none';
    }
  });
});
