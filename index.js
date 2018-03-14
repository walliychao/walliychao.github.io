require('babel-core/register')({
  "presets": ['react', 'es2015', 'stage-0'],
  "plugins": ['transform-decorators-legacy']
});

require('./app.js')