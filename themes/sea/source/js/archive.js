document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('archive-container');
  const sentinel = document.getElementById('archive-load-more-sentinel');
  const archiveCard = document.querySelector('.sea-archive-card');
  if (!container || !sentinel || !archiveCard) return;

  const postsCountLabel = archiveCard.getAttribute('data-posts-count-label') || '篇文章';

  let allPosts = [];
  let currentIndex = 15; // Starting index (already rendered by SSR)
  const batchSize = 15;
  let isLoading = false;
  let hasLoadedAll = false;

  // Function to calculate year count
  function getYearCount(year) {
    return allPosts.filter(post => post.year === year).length;
  }

  // Function to create archive item HTML
  function createArchiveItem(post) {
    return `
      <a href="${post.path}" class="sea-archive-item" data-year="${post.year}">
        <div class="sea-archive-item-date">${post.day}</div>
        <div class="sea-archive-item-dot-container">
          <div class="sea-archive-item-dot"></div>
        </div>
        <div class="sea-archive-item-title">${post.title}</div>
        <div class="sea-archive-item-tags">${post.tags.map(t => '#' + t).join(' ')}</div>
      </a>
    `;
  }

  // Function to create year header HTML
  function createYearHeader(year) {
    const count = getYearCount(year);
    return `
      <div class="sea-archive-year-header" data-year="${year}">
        <div class="sea-archive-year-text">${year}</div>
        <div class="sea-archive-year-dot-container">
          <div class="sea-archive-year-dot"></div>
        </div>
        <div class="sea-archive-year-count">
          <span class="year-count-num">${count}</span> ${postsCountLabel}
        </div>
      </div>
    `;
  }

  // Load posts from JSON
  async function loadPosts() {
    if (isLoading || hasLoadedAll) return;
    isLoading = true;
    sentinel.innerHTML = '<div class="sea-loading-spinner"></div>';

    try {
      if (allPosts.length === 0) {
        // Get the root path from body data attribute
        const root = document.body.getAttribute('data-root') || '/';
        const jsonPath = (root.endsWith('/') ? root : root + '/') + 'archives/index.json';
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('Network response was not ok');
        allPosts = await response.json();
      }

      const nextBatch = allPosts.slice(currentIndex, currentIndex + batchSize);
      if (nextBatch.length === 0) {
        hasLoadedAll = true;
        sentinel.innerHTML = '<div class="sea-archive-no-more">没有更多文章了</div>';
        return;
      }

      let lastYear = container.querySelector('.sea-archive-item:last-child')?.getAttribute('data-year') || '';
      
      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');

      nextBatch.forEach(post => {
        if (post.year !== lastYear) {
          tempDiv.innerHTML = createYearHeader(post.year);
          while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
          }
          lastYear = post.year;
        }
        
        tempDiv.innerHTML = createArchiveItem(post);
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
      });

      container.appendChild(fragment);
      currentIndex += batchSize;

      if (currentIndex >= allPosts.length) {
        hasLoadedAll = true;
        sentinel.innerHTML = '<div class="sea-archive-no-more">没有更多文章了</div>';
      } else {
        sentinel.innerHTML = '';
      }
    } catch (error) {
      console.error('Error loading archive posts:', error);
      sentinel.innerHTML = `
        <div class="sea-archive-error">
          <p>加载失败，请检查网络连接</p>
          <button id="archive-retry-btn" class="sea-retry-btn">点击重试</button>
        </div>
      `;
      document.getElementById('archive-retry-btn')?.addEventListener('click', () => {
        loadPosts();
      });
    } finally {
      isLoading = false;
    }
  }

  // Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && !hasLoadedAll) {
      loadPosts();
    }
  }, {
    rootMargin: '150px' // Trigger a bit earlier
  });

  observer.observe(sentinel);
});
