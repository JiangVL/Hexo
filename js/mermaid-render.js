/**
 * Mermaid.js rendering logic with Zoom and Pan support
 */
(function() {
  const MERMAID_CONFIG = {
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit'
  };

  function initMermaid() {
    if (typeof mermaid === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
      script.onload = () => {
        mermaid.initialize(MERMAID_CONFIG);
        renderAllDiagrams();
      };
      document.head.appendChild(script);
    } else {
      renderAllDiagrams();
    }
  }

  function renderAllDiagrams() {
    const diagrams = document.querySelectorAll('.mermaid');
    const isDark = document.documentElement.getAttribute('theme') === 'dark';
    
    diagrams.forEach((el, index) => {
      const code = el.getAttribute('data-mermaid-code');
      if (!code) return;

      const id = `mermaid-diag-${Date.now()}-${index}`;
      const container = el.closest('.mermaid-diagram-container');
      
      // Clear existing content
      el.innerHTML = '<div class="mermaid-loading">Rendering diagram...</div>';

      try {
        mermaid.render(id, code).then(({ svg }) => {
          el.innerHTML = svg;
          setupZoomPan(el);
          addControls(container, el);
        });
      } catch (err) {
        console.error('Mermaid render error:', err);
        el.innerHTML = `<div class="mermaid-error">Error rendering diagram: ${err.message}</div>`;
      }
    });
  }

  function setupZoomPan(el) {
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;

    const wrapper = el.parentElement;
    const svg = el.querySelector('svg');
    if (!svg) return;

    svg.style.cursor = 'grab';
    svg.style.transition = 'transform 0.1s ease-out';

    wrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      svg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      svg.style.cursor = 'grab';
    });

    wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      scale *= delta;
      scale = Math.min(Math.max(0.5, scale), 5);
      updateTransform();
    }, { passive: false });

    function updateTransform() {
      svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    // Expose for controls
    el._mermaid_zoom = {
      zoomIn: () => { scale *= 1.2; updateTransform(); },
      zoomOut: () => { scale *= 0.8; updateTransform(); },
      reset: () => { scale = 1; translateX = 0; translateY = 0; updateTransform(); }
    };
  }

  function addControls(container, el) {
    if (container.querySelector('.mermaid-controls')) return;

    const controls = document.createElement('div');
    controls.className = 'mermaid-controls';
    
    const btnIn = document.createElement('div');
    btnIn.className = 'mermaid-btn';
    btnIn.innerHTML = '+';
    btnIn.onclick = () => el._mermaid_zoom.zoomIn();

    const btnOut = document.createElement('div');
    btnOut.className = 'mermaid-btn';
    btnOut.innerHTML = '-';
    btnOut.onclick = () => el._mermaid_zoom.zoomOut();

    const btnReset = document.createElement('div');
    btnReset.className = 'mermaid-btn';
    btnReset.innerHTML = '⟲';
    btnReset.onclick = () => el._mermaid_zoom.reset();

    controls.appendChild(btnIn);
    controls.appendChild(btnOut);
    controls.appendChild(btnReset);
    container.appendChild(controls);
  }

  // Handle theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'theme') {
        const isDark = document.documentElement.getAttribute('theme') === 'dark';
        mermaid.initialize({ ...MERMAID_CONFIG, theme: isDark ? 'dark' : 'default' });
        renderAllDiagrams();
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMermaid);
  } else {
    initMermaid();
  }
})();
