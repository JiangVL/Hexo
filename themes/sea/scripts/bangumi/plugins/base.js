/**
 * 番剧同步插件基类
 */
class BangumiPlugin {
  constructor(hexo, name) {
    this.hexo = hexo;
    this.name = name;
    this.config = {};
  }

  /**
   * 插件初始化
   * @param {Object} config 插件配置
   */
  async init(config) {
    this.config = config || {};
  }

  /**
   * 从指定URL抓取原始数据
   * @param {string} url 
   */
  async fetchData(url) {
    throw new Error('Method fetchData(url) must be implemented');
  }

  /**
   * 解析原始数据
   * @param {any} rawData 
   * @returns {Array<BangumiItem>}
   */
  async parseContent(rawData) {
    throw new Error('Method parseContent(rawData) must be implemented');
  }

  /**
   * 渲染页面数据（在这里指转换为标准数据模型）
   * @param {Array} parsedData 
   */
  async renderPage(parsedData) {
    return parsedData; // 默认直接返回
  }
}

/**
 * 标准番剧数据模型
 */
class BangumiItem {
  constructor(data) {
    this.title = data.title;
    this.originalTitle = data.originalTitle || '';
    this.description = data.description || '';
    this.cover = data.cover || '';
    this.status = data.status || 'watching';
    this.rating = data.rating || 0;
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.source = data.source || '';
    this.link = data.link || '';
    this.progress = data.progress || 0;
    this.totalEpisodes = data.totalEpisodes || 0;
    
    // 允许插件添加自定义扩展字段
    Object.assign(this, data);
  }
}

module.exports = { BangumiPlugin, BangumiItem };
