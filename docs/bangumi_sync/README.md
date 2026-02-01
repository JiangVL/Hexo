# Hexo Bangumi Sync System

这是一个为 Hexo 设计的可插拔番剧数据同步系统，支持从多个来源（如 Bangumi.tv, Bilibili 等）动态更新番剧页面内容。

## 核心架构

- **Manager (`manager.js`)**: 核心控制器，负责加载插件、读取配置、执行同步流程并持久化数据。
- **Plugins (`plugins/`)**: 独立的插件模块，每个插件负责特定来源的数据抓取和解析。
- **Base Plugin (`plugins/base.js`)**: 定义了插件的标准接口和统一的数据模型 `BangumiItem`。
- **Config (`config/bangumi/source.yml`)**: 配置文件，定义数据源、使用的插件及相关参数。

## 插件接口 (API)

所有插件必须继承自 `BangumiPlugin` 并实现以下方法：

1. `init(config)`: 初始化插件配置。
2. `fetchData(url)`: 异步抓取原始数据。
3. `parseContent(rawData)`: 解析原始数据并返回 `BangumiItem` 数组。
4. `renderPage(parsedData)`: (可选) 对解析后的数据进行二次处理。

## 数据模型 (BangumiItem)

统一的数据格式确保了前端渲染的一致性：

- `title`: 标题
- `originalTitle`: 原名
- `description`: 简介
- `cover`: 封面图 URL
- `status`: 状态 (`watching`, `completed`, `wish`, `on_hold`, `dropped`)
- `rating`: 评分
- `link`: 详情页链接
- `progress`: 当前进度（集数）
- `totalEpisodes`: 总集数
- `updatedAt`: 最后更新时间
- `source`: 数据来源名称

## 如何使用

1. **配置数据源**: 编辑 `config/bangumi/source.yml`。
2. **手动同步**: 运行命令 `npx hexo bangumi --sync`。
3. **自动化更新**: 系统已集成到 GitHub Actions，每次推送代码或触发构建时会自动同步。

## 开发新插件

1. 在 `themes/sea/scripts/bangumi/plugins/` 下创建新的 JS 文件。
2. 继承 `BangumiPlugin`。
3. 实现必要的方法。
4. 在 `source.yml` 中注册该插件。
