import Vue from 'vue';
import VueRouter from 'vue-router';

const originalPush = VueRouter.prototype.push;

VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject)
        return originalPush.call(this, location, onResolve, onReject);
    return originalPush.call(this, location).catch((err) => {
        if (VueRouter.isNavigationFailure(err)) {
        // resolve err
            return err;
        }
        // rethrow error
        return Promise.reject(err);
    });
};

export function initRouter(routes) {
    Vue.use(VueRouter);

    return new VueRouter({
        mode: 'history',
        base: process.env.BASE_URL,
        routes,
    });
}
