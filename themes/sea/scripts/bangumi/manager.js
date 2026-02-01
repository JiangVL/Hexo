const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class BangumiManager {
  constructor(hexo) {
    this.hexo = hexo;
    this.plugins = new Map();
    this.configPath = path.join(hexo.base_dir, 'config/bangumi/source.yml');
    this.outputPath = path.join(hexo.base_dir, 'config/bangumi/bangumi.yml');
    this.pluginsDir = path.join(__dirname, 'plugins');
  }

  /**
   * 加载所有可用插件
   */
  async loadPlugins() {
    const files = fs.readdirSync(this.pluginsDir);
    for (const file of files) {
      if (file === 'base.js' || !file.endsWith('.js')) continue;
      
      try {
        const PluginClass = require(path.join(this.pluginsDir, file));
        const plugin = new PluginClass(this.hexo);
        this.plugins.set(plugin.name, plugin);
        this.hexo.log.info(`[Bangumi] Loaded plugin: ${plugin.name}`);
      } catch (err) {
        this.hexo.log.error(`[Bangumi] Failed to load plugin ${file}:`, err);
      }
    }
  }

  /**
   * 触发同步流程
   */
  async sync() {
    this.hexo.log.info('[Bangumi] Starting sync process...');
    
    if (!fs.existsSync(this.configPath)) {
      this.hexo.log.warn(`[Bangumi] Config file not found: ${this.configPath}`);
      return;
    }

    const config = yaml.load(fs.readFileSync(this.configPath, 'utf8'));
    const allData = [];

    for (const source of config.sources) {
      const plugin = this.plugins.get(source.plugin);
      if (!plugin) {
        this.hexo.log.error(`[Bangumi] Plugin not found: ${source.plugin}`);
        continue;
      }

      try {
        await plugin.init(source.config);
        this.hexo.log.info(`[Bangumi] Syncing from ${source.name} using ${source.plugin}...`);
        
        const rawData = await plugin.fetchData(source.url);
        const parsedData = await plugin.parseContent(rawData);
        const renderedData = await plugin.renderPage(parsedData);
        
        allData.push(...renderedData);
      } catch (err) {
        this.hexo.log.error(`[Bangumi] Error syncing ${source.name}:`, err);
      }
    }

    // 保存数据
    this.saveData(allData);
    this.hexo.log.info(`[Bangumi] Sync completed. Total items: ${allData.length}`);
  }

  saveData(data) {
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 按更新时间排序
    data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    fs.writeFileSync(this.outputPath, yaml.dump(data), 'utf8');
  }
}

module.exports = BangumiManager;
