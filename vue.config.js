const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const pkg = require('./package.json');
const pages = require('./pages.json');
const argv = require('minimist')(process.argv.slice(2));
if (argv.pages) {
    argv.pages = argv.pages.split(',');
    Object.keys(pages).forEach((key) => {
        if (!argv.pages.includes(key))
            delete pages[key];
    });
}
if (Object.keys(pages).length > 1) {
    Object.keys(pages).forEach((key) => {
        if (pages[key].micro) {
            console.warn(`page[${key}] is microApp`);
            delete pages[key];
        }
    });
}
const isDevelopment = process.env.NODE_ENV === 'development';
const publicPathPrefix = process.env.SITE_TYPE === 'gh-pages' ? `https://vusion-templates.github.io/${pkg.name}` : '/';

const port = argv.port || 8810;

const devServer = require('./webpack.dev-server')(port);

const webpackMicro = require('./webpack/micro');
const isMicro = false && webpackMicro.isMicro(pages);

const webpackDll = require('./webpack/dll');
const webpackCloudUI = require('./webpack/cloud-ui');
const webpackStyle = require('./webpack/style');
const webpackDesigner = require('./webpack/designer');
const webpackRoutes = require('./webpack/routes');
const webpackHtml = require('./webpack/html');
const webpackGQL = require('./webpack/gqloader');
const webpackOptimization = require('./webpack/optimization');
const isDesigner = process.env.BUILD_LIB_ENV === 'designer';

if (isMicro) {
    webpackMicro.setup(pages);
}
const assetsDir = 'public';
let baseConfig = {
    publicPath: publicPathPrefix,
    assetsDir,
    productionSourceMap: false,
    transpileDependencies: [
        /lodash/,
        'resize-detector',
        /cloud-ui\.vusion/,
        /vusion-micro-app/,
        /@cloud-ui/,
        /vant/,
        /@lcap\/mobile-ui/,
    ],
};
if (isMicro) {
    baseConfig = webpackMicro.config(baseConfig, port, isDevelopment);
}

if (isDesigner) {
    webpackDesigner.config(baseConfig, pages);
}
const vueConfig = {
    ...baseConfig,
    pages,
    chainWebpack(config) {
        if (isDesigner) {
            webpackDesigner.chain(config, pages);
            config
                .plugin('html')
                .use(HtmlWebpackPlugin, [{}])
                .tap((args) => {
                    args[0].template = path.resolve('./demo.html');
                    return args;
                });
        } else {
            webpackHtml.chain(config, isDevelopment);
            if (isMicro) {
                webpackMicro.chain(config, isDevelopment);
            } else {
                webpackDll.chain(config, publicPathPrefix, isDevelopment);
            }
        }
        webpackOptimization.chain(config, isDevelopment);

        webpackCloudUI.chain(config);
        webpackStyle.chain(config);
        webpackRoutes.chain(config);
        webpackGQL.chain(config);
        config.output.jsonpFunction('webpackJsonp' + pkg.name + (isMicro ? Object.keys(pages)[0] : ''));

        config.module.rule('js').uses.delete('cache-loader');
    },
    devServer,
};

module.exports = vueConfig;
