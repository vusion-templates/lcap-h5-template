/* eslint-disable new-cap */
import { VanToast as Toast } from '@lcap/mobile-ui';

export default {
    defaults({ config }, err) {
        if (!config.noErrorTip) {
            Toast({
                message: err.msg || '系统错误，请查看日志',
                position: 'top',
            });
        }
    },
    500({ config }, err = {}) {
        if (!config.noErrorTip) {
            Toast({
                message: err.msg || '系统错误，请查看日志',
                position: 'top',
            });
        }
    },
    501({ config }, err = {}) {
        // 遇到服务端中止，前端也要中止程序
        if (err.Code === 501 && err.Message === 'abort') {
            throw Error('程序中止');
        }
    },
    400({ config }, err = {}) {
        if (!config.noErrorTip) {
            Toast({
                message: err.msg || '系统错误，请查看日志',
                position: 'top',
            });
        }
    },
    400({ config }, err = {}) {
        if (!config.noErrorTip) {
            Toast({
                message: err.msg || '系统错误，请查看日志',
                position: 'top',
            });
        }
    },
    401({ config }, err = {}) {
        if (err.Code === 401 && err.Message === 'token.is.invalid') {
            if (window.LcapMicro?.loginFn) {
                window.LcapMicro.loginFn();
                return;
            }
        }
        if (err.Code === 401 && err.Message === 'token.is.invalid') {
            location.href = '/login';
        }
    },
    403({ config }, err = {}) {
        if (err.Code === 'InvalidToken' && err.Message === 'Token is invalid') {
            if (!config.noErrorTip) {
                Toast({
                    message: '登录失效，请重新登录',
                    position: 'top',
                });
            }
            location.href = '/login';
        }
    },
    remoteError({ config }, err) {
        if (!config.noErrorTip) {
            Toast({
                message: '系统错误，请查看日志',
                position: 'top',
            });
        }
    },
    localError({ config }, err) {
        if (!config.noErrorTip) {
            Toast({
                message: '系统错误，请查看日志',
                position: 'top',
            });
        }
    },
};
