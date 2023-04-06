// import generate from '@babel/generator';
import { Decimal } from 'decimal.js';

import configuration from '@/apis/configuration';
import cookie from '@/utils/cookie';
import storage from '@/utils/storage/localStorage';
import authService from '../auth/authService';
import { initApplicationConstructor, genSortedTypeKey, genInitData, isInstanceOf } from './tools';
import { navigateToUserInfoPage } from '../common/wx';

export default {
    install(Vue, options = {}) {
        const dataTypesMap = options.dataTypesMap || {}; // TODO 统一为  dataTypesMap

        initApplicationConstructor(dataTypesMap);

        const genInitFromSchema = (typeKey, defaultValue, level) => genInitData(typeKey, defaultValue, level);

        /**
         * read datatypes from template, then parse schema
         * @param {*} schema 是前端用的 refSchema
         */
        Vue.prototype.$genInitFromSchema = genInitFromSchema;

        const frontendVariables = {};
        if (Array.isArray(options && options.frontendVariables)) {
            options.frontendVariables.forEach((frontendVariable) => {
                const { name, typeAnnotation, defaultValue } = frontendVariable;
                frontendVariables[name] = genInitFromSchema(genSortedTypeKey(typeAnnotation), defaultValue);
            });
        }

        const $global = {
            // 用户信息
            userInfo: {},
            // 前端全局变量
            frontendVariables,
            // 加
            add(x, y) {
                if (typeof (x) !== 'number' || typeof (y) !== 'number') {
                    return x + y;
                }
                if (!x) {
                    x = 0;
                }
                if (!y) {
                    y = 0;
                }
                const xx = new Decimal(x + '');
                const yy = new Decimal(y + '');
                return xx.plus(yy).toNumber();
            },
            // 减
            minus(x, y) {
                if (!x) {
                    x = 0;
                }
                if (!y) {
                    y = 0;
                }
                const xx = new Decimal(x + '');
                const yy = new Decimal(y + '');
                return xx.minus(yy).toNumber();
            },
            // 乘
            multiply(x, y) {
                if (!x) {
                    x = 0;
                }
                if (!y) {
                    y = 0;
                }
                const xx = new Decimal(x + '');
                const yy = new Decimal(y + '');
                return xx.mul(yy).toNumber();
            },
            // 除
            divide(x, y) {
                if (!x) {
                    x = 0;
                }
                if (!y) {
                    y = 0;
                }
                const xx = new Decimal(x + '');
                const yy = new Decimal(y + '');
                return xx.div(yy).toNumber();
            },
            // 相等
            isEqual(x, y) {
                return x == y;
            },
            requestFullscreen() {
                return document.body.requestFullscreen();
            },
            exitFullscreen() {
                return document.exitFullscreen();
            },
            hasAuth(authPath) {
                return authService.has(authPath);
            },
            getLocation() {
                return new Promise((res, rej) => {
                    function showPosition(position) {
                        const { latitude, longitude } = position.coords;
                        const [mglng, mglat] = [longitude, latitude];
                        res(`${mglng},${mglat}`);
                    }
                    function showError(error) {
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                window.Vue.prototype.$toast.show('用户禁止获取地理定位');
                                rej({ code: error.code, msg: '用户禁止获取地理定位' });
                                break;
                            case error.POSITION_UNAVAILABLE:
                                window.Vue.prototype.$toast.show('地理定位信息无法获取');
                                rej({ code: error.code, msg: '地理定位信息无法获取' });
                                break;
                            case error.TIMEOUT:
                                window.Vue.prototype.$toast.show('地理定位信息获取超时');
                                rej({ code: error.code, msg: '地理定位信息获取超时' });
                                break;
                            case error.UNKNOWN_ERROR:
                                window.Vue.prototype.$toast.show('未知错误');
                                rej({ code: error.code, msg: '未知错误' });
                                break;
                        }
                    }
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(showPosition, showError);
                    } else {
                        window.Vue.prototype.$toast.show('当前系统不支持地理定位');
                        rej({ code: 666, msg: '当前系统不支持地理定位' });
                    }
                });
            },
            getIsMiniApp() {
                return window.__wxjs_environment === 'miniprogram';
            },

            getWeChatOpenid() {
                return localStorage.getItem('_wx_openid');
            },
            getWeChatHeadImg() {
                return localStorage.getItem('_wx_headimg');
            },
            getWeChatNickName() {
                return localStorage.getItem('_wx_nickname');
            },
            navigateToUserInfo() {
                navigateToUserInfoPage();
            },

            getDistance(s1, s2) {
                function deg2rad(deg) {
                    return deg * (Math.PI / 180);
                }
                const lat1t = s1.split(',')[1];
                const lng1t = s1.split(',')[0];
                const lat2t = s2.split(',')[1];
                const lng2t = s2.split(',')[0];

                const R = 6371; // Radius of the earth in km
                const dLat = deg2rad(lat2t - lat1t); // deg2rad below
                const dLon = deg2rad(lng2t - lng1t);
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                    + Math.cos(deg2rad(lat1t)) * Math.cos(deg2rad(lat2t)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c; // Distance in km
                return d * 1000;
            },
            logout() {
                window.vant.VanDialog.confirm({
                    title: '提示',
                    message: '确定退出登录吗?',
                }).then(async () => {
                    try {
                        await authService.logout();
                    } catch (error) {
                        console.warn(error);
                    }

                    storage.set('Authorization', '');
                    // cookie.eraseAll();
                    cookie.erase('authorization');
                    cookie.erase('username');
                    window.location.href = '/login';
                }).catch(() => {
                    // on cancel
                });
            },
            async getCustomConfig(configKey = '') {
                const configKeys = configKey.split('.');
                const finalConfigKey = configKeys.pop();
                const groupName = configKeys[configKeys.length - 2];
                const query = {
                    group: groupName,
                };
                if (configKey.startsWith('extensions.')) {
                    query.group = `${configKeys[0]}.${configKeys[1]}.${groupName}`;
                }
                const res = await configuration.getCustomConfig({
                    path: { configKey: finalConfigKey },
                    query,
                });
                return res;
            },
        };
        new Vue({
            data: {
                $global,
            },
        });

        Vue.prototype.$global = $global;

        Vue.prototype.$isInstanceOf = isInstanceOf;

        const enumsMap = options.enumsMap || {};
        function createEnum(items) {
            const Enum = (key) => items[key];
            Object.assign(Enum, items);
            return Enum;
        }
        Object.keys(enumsMap).forEach((enumKey) => {
            enumsMap[enumKey] = createEnum(enumsMap[enumKey] || {});
        });

        function isLooseEqualFn(obj1, obj2, cache = new Map()) {
            // 检查对象是否相同
            if (obj1 === obj2) {
                return true;
            }
            // 对象是否已经比较过，解决循环依赖的问题
            if (cache.has(obj1) && cache.get(obj1) === obj2) {
                return true;
            }
            // 判断类型相等
            if (typeof obj1 !== typeof obj2) {
                return false;
            }
            // 判断数组长度或者对象属性数量一致
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) {
                return false;
            }
            // 加入缓存中
            cache.set(obj1, obj2);
            // 比较属性中的每个值是否一致
            for (const key of keys1) {
                const val1 = obj1[key];
                const val2 = obj2[key];
                // 递归
                if (typeof val1 === 'object' && typeof val2 === 'object') {
                    if (!isLooseEqualFn(val1, val2, cache)) {
                        return false;
                    }
                } else {
                    // 判断非对象的值是否一致
                    if (val1 !== val2) {
                        return false;
                    }
                }
            }
            return true;
        }

        // 判断两个对象是否相等，不需要引用完全一致
        Vue.prototype.$isLooseEqualFn = isLooseEqualFn;

        Vue.prototype.$enums = (key, value) => {
            if (!key || !value)
                return '';
            if (enumsMap[key]) {
                return enumsMap[key](value);
            } else {
                return '';
            }
        };

        // 实体的 updateBy 和 deleteBy 需要提前处理请求参数
        function parseRequestDataType(root, prop, event, current) {
            // eslint-disable-next-line no-eval
            const value = eval(root[prop]);
            const type = typeof value;
            // console.log('type:', type, value)
            if (type === 'number') {
                root.concept = 'NumericLiteral';
                root.value = value + '';
            } else if (type === 'string') {
                root.concept = 'StringLiteral';
                root.value = value;
            } else if (type === 'boolean') {
                root.concept = 'BooleanLiteral';
                root.value = value;
            } else if (type === 'object') {
                if (Array.isArray(value)) {
                    const itemValue = value[0];
                    if (itemValue !== undefined) {
                        const itemType = typeof itemValue;
                        root.concept = 'ListLiteral';
                        if (itemType === 'number') {
                            root.value = value.map((v) => v + '').join(',');
                        } else if (itemType === 'string') {
                            root.value = value.map((v) => "'" + v + "'").join(',');
                        } else if (itemType === 'boolean') {
                            root.value = value.join(',');
                        }
                    }
                }
            }
        }

        // 实体的 updateBy 和 deleteBy 需要提前处理请求参数
        function resolveRequestData(root, event, current) {
            if (!root)
                return;
            // console.log(root.concept)
            delete root.folded;

            if (root.concept === 'NumericLiteral') {
                // eslint-disable-next-line no-self-assign
                root.value = root.value;
            } else if (root.concept === 'StringLiteral') {
                // eslint-disable-next-line no-self-assign
                root.value = root.value;
            } else if (root.concept === 'NullLiteral') {
                delete root.value;
            } else if (root.concept === 'BooleanLiteral') {
                root.value = root.value === 'true';
            } else if (root.concept === 'Identifier') {
                parseRequestDataType.call(this, root, 'expression', event, current);
            } else if (root.concept === 'MemberExpression') {
                if (root.expression) {
                    parseRequestDataType.call(this, root, 'expression', event, current);
                }
            }
            resolveRequestData.call(this, root.left, event, current);
            resolveRequestData.call(this, root.right, event, current);
            return root;
        }

        Vue.prototype.$resolveRequestData = resolveRequestData;
    },
};
