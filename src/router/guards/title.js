import Vue from 'vue';
import isFunction from 'lodash/isFunction';

export const getComponentOption = function (routerItem) {
    if (routerItem.components.default) {
        const ctor = routerItem.components.default._Ctor;
        let componentOptions;
        if (ctor && ctor[0]) {
            componentOptions = ctor[0].options;
        } else {
            componentOptions = Vue.extend(routerItem.components.default).options;
        }
        return componentOptions;
    }
};

export const getTitleGuard = (appConfig) => (to, from, next) => {
    const appendTitle = (title) => title;
    const metaTitle = to.matched.concat().reverse().map((item) => {
        const componentOptions = getComponentOption(item);
        return componentOptions?.meta?.title || item.meta?.title;
    }).filter((i) => i)[0];
    if (metaTitle) {
        document.title = appendTitle(isFunction(metaTitle) ? metaTitle(to, from) : metaTitle);
    }
    next();
};
