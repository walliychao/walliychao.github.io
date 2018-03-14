var webpack = require('webpack')

module.exports = {
    entry: {
      'ester': './src/index.js'
    },
    output: {
        path: __dirname + '/static/dist/',
        filename: '[name].js',
        chunkFilename: '[name].[chunkhash].bundle.js',
        publicPath: './static/dist/',
    },
    devtool: null,
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
                loader: 'babel',
                include: __dirname + '/src'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            __PRODUCTION__: true,
            __DEVELOPMENT__: false,
            __DEVTOOLS__: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),        
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin()
    ]
}