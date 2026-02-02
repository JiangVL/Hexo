document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('#index-post-container .sea-post-list');
  const sentinel = document.getElementById('index-load-more-sentinel');
  const indexContainer = document.getElementById('index-post-container');
  if (!container || !sentinel || !indexContainer) return;

  let allPosts = [];
  let isLoading = false;
  let hasLoadedAll = false;
  const batchSize = parseInt(indexContainer.getAttribute('data-per-page')) || 10;
  let currentIndex = 0;

  // Get already rendered post paths to avoid duplicates
  const getRenderedPaths = () => {
    const links = container.querySelectorAll('.sea-post-title a.sea-post-link');
    return Array.from(links).map(link => {
      try {
        return new URL(link.href).pathname;
      } catch (e) {
        return link.getAttribute('href');
      }
    });
  };

  function createPostItem(post) {
    const categoriesHtml = post.categories.length ? `
      <div class="sea-post-categories">
        <svg class="sea-svg-icon" viewBox="0 0 1024 1024" width="16" height="16"><path d="M900.5 240H521.4l-75.1-93.9c-14.1-17.6-35.4-27.8-57.9-27.8H123.5c-40.5 0-73.5 33-73.5 73.5v622.5c0 40.5 33 73.5 73.5 73.5h777.1c40.5 0 73.5-33 73.5-73.5V313.5c-0.1-40.5-33.1-73.5-73.6-73.5z m-777.1-48.2h264.9l75.1 93.9c14.1 17.6 35.4 27.8 57.9 27.8h379.2c14 0 25.3 11.3 25.3 25.3v53.4H123.5c-14 0-25.3-11.3-25.3-25.3V191.8z m777.1 688.6H123.5c-14 0-25.3-11.3-25.3-25.3V440.6h777.1v414.5c0 14-11.3 25.3-25.3 25.3z"></path></svg>
        ${post.categories.map((cat, i) => `<a href="${cat.path}">${cat.name}</a>${i < post.categories.length - 1 ? ' , ' : ''}`).join('')}
      </div>
    ` : '';

    const tagsHtml = post.tags.length ? `
      <div class="sea-post-tags">
        <svg class="sea-svg-icon" viewBox="0 0 1024 1024" width="16" height="16"><path d="M947.1 487.6L536.4 76.9c-14.1-14.1-33.1-21.9-53-21.9H123.5c-41.4 0-75 33.6-75 75v359.9c0 19.9 7.8 38.9 21.9 53l410.7 410.7c29.3 29.3 76.8 29.3 106.1 0l359.9-359.9c29.3-29.3 29.3-76.8 0-106.1zM281 356c-41.4 0-75-33.6-75-75s33.6-75 75-75 75 33.6 75 75-33.6 75-75 75z"></path></svg>
        ${post.tags.map((tag, i) => `<a href="${tag.path}">${tag.name}</a>${i < post.tags.length - 1 ? ' , ' : ''}`).join('')}
      </div>
    ` : '';

    return `
      <div class="sea-post-item">
        <h2 class="sea-post-title">
          <a class="sea-post-link" href="${post.path}">
            ${post.title}
            ${post.pinned ? '<span class="sea-post-top-flag">「置顶」</span>' : ''}
          </a>
        </h2>
        <div class="sea-post-line"></div>
        <div class="sea-post-abstract">
          ${post.abstract}
        </div>
        <div class="sea-post-meta">
          <div class="sea-post-time">
            <svg class="sea-svg-icon" viewBox="0 0 1024 1024" width="16" height="16"><path d="M805.5 981.5l-602.3-0.8c-86.6-8.2-154.6-81.3-154.6-170L48.6 291.7c0-94.2 76.6-170.8 170.8-170.8h586.1c94.2 0 170.7 76.6 170.7 170.8l0.1 519c0 94.2-76.6 170.8-170.8 170.8zM219.4 190.6c-55.8 0-101.2 45.4-101.2 101.2v519c0 55.8 45.4 101.2 101.2 101.2h586.1c55.8 0 101.2-45.4 101.2-101.2V291.7c0-55.8-45.4-101.2-101.2-101.2H219.4z m479.4 99.9c-25.6 0-46.4-20.8-46.4-46.4V85.4c0-25.6 20.8-46.4 46.4-46.4s46.4 20.8 46.4 46.4v158.7c0 25.6-20.8 46.4-46.4 46.4zM315.7 290.5c-25.6 0-46.4-20.8-46.4-46.4V85.4c0-25.6 20.8-46.4 46.4-46.4 25.6 0 46.4 20.8 46.4 46.4v158.7c0 25.6-20.8 46.4-46.4 46.4z m219.2 504.3h-44.3c-25.6 0-46.4-20.8-46.4-46.4s20.8-46.4 46.4-46.4h44.3c25.6 0 46.4 20.8 46.4 46.4s-20.8 46.4-46.4 46.4z m395.9-342.2H121.2c-25.6 0-46.4-20.8-46.4-46.4 0-25.6 20.8-46.4 46.4-46.4h809.6c25.6 0 46.4 20.8 46.4 46.4 0.1 25.6-20.7 46.4-46.4 46.4z m-602.8 196.4h-44.3c-25.6 0-46.4-20.8-46.4-46.4 0-25.6 20.8-46.4 46.4-46.4h44.3c25.6 0 46.4 20.8 46.4 46.4 0.1 25.6-20.7 46.4-46.4 46.4z"></path></svg>
            <time datetime="${post.date}">${post.date}</time>
          </div>
          ${categoriesHtml}
          ${tagsHtml}
        </div>
      </div>
    `;
  }

  async function loadMorePosts() {
    if (isLoading || hasLoadedAll) return;
    isLoading = true;
    sentinel.innerHTML = '<div class="sea-loading-spinner"></div>';

    try {
      if (allPosts.length === 0) {
        // Use the same root-aware path logic as archive.js
        const root = document.body.getAttribute('data-root') || '/';
        const jsonPath = (root.endsWith('/') ? root : root + '/') + 'index.json';
        
        const response = await fetch(jsonPath);
        const rawPosts = await response.json();
        
        const renderedPaths = getRenderedPaths();
        
        // Filter out already rendered posts
        allPosts = rawPosts.filter(post => !renderedPaths.includes(post.path));
      }

      const nextBatch = allPosts.slice(currentIndex, currentIndex + batchSize);
      
      if (nextBatch.length === 0) {
        hasLoadedAll = true;
        sentinel.innerHTML = '';
        return;
      }

      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');

      nextBatch.forEach(post => {
        tempDiv.innerHTML = createPostItem(post);
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
      });

      container.appendChild(fragment);
      currentIndex += batchSize;

      if (currentIndex >= allPosts.length) {
        hasLoadedAll = true;
        sentinel.innerHTML = '';
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      sentinel.innerHTML = '<p>加载失败，请重试</p>';
    } finally {
      isLoading = false;
    }
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && !hasLoadedAll) {
      loadMorePosts();
    }
  }, {
    rootMargin: '100px'
  });

  observer.observe(sentinel);
});
