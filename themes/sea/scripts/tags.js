/* global hexo */

'use strict';

const url_for = hexo.extend.helper.get('url_for').bind(hexo);

hexo.extend.tag.register('github', (args) => {
  const repo = args[0];
  if (!repo || !repo.includes('/')) return '';
  
  const [owner, name] = repo.split('/');
  const cardUuid = `GC${Math.random().toString(36).slice(-6)}`;
  
  return `
    <a id="${cardUuid}-card" class="card-github fetch-waiting no-styling" href="https://github.com/${repo}" target="_blank" rel="noopener noreferrer">
      <div class="gc-titlebar">
        <div class="gc-titlebar-left">
          <div class="gc-owner">
            <div id="${cardUuid}-avatar" class="gc-avatar"></div>
            <div class="gc-user">${owner}</div>
          </div>
          <div class="gc-divider">/</div>
          <div class="gc-repo">${name}</div>
        </div>
        <div class="github-logo"></div>
      </div>
      <div id="${cardUuid}-description" class="gc-description">Waiting for api.github.com...</div>
      <div class="gc-infobar">
        <div id="${cardUuid}-stars" class="gc-stars">00K</div>
        <div id="${cardUuid}-forks" class="gc-forks">0K</div>
        <div id="${cardUuid}-license" class="gc-license">no-license</div>
        <div id="${cardUuid}-language" class="gc-language">Waiting...</div>
      </div>
      <script type="text/javascript">
        (function() {
          const card = document.getElementById('${cardUuid}-card');
          const desc = document.getElementById('${cardUuid}-description');
          const stars = document.getElementById('${cardUuid}-stars');
          const forks = document.getElementById('${cardUuid}-forks');
          const license = document.getElementById('${cardUuid}-license');
          const lang = document.getElementById('${cardUuid}-language');
          const avatar = document.getElementById('${cardUuid}-avatar');

          const fetchRepo = (retryCount = 0) => {
            fetch('https://api.github.com/repos/${repo}', { 
              referrerPolicy: "no-referrer",
              cache: "force-cache" 
            })
              .then(res => {
                if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
                return res.json();
              })
              .then(data => {
                if (data.message === 'Not Found') throw new Error('Repo not found');
                
                desc.innerText = data.description?.replace(/:[a-zA-Z0-9_]+:/g, '') || "Description not set";
                lang.innerText = data.language || "";
                
                const fmt = n => Intl.NumberFormat('en-us', { notation: "compact", maximumFractionDigits: 1 }).format(n).replaceAll("\\u202f", '');
                forks.innerText = fmt(data.forks_count);
                stars.innerText = fmt(data.stargazers_count);
                
                if (data.owner?.avatar_url) {
                  avatar.style.backgroundImage = 'url(' + data.owner.avatar_url + ')';
                  avatar.style.backgroundColor = 'transparent';
                }
                
                license.innerText = data.license?.spdx_id || "no-license";
                card.classList.remove("fetch-waiting");
              })
              .catch(err => {
                console.error('[GITHUB-CARD] Error:', err);
                if (retryCount < 2) {
                  console.log('[GITHUB-CARD] Retrying... (' + (retryCount + 1) + ')');
                  setTimeout(() => fetchRepo(retryCount + 1), 2000);
                } else {
                  card.classList.add("fetch-error");
                  desc.innerText = "Error loading repository information. Please check your network.";
                }
              });
          };
          fetchRepo();
        })();
      </script>
    </a>`;
});

hexo.extend.tag.register('note', (args, content) => {
  const className = args.shift();
  let header = '';
  let result = '';

  if (args.length) {
    header += `<strong class="note-title">${args.join(' ')}</strong>`;
  }

  result += `<blockquote class="note ${className}">${header}`;
  result += hexo.render.renderSync({ text: content, engine: 'markdown' });
  result += '</blockquote>';

  return result;
}, true);

hexo.extend.tag.register('friends', () => {
  const friends = hexo.theme.config.friends || [];
  const friendsEle = friends.map(item => {
    return `
      <a class="sea-friend-card" href="${url_for(item.link)}" target="_blank">
        <img class="sea-friend-avatar" src="${url_for(item.avatar)}" alt="${item.name}" />
        <div class="sea-friend-content">
          <div class="sea-friend-name" title="${item.name}">${item.name}</div>
          <div class="sea-friend-desc" title="${item.desc}">${item.desc}</div>
        </div>
      </a>
    `;
  });
  const friendsEleStr = friendsEle.join('');
  return `<div class="sea-friend-wrapper">${friendsEleStr}</div>`;
});

hexo.extend.tag.register('mermaid', (args, content) => {
  return `
    <div class="mermaid-diagram-container">
      <div class="mermaid-wrapper">
        <div class="mermaid" data-mermaid-code="${hexo.util.escapeHTML(content)}">
          <div class="mermaid-loading">Rendering diagram...</div>
        </div>
      </div>
    </div>`;
}, true);

hexo.extend.tag.register('btn', (args) => {
  const [url, text, color = 'primary'] = args;
  return `<a class="sea-btn sea-btn-${color}" href="${url_for(url)}" target="_blank"><span>${text}</span></a>`;
});

hexo.extend.tag.register('gallery', (args, content) => {
  const columns = args[0] || 3;
  return `<div class="sea-gallery sea-gallery-${columns}">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>`;
}, true);

hexo.extend.tag.register('works', () => {
  const works = hexo.theme.config.works || [];
  const getTags = (tags) => {
    if (!tags) return '';
    return tags.map(item => `<span class="sea-works-tag">${item}</span>`).join('');
  };
  const worksEle = works.map(item => {
    return `
      <div class="sea-works-card">
        ${item.cover ?`<a
          class="sea-works-cover"
          href="${url_for(item.link)}"
          target="_blank"
        >
          <img src="${url_for(item.cover)}" alt="${item.name}" />
        </a>` : ''}
        <div class="sea-works-content">
          <a
            class="sea-works-title"
            href="${url_for(item.link)}"
            target="_blank"
            title="${item.name}"
          >
            ${item.name}
          </a>
          <div class="sea-works-desc" title="${item.desc}">${item.desc}</div>
          <div class="sea-works-tags">${getTags(item.tags)}</div>
        </div>
      </div>
    `;
  });
  return `<div class="sea-works-wrapper">${worksEle.join('')}</div>`;
});
