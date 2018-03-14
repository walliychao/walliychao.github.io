import webpack from 'webpack'
import express from 'express'
import compression from 'compression'
import serveStatic from 'serve-static'
import path from 'path'
import fs from 'fs'
import url from 'url'
import bodyParser from 'body-parser'

import webpackConfig from './webpack.config'
const compiler = webpack(webpackConfig)

var hostConfig = {
  ip: getIp(),
  devPort: 6713
}


// -------- dev-server ----------------------
const app = express()
const host = hostConfig.ip
const port = hostConfig.devPort
const serverOptions = {
  //contentBase: 'http://' + host + ':' + port,
  // quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: 'http://' + host + ':' + port + '/dist',
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {colors: true}
}

const staticPath = path.resolve(__dirname)
const indexPath = path.join(staticPath, 'index.html')

app.use(compression())
app.use(bodyParser.json())

app.use(require('webpack-dev-middleware')(compiler, serverOptions))
app.use(require('webpack-hot-middleware')(compiler))

app.use(serveStatic(staticPath))

app.get('/*', function(req, res) {
  res.sendFile(indexPath)
})

// -------- run ----------------------
app.listen(port, err => {
  if (err) {
    console.error(err)
  }
  // replace host  to  localhost
  // console.info('----\n==> 🎛  dev-server http://' + host + ':' + port + ' is on')
  console.info('----\n==> 🎛  dev-server http://localhost' + ':' + port + '/ or http://' + host + ':' + port + '/ is on')
})

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