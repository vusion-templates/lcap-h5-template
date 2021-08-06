const path = require('path');
const fs = require('fs-extra');
module.exports = {
    config(baseConfig, pages) {
        baseConfig.outputDir = (baseConfig.outputDir || 'public');
        fs.emptyDirSync(path.resolve(baseConfig.outputDir));
        Object.keys(pages).forEach((pageName) => {
            delete pages[pageName];
        });
        baseConfig.configureWebpack = {
            ...baseConfig.configureWebpack,
            output: {
                libraryExport: 'default',
            },
        };
    },
    chain(config) {
        config.externals({
            ...config.get('externals'),
            'cloud-ui.vusion': 'CloudUI',
            vant: 'vant',
        });
        // config.resolve.alias.set('cloud-ui.vusion.css$', path.resolve(__dirname, './index.css'));
    },
};
