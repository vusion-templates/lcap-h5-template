import Vue from 'vue';
import authService from '@/global/services/auth';
import cookie from '@/global/features/utils/cookie';
import queryString from 'query-string';

window.authService = authService;
let userInfoPromise = null;
let userResourcesPromise = null;
const maxTimes = 3;
const getBaseHeaders = () => ({
    Authorization: cookie.get('authorization'),
    Env: window.appInfo && window.appInfo.env || 'dev',
});
const userInfo = {
    UserName: cookie.get('zzdUserName') || '',
    UserId: cookie.get('zzdUserId') || '',
};

const $global = Vue.prototype.$global = Vue.prototype.$global || {};
$global.userInfo = userInfo;

const request = function (times) {
    return authService.GetUser({
        headers: getBaseHeaders(),
        config: {
            noErrorTip: true,
        },
    }).then((result) => result.Data).catch((err) => {
        times--;
        if (times > 0) {
            return request(times);
        } else {
            throw err;
        }
    });
};
const auth = {
    _map: undefined,
    setUserInfoFromCookie() {
        const userInfo = {
            UserName: cookie.get('zzdUserName') || '',
            UserId: cookie.get('zzdUserId') || '',
        };
        const $global = Vue.prototype.$global = Vue.prototype.$global || {};
        $global.userInfo = userInfo;
    },
    getUserInfo(times = 1) {
        if (!userInfoPromise) {
            if (window.appInfo?.hasUserCenter || window.appInfo.envConfig.name === 'zhezhengding') {
                const userInfo = {
                    UserName: cookie.get('zzdUserName') || '',
                    UserId: cookie.get('zzdUserId') || '',
                };
                userInfoPromise = Promise.resolve({ userInfo });
            } else {
                userInfoPromise = request(times);
            }
            userInfoPromise = userInfoPromise.then((userInfo) => {
                const $global = Vue.prototype.$global = Vue.prototype.$global || {};
                $global.userInfo = userInfo;
                return userInfo;
            }).catch((e) => {
                userInfoPromise = undefined;
                throw e;
            });
        }
        return userInfoPromise;
    },
    getUserResources(DomainName) {
        if (!userResourcesPromise) {
            userResourcesPromise = authService.GetUserResources({
                headers: getBaseHeaders(),
                query: {
                    DomainName,
                },
            }).then((result) => {
                const resources = result.Data.items.filter((resource) => resource.ResourceType === 'ui');

                // 初始化权限项
                this._map = new Map();
                resources.forEach((resource) => this._map.set(resource.ResourceValue, resource));
            }).catch((e) => {
                // 获取权限异常
                userResourcesPromise = undefined;
            });
        }
        return userResourcesPromise;
    },
    logout() {
        return authService.Logout({
            headers: getBaseHeaders(),
        }).then(() => {
            cookie.erase('authorization');
            cookie.erase('username');
        });
    },
    loginH5(data) {
        return authService.LoginH5({
            headers: getBaseHeaders(),
            ...data,
        });
    },
    getNuims(query) {
        return authService.GetNuims({
            headers: getBaseHeaders(),
            query,
        });
    },
    getConfig() {
        return authService.GetConfig({
            headers: getBaseHeaders(),
        });
    },
    // 处理数据的参数转化
    parse: queryString.parse,
    stringify: queryString.stringify,
    /**
     * 权限服务是否初始化
     */
    isInit() {
        return !!this._map;
    },
    /**
     * 初始化权限服务
     */
    init(domainName, times) {
        return this.getUserInfo(times || maxTimes).then(() => this.getUserResources(domainName));
    },
    /**
     * 是否有权限
     * @param {*} authPath 权限路径，如 /dashboard/entity/list
     */
    has(authPath) {
        return this._map ? this._map.has(authPath) : true;
    },
};
export default auth;

export const runAhead = function (domainName, times) {
    auth.init(domainName, times);
};
