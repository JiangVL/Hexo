const pagination = require("hexo-pagination");

hexo.extend.generator.register('tags', function () {
  return {
    path: 'tags/index.html',
    layout: ['page'],
    data: {
      type: 'tags',
      comment: false
    }
  };
});

hexo.extend.generator.register('categories', function () {
  return {
    path: 'categories/index.html',
    layout: ['page'],
    data: {
      type: 'categories',
      comment: false
    }
  };
});

hexo.extend.generator.register('articles', function (locals) {
  const themeConfig = hexo.theme.config;
  const path = themeConfig.articles.path || 'posts'; // 默认路径为 'posts'
  const perPage = themeConfig.articles.per_page || 10; // 每页文章数
  const orderBy = themeConfig.articles.order_by || '-date'; // 默认按日期降序排序

  const posts = locals.posts.sort(orderBy);

  return pagination(path, posts, {
    perPage: perPage,
    layout: ['articles'],
    data: {},
  });
});

hexo.extend.generator.register('search', function () {
  return {
    path: 'search/index.html',
    layout: ['search'],
    data: {
      type: 'search',
      comment: false
    }
  };
});

hexo.extend.generator.register('anime_json', function (locals) {
  const fs = require('fs');
  const path = require('path');
  const yaml = require('js-yaml');
  
  const dataPath = path.join(hexo.base_dir, 'config/bangumi/bangumi.yml');
  let animeList = [];
  
  if (fs.existsSync(dataPath)) {
    try {
      const content = fs.readFileSync(dataPath, 'utf8');
      animeList = yaml.load(content) || [];
    } catch (e) {
      hexo.log.error(`[Hexo-Theme-Sea] Error loading data for anime_json:`, e);
    }
  }

  return {
    path: 'anime/index.json',
    data: JSON.stringify(animeList)
  };
});

hexo.extend.generator.register('archive_json', function (locals) {
  const posts = locals.posts.sort('-date').map(post => {
    return {
      title: post.title,
      path: hexo.config.root + post.path,
      date: post.date.format('YYYY-MM-DD'),
      year: post.date.format('YYYY'),
      day: post.date.format('MM-DD'),
      tags: post.tags.map(tag => tag.name)
    };
  });

  return {
    path: 'archives/index.json',
    data: JSON.stringify(posts)
  };
});

hexo.extend.generator.register('index_json', function (locals) {
  const posts = locals.posts.sort('-date').sort((a, b) => {
    const aTop = a.pinned || a.top || 0;
    const bTop = b.pinned || b.top || 0;
    return bTop - aTop;
  }).map(post => {
    return {
      title: post.title,
      path: hexo.config.root + post.path,
      date: post.date.format('YYYY-MM-DD'),
      pinned: post.pinned || post.top || false,
      abstract: post.abstract || hexo.util.truncate(hexo.util.stripHTML(post.content), { length: 300, separator: ' ' }),
      categories: post.categories.map(cat => ({ name: cat.name, path: hexo.config.root + cat.path })),
      tags: post.tags.map(tag => ({ name: tag.name, path: hexo.config.root + tag.path }))
    };
  });

  return {
    path: 'index.json',
    data: JSON.stringify(posts)
  };
});