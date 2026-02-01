const BangumiManager = require('./bangumi/manager');

hexo.extend.console.register('anime-sync', 'Sync anime data from various sources', {
  options: [
    { name: '-s, --sync', desc: 'Sync data' }
  ]
}, async function(args) {
  const manager = new BangumiManager(hexo);
  
  if (args.s || args.sync) {
    await manager.loadPlugins();
    await manager.sync();
  } else {
    console.log('Usage: hexo anime-sync --sync');
  }
});
