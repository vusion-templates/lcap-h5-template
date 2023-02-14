import Vue from 'vue';
import { installOptions, installFilters, installDirectives, install } from '@vusion/utils';
import * as Vant from '@lcap/mobile-ui';
// import { directives, MEmitter, MPubSub } from 'cloud-ui.vusion';
// 👆TreeShaking效果不理想
import * as directives from 'cloud-ui.vusion/src/directives';
import MEmitter from 'cloud-ui.vusion/src/components/m-emitter.vue';
import MPubSub from 'cloud-ui.vusion/src/components/m-pub-sub.vue';

import 'cloud-ui.vusion.css';

import '@/assets/css/index.css';
import filters from '@/filters';
import { AuthPlugin, DataTypesPlugin, LogicsPlugin, RouterPlugin, ServicesPlugin, UtilsPlugin } from '@/plugins';
import { userInfoGuard, getAuthGuard, getTitleGuard, initRouter } from '@/router';
import { filterRoutes } from '@/utils/route';
import App from './App.vue';

window.appVue = Vue;
// 梳理下来只有install被使用过
window.CloudUI = {
    install,
};

// 预览沙箱不需要调用init来初始化，但是需要使用到CloudUI和Vant组件，所以放在外边
installOptions(Vue);
installDirectives(Vue, directives);
Vue.mixin(MEmitter);
Vue.mixin(MPubSub);
Vue.use(Vant);

// 需要兼容老应用的制品，因此新版本入口函数参数不做改变
const init = (appConfig, platformConfig, routes, metaData) => {
    window.appInfo = Object.assign(appConfig, platformConfig);

    installFilters(Vue, filters);

    Vue.use(LogicsPlugin, metaData);
    Vue.use(RouterPlugin);
    Vue.use(ServicesPlugin, metaData);
    Vue.use(AuthPlugin, appConfig);
    Vue.use(DataTypesPlugin, metaData);
    Vue.use(UtilsPlugin, metaData);

    // 已经获取过权限接口
    Vue.prototype.hasLoadedAuth = false;

    // 是否已经登录
    Vue.prototype.logined = true;
    const baseResourcePaths = platformConfig.baseResourcePaths || [];
    const authResourcePaths = platformConfig.authResourcePaths || [];
    const baseRoutes = filterRoutes(routes, null, (route, ancestorPaths) => {
        const routePath = route.path;
        const completePath = [...ancestorPaths, routePath].join('/');
        let completeRedirectPath = '';
        const redirectPath = route.redirect;
        if (redirectPath) {
            completeRedirectPath = [...ancestorPaths, redirectPath].join('/');
        }
        return baseResourcePaths.includes(completePath) || completeRedirectPath;
    });

    const router = initRouter(baseRoutes);

    router.beforeEach(userInfoGuard);
    router.beforeEach(getAuthGuard(router, routes, authResourcePaths, appConfig));
    router.beforeEach(getTitleGuard(appConfig));

    const app = new Vue({
        name: 'app',
        router,
        ...App,
    });
    app.$mount('#app');
    return app;
};

export default {
    init,
};

