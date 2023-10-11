import Vue from 'vue';
import VueRouter from 'vue-router';

export function initRouter(routes) {
    Vue.use(VueRouter);

    const router = new VueRouter({
        mode: 'history',
        base: process.env.BASE_URL,
        routes,
    });

    router.afterEach((to, from) => {
        const saveList = ['_wx_openid', '_wx_headimg', '_wx_nickname', '_wx_phone'];
        if (to.query)
            for (const i in to.query) {
                if (saveList.includes(i)) {
                    window.localStorage.setItem(i, to.query[i]);
                }
            }
    });
    return router;
}
