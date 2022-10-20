import { UToast } from 'cloud-ui.vusion/dist';

export default {
    defaults({ config }, err) {
        if (!config.noErrorTip) {
            UToast.show(err.msg || '系统错误，请联系管理员！');
        }
    },
    500({ config }, err = {}) {
        if (!config.noErrorTip) {
            UToast.show(err.msg || '系统错误，请联系管理员！');
        }
    },
    400({ config }, err = {}) {
        if (!config.noErrorTip) {
            UToast.show(err.msg || '系统错误，请联系管理员！');
        }
    },
    403({ config }, err = {}) {
        if (err.Code === 'InvalidToken' && err.Message === 'Token is invalid') {
            if (!config.noErrorTip) {
                UToast.show('登录失效', '请重新登录');
            }
            location.href = '/login';
        }
    },
    remoteError({ config }, err) {
        if (!config.noErrorTip) {
            UToast.show('系统错误，请联系管理员！');
        }
    },
    localError({ config }, err) {
        if (!config.noErrorTip) {
            UToast.show('系统错误，请联系管理员！');
        }
    },
};
