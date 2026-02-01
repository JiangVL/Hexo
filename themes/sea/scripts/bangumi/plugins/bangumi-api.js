const axios = require('axios');
const { BangumiPlugin, BangumiItem } = require('./base');

/**
 * Bangumi.tv API 插件
 * 演示如何从 Bangumi.tv 获取用户收藏
 */
class BangumiTVPlugin extends BangumiPlugin {
  constructor(hexo) {
    super(hexo, 'bangumi-tv');
  }

  async fetchData(url) {
    let allItems = [];
    let offset = 0;
    const limit = 50; // 每次获取 50 条
    let total = 0;

    // 解析原始 URL，剥离 limit 和 offset
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams(url.split('?')[1] || '');
    params.set('limit', limit);

    do {
      params.set('offset', offset);
      const fetchUrl = `${baseUrl}?${params.toString()}`;
      
      this.hexo.log.info(`[Bangumi] Fetching: ${fetchUrl}`);
      
      const response = await axios.get(fetchUrl, {
        headers: {
          'User-Agent': 'Hexo-Theme-Sea-Sync-Plugin (https://github.com/yourname/hexo-theme-sea)'
        }
      });

      const data = response.data;
      if (data && data.data) {
        allItems.push(...data.data);
        total = data.total || 0;
        offset += limit;
      } else {
        break;
      }
    } while (offset < total);

    return { data: allItems };
  }

  async parseContent(rawData) {
    // 假设 rawData 是 Bangumi v0 API 的 collections 响应
    // 结构参考: https://bangumi.github.io/api/#/%E6%9D%A1%E7%9B%AE/get_v0_users__username__collections
    
    if (!rawData || !rawData.data) return [];

    return rawData.data.map(item => {
      const subject = item.subject;
      
      // 映射状态
      let status = 'watching';
      switch (item.type) {
        case 1: status = 'wish'; break;
        case 2: status = 'completed'; break;
        case 3: status = 'watching'; break;
        case 4: status = 'on_hold'; break;
        case 5: status = 'dropped'; break;
      }

      return new BangumiItem({
        title: subject.name_cn || subject.name,
        originalTitle: subject.name,
        description: subject.short_summary || '',
        cover: subject.images ? subject.images.large : '',
        status: status,
        rating: item.rate || 0,
        updatedAt: item.updated_at || new Date().toISOString(),
        source: 'Bangumi.tv',
        link: `https://bgm.tv/subject/${subject.id}`,
        progress: item.ep_status || 0,
        totalEpisodes: subject.eps || 0,
        // 扩展字段，适配现有模板
        year: subject.date ? subject.date.split('-')[0] : '',
        type: subject.type === 2 ? 'Anime' : 'Subject'
      });
    });
  }
}

module.exports = BangumiTVPlugin;
