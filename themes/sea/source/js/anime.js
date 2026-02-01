document.addEventListener('DOMContentLoaded', function() {
  const filterBtns = document.querySelectorAll('.sea-anime-filter-btn');
  const animeGrid = document.getElementById('anime-grid');
  let animeItems = document.querySelectorAll('.sea-anime-item:not(.sea-anime-skeleton)');
  const skeletons = document.querySelectorAll('.sea-anime-skeleton');
  const loadingBar = document.getElementById('sea-loading-bar');
  
  const loadMoreBtn = document.getElementById('load-more-btn');
  const loadMoreLoading = document.getElementById('load-more-loading');
  
  let allAnimeData = [];
  let currentIndex = 12; // Initial count from Nunjucks
  const pageSize = 12;
  let currentFilter = 'all';

  // Initial loading progress simulation
  if (loadingBar) {
    loadingBar.style.width = '30%';
    
    const onLoad = () => {
      loadingBar.style.width = '100%';
      setTimeout(() => {
        loadingBar.style.opacity = '0';
        // Hide skeletons and show content
        skeletons.forEach(s => s.style.display = 'none');
        animeItems.forEach(item => {
          item.style.display = 'flex';
          // Force reflow
          item.offsetHeight;
          item.style.opacity = '1';
        });
        
        // Fetch all data for "Load More"
        fetchAnimeData();
      }, 500);
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
      setTimeout(onLoad, 3000);
    }
  }

  async function fetchAnimeData() {
    try {
      const jsonUrl = animeGrid.getAttribute('data-json');
      const response = await fetch(jsonUrl);
      allAnimeData = await response.json();
      updateLoadMoreButton();
    } catch (e) {
      console.error('Failed to fetch anime data:', e);
    }
  }

  function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    
    const filteredData = currentFilter === 'all' 
      ? allAnimeData 
      : allAnimeData.filter(item => item.status === currentFilter);
    
    // Check if there are more items to load
    const currentRenderedCount = animeGrid.querySelectorAll(`.sea-anime-item[data-status="${currentFilter === 'all' ? '' : currentFilter}"]`).length;
    
    if (currentIndex < allAnimeData.length) {
       loadMoreBtn.style.display = 'block';
    } else {
       loadMoreBtn.style.display = 'none';
    }
    
    // Re-evaluate based on filter
    const hasMore = filteredData.length > animeGrid.querySelectorAll(`.sea-anime-item:not(.sea-anime-skeleton)${currentFilter === 'all' ? '' : `[data-status="${currentFilter}"]`}`).length;
    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      loadMoreBtn.style.display = 'none';
      loadMoreLoading.style.display = 'flex';
      
      // Simulate network delay for better UX
      setTimeout(() => {
        renderNextPage();
        loadMoreLoading.style.display = 'none';
        updateLoadMoreButton();
      }, 500);
    });
  }

  function renderNextPage() {
    const filteredData = currentFilter === 'all' 
      ? allAnimeData 
      : allAnimeData.filter(item => item.status === currentFilter);
    
    const currentlyShowing = Array.from(animeGrid.querySelectorAll(`.sea-anime-item:not(.sea-anime-skeleton)`))
      .filter(item => currentFilter === 'all' || item.getAttribute('data-status') === currentFilter);
    
    const nextItems = filteredData.slice(currentlyShowing.length, currentlyShowing.length + pageSize);
    
    nextItems.forEach(anime => {
      const itemHtml = createAnimeItemHtml(anime);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = itemHtml;
      const newItem = tempDiv.firstElementChild;
      
      animeGrid.appendChild(newItem);
      
      // Setup image lazy loading for new item
      const img = newItem.querySelector('.sea-anime-cover');
      if (img) imageObserver.observe(img);
      
      // Animate in
      requestAnimationFrame(() => {
        newItem.style.display = 'flex';
        newItem.offsetHeight;
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
      });
    });
    
    // Update animeItems list for filtering
    animeItems = document.querySelectorAll('.sea-anime-item:not(.sea-anime-skeleton)');
  }

  function createAnimeItemHtml(anime) {
    const statusText = anime.status === 'watching' ? '正在追' : (anime.status === 'completed' ? '已看完' : '想看');
    const progressPercent = anime.totalEpisodes > 0 ? (anime.progress / anime.totalEpisodes) * 100 : 0;
    
    let genresHtml = '';
    if (anime.genre && anime.genre.length > 0) {
      genresHtml = `<div class="sea-anime-genres">
        ${anime.genre.map(tag => `<span class="sea-anime-genre-tag">${tag}</span>`).join('')}
      </div>`;
    }

    return `
      <div class="sea-anime-item" data-status="${anime.status}" style="display: flex; opacity: 0; transform: translateY(10px);">
        <div class="sea-anime-cover-wrapper">
          <img class="sea-anime-cover" data-src="${anime.cover}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="${anime.title}" loading="lazy">
          <div class="sea-anime-status-badge sea-anime-status-${anime.status}">
            ${statusText}
          </div>
        </div>
        <div class="sea-anime-info">
          <h3 class="sea-anime-title">
            <a href="${anime.link}" target="_blank">${anime.title}</a>
          </h3>
          <div class="sea-anime-meta">
            <span>${anime.year}</span>
            <span>${anime.studio}</span>
            ${anime.rating ? `<span class="sea-anime-rating">⭐ ${anime.rating}</span>` : ''}
          </div>
          ${genresHtml}
          <div class="sea-anime-progress">
            <div class="sea-anime-progress-bar-bg">
              <div class="sea-anime-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <div class="sea-anime-progress-text">
              进度: ${anime.progress} / ${anime.totalEpisodes}
            </div>
          </div>
          <p class="sea-anime-desc">${anime.description}</p>
        </div>
      </div>
    `;
  }

  // Optimized image loading
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        if (img.complete) {
          img.classList.add('loaded');
        } else {
          img.onload = () => img.classList.add('loaded');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });

  // Initialize observer for existing images
  document.querySelectorAll('.sea-anime-cover').forEach(img => imageObserver.observe(img));

  // Efficient filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.getAttribute('data-status');
      currentFilter = status;
      
      // Update UI state
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));
      
      // Use requestAnimationFrame for smoother transitions
      requestAnimationFrame(() => {
        animeItems.forEach(item => {
          const itemStatus = item.getAttribute('data-status');
          const isVisible = status === 'all' || itemStatus === status;
          
          if (isVisible) {
            item.style.display = 'flex';
            item.getBoundingClientRect();
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            setTimeout(() => {
              if (item.style.opacity === '0') {
                item.style.display = 'none';
              }
            }, 300);
          }
        });
        
        // After filtering, check if we need to show/hide "Load More"
        setTimeout(updateLoadMoreButton, 350);
      });
    });
  });
});
