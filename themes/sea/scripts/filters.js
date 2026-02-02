hexo.extend.filter.register('template_locals', locals => {
  const allPosts = locals.site.posts.sort('-date').toArray(); // 按日期降序排序
  
  // 处理置顶逻辑：将 pinned: true 或 top: true 的文章排在前面
  const sortedPosts = allPosts.sort((a, b) => {
    const aSticky = a.pinned || a.top || 0;
    const bSticky = b.pinned || b.top || 0;
    if (aSticky !== bSticky) {
      return bSticky - aSticky;
    }
    return b.date - a.date;
  });

  const recommendedPosts = sortedPosts.filter(post => post.recommend === true); // 筛选推荐文章

  // 将结果保存到 locals 中，供模板使用
  locals.recommendedPosts = recommendedPosts.slice(0, 10);
  locals.recentPosts = sortedPosts.slice(0, 10);
  locals.isLocalServer = hexo.env.cmd === 'server';
  return locals;
});

/**
 * Syntax Bridging: Convert Astro-style directives to Hexo tags
 * Supports: ::github, :::note, ::mermaid
 */
hexo.extend.filter.register('before_post_render', function(data) {
  // Metadata mapping
  if (data.pinned !== undefined) data.top = data.pinned;
  if (data.description !== undefined && data.abstract === undefined) {
    data.abstract = data.description;
  }

  // 1. Convert :::note type Title -> {% note type Title %}
  data.content = data.content.replace(/:::(note|tip|warning|danger|info|important|caution)(.*)\n([\s\S]*?)\n:::/g, (match, type, title, content) => {
    return `{% note ${type} ${title.trim()} %}\n${content.trim()}\n{% endnote %}`;
  });

  // 2. Convert ::github{repo="owner/repo"} -> {% github owner/repo %}
  data.content = data.content.replace(/::github\{repo="(.+?)"\}/g, (match, repo) => {
    return `{% github ${repo} %}`;
  });

  // 3. Convert ::mermaid block -> {% mermaid %}
  data.content = data.content.replace(/::mermaid\n([\s\S]*?)\n::/g, (match, content) => {
    return `{% mermaid %}\n${content.trim()}\n{% endmermaid %}`;
  });

  return data;
});