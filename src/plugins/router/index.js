import encodeUrl from '@/utils/encodeUrl';

import processService from './processService';

function downloadClick(realUrl, target) {
    const a = document.createElement('a');
    a.setAttribute('href', realUrl);
    a.setAttribute('target', target);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 500);
}

import { navigateTo } from '../common/wx';
export default {
    install(Vue, options = {}) {
        /**
         * 流程接口注册
         */
        Vue.prototype.$process = processService;

        Vue.prototype.$destination = function (url, target = '_self') {
            if (target === '_self') {
                // 修复访问路径为默认首页 / 时跳转可能失效的问题
                if (url.startsWith('http'))
                    location.href = encodeUrl(url);
                else {
                    /* 判断是否在小程序当中 */
                    if (window.__wxjs_environment === 'miniprogram') {
                        navigateTo({ url });
                    } else {
                        this.$router.push(url);
                    }
                }
            } else {
                if (window.__wxjs_environment === 'miniprogram') {
                    navigateTo({ url });
                } else {
                    downloadClick(url, target);
                }
            }
        };

        Vue.prototype.$link = async function (url, target = '_self') {
            let realUrl;
            if (typeof url === 'function') {
                realUrl = await url();
            } else {
                realUrl = url;
            }
            downloadClick(realUrl, target);
        };
    },
};
