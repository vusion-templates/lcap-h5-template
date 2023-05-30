import Vue from 'vue';
import queryString from 'query-string';

import { initService as authInitService } from '@/apis/auth';
import cookie from '@/utils/cookie';
import { initService as lowauthInitService } from '@/apis/lowauth';

import { getBasePath } from '@/utils/encodeUrl';

const getBaseHeaders = () => {
    const headers = {
        Env: window.appInfo && window.appInfo.env,
    };
    if (cookie.get('authorization')) {
        headers.Authorization = cookie.get('authorization');
    }
    return headers;
};

const request = function (times) {
    let userInfoPromise;
    if (window.appInfo.hasUserCenter) {
        userInfoPromise = lowauthInitService().GetUser({
            headers: getBaseHeaders(),
            config: {
                noErrorTip: true,
            },
        });
    } else {
        userInfoPromise = authInitService().GetUser({
            headers: getBaseHeaders(),
            config: {
                noErrorTip: true,
            },
        });
    }
    return userInfoPromise.then((result) => result.Data).catch((err) => {
        times--;
        if (times > 0) {
            return request(times);
        } else {
            throw err;
        }
    });
};

let userInfoPromise = null;
let userResourcesPromise = null;

export default {
    _map: undefined,
    authService: undefined,
    lowauthInitService: undefined,
    start() {
        this.authService = authInitService();
        this.lowauthInitService = lowauthInitService();
        window.authService = this.authService;
    },
    getUserInfo(times = 1) {
        if (!userInfoPromise) {
            userInfoPromise = request(times).then((userInfo) => {
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
            if (window.appInfo.hasAuth) {
                userResourcesPromise = this.lowauthInitService.GetUserResources({
                    headers: getBaseHeaders(),
                    query: {
                        userId: Vue.prototype.$global.userInfo.UserId,
                        userName: Vue.prototype.$global.userInfo.UserName,
                    },
                    config: {
                        noErrorTip: true,
                    },
                }).then((result) => {
                    let resources = [];
                    // 初始化权限项
                    this._map = new Map();
                    if (Array.isArray(result)) {
                        resources = result.filter((resource) => resource?.resourceType === 'ui');
                        resources.forEach((resource) => this._map.set(resource.resourceValue, resource));
                    }
                    return resources;
                }).catch((e) => {
                    // 获取权限异常
                    userResourcesPromise = undefined;
                });
            } else {
                userResourcesPromise = this.authService.GetUserResources({
                    headers: getBaseHeaders(),
                    query: {
                        DomainName,
                    },
                    config: {
                        noErrorTip: true,
                    },
                }).then((result) => {
                    const resources = result.Data.items.filter((resource) => resource.ResourceType === 'ui');

                    // 初始化权限项
                    this._map = new Map();
                    resources.forEach((resource) => this._map.set(resource.ResourceValue, resource));
                    return resources;
                }).catch((e) => {
                    // 获取权限异常
                    userResourcesPromise = undefined;
                });
            }
        }
        return userResourcesPromise;
    },
    async getKeycloakLogoutUrl() {
        let logoutUrl = '';
        const basePath = getBasePath();
        if (window.appInfo.hasUserCenter) {
            const res = await this.lowauthInitService.getAppLoginTypes({
                query: {
                    Action: 'GetTenantLoginTypes',
                    Version: '2020-06-01',
                    TenantName: window.appInfo.tenant,
                },
            });
            const KeycloakConfig = res?.Data.Keycloak;
            if (KeycloakConfig) {
                logoutUrl = `${KeycloakConfig?.config?.logoutUrl}?redirect_uri=${window.location.protocol}//${window.location.host}${basePath}/login`;
            }
        } else {
            const res = await this.authService.getNuimsTenantLoginTypes({
                query: {
                    Action: 'GetTenantLoginTypes',
                    Version: '2020-06-01',
                    TenantName: window.appInfo.tenant,
                },
            });
            const KeycloakConfig = res?.Data.find((item) => (item.LoginType === 'Keycloak'));

            if (KeycloakConfig) {
                logoutUrl = `${KeycloakConfig?.extendProperties?.logoutUrl}?redirect_uri=${window.location.protocol}//${window.location.host}${basePath}/login`;
            }
        }

        return logoutUrl;
    },
    async logout() {
        const sleep = (t) => new Promise((r) => setTimeout(r, t));
        if (window.appInfo.hasUserCenter) {
            const logoutUrl = await this.getKeycloakLogoutUrl();
            localStorage.setItem('logoutUrl', logoutUrl);
            if (logoutUrl) {
                window.location.href = logoutUrl;
                await sleep(1000);
            } else {
                return this.lowauthInitService.Logout({
                    headers: getBaseHeaders(),
                }).then(() => {
                    // 用户中心，去除认证和用户名信息
                    cookie.erase('authorization');
                    cookie.erase('username');
                });
            }
        } else {
            const logoutUrl = await this.getKeycloakLogoutUrl();
            localStorage.setItem('logoutUrl', logoutUrl);
            if (logoutUrl) {
                window.location.href = logoutUrl;
                await sleep(1000);
            } else {
                return this.authService.Logout({
                    headers: getBaseHeaders(),
                }).then(() => {
                    cookie.erase('authorization');
                    cookie.erase('username');
                });
            }
        }
    },
    loginH5(data) {
        return this.authService.LoginH5({
            headers: getBaseHeaders(),
            ...data,
        });
    },
    getNuims(query) {
        return this.authService.GetNuims({
            headers: getBaseHeaders(),
            query,
        });
    },
    getConfig() {
        return this.authService.GetConfig({
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
    init(domainName) {
        return this.getUserInfo().then(() => this.getUserResources(domainName));
    },
    /**
     * 是否有权限
     * @param {*} authPath 权限路径，如 /dashboard/entity/list
     */
    has(authPath, domainName) {
        return (this._map && this._map.has(authPath)) || false;
    },
};

export const runAhead = function (domainName) {
    authInitService().init(domainName);
};
