
const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2

let libraryName = 'csclient';

let plugins = [], outputFile;

if (env === 'build') {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            compress: {
                unused: true,
                dead_code: true,
                warnings: false,
                drop_debugger: true,
                conditionals: true,
                evaluate: true,
                drop_console: true,
                sequences: true,
                booleans: true,
            }
        }));
    outputFile = libraryName + '.[name].min.js';
} else {
    outputFile = libraryName + '.[name].js';
}

const output = {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd'
    // umdNamedDefine: true
};

const mod = {
    rules: [
        {
            test: /\.ts$/,
            exclude: /node_modules/,
            enforce: 'pre',
            loader: 'tslint-loader'
        },
        {
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: 'awesome-typescript-loader'
        },
        {
            test: /\.html$/,
            loader: 'raw-loader',
            exclude: ['./src/index.html']
        }, {
            test: /\.scss$/,
            use: [{
                loader: 'style-loader'
            },
            {
                loader: 'css-loader'
            },
            {
                loader: 'sass-loader'
            }
            ]
        },
        {
            test: /\.css$/,
            use: [{
                loader: 'style-loader'
            },
            {
                loader: 'css-loader'
            }
            ]
        }
    ]
};

function buildConfig(entry, externals, analyzer) {
    let pl = [];
    if (analyzer) pl.push(new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'reports/report.' + analyzer + '.html',
        generateStatsFile: false
    }));
    return baseConfig =
        {
            entry: entry,
            // entry: __dirname + '/src/index.ts',
            devtool: 'source-map',
            output: output,
            module: mod,
            externals: externals,
            resolve: {
                extensions: ['.ts', '.js', '.html']               
            },
            plugins: plugins.concat(pl)
        };
}

const config = [
    buildConfig({ cs: ["./src/index.ts"] }, { 'vue':'Vue','vuetify':'vuetify' })
    // , buildConfig({ vuebundle: ["vue", "vue-router"] }, 'csvue')
];

module.exports = config;
