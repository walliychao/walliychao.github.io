var webpack = require('webpack')
var hostConfig = {
  ip: getIp(),
  devPort: 6713
}

module.exports = {
    entry: {
      'ester': [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
        './src/index.js']
    },
    output: {
        path: __dirname + '/dist/',
        filename: '[name].js',
        chunkFilename: '[name].[chunkhash].bundle.js',
        publicPath: 'http://' + hostConfig.ip + ':' + hostConfig.devPort + '/dist/',
    },
    devtool: 'eval',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                query: {
                  presets: ['react', 'es2015', 'stage-0'],
                  plugins: ['transform-decorators-legacy']
                },
                include: __dirname + '/src'
            },
            {
                test: /\.styled\.less$/,
                loaders: ['babel'],
                include: __dirname + '/src'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin()
    ]
}

function getIp () {
  var os = require('os');
  var ifaces = os.networkInterfaces();
  var IPv4s = [];

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        IPv4s.push(iface.address)
      }
      ++alias;
    })
  })
  return IPv4s[0] || '127.0.0.1'
}