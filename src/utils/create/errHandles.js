/* eslint-disable new-cap */
import { VanToast as Toast } from '@lcap/mobile-ui';

export default {
    defaults({ config }, err) {
        if (!config.noErrorTip) {
            Toast(err.msg || '系统错误，请联系管理员！');
        }
    },
    500({ config }, err = {}) {
        if (!config.noErrorTip) {
            Toast(err.msg || '系统错误，请联系管理员！');
        }
    },
    400({ config }, err = {}) {
        if (!config.noErrorTip) {
            Toast(err.msg || '系统错误，请联系管理员！');
        }
    },
    403({ config }, err = {}) {
        if (err.Code === 'InvalidToken' && err.Message === 'Token is invalid') {
            if (!config.noErrorTip) {
                Toast('登录失效', '请重新登录');
            }
            location.href = '/login';
        }
    },
    remoteError({ config }, err) {
        if (!config.noErrorTip) {
            Toast('系统错误，请联系管理员！');
        }
    },
    localError({ config }, err) {
        if (!config.noErrorTip) {
            Toast('系统错误，请联系管理员！');
        }
    },
};
