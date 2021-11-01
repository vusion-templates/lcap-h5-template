import '../../../../node_modules/cloud-ui.vusion/dist-raw/index.css';
import Vue from 'vue';
import * as CloudUI from 'cloud-ui.vusion';
import { installOptions, installDirectives, installComponents } from '@vusion/utils';
import mock from '@vusion/mock'; // 用于物料添加时的填充默认数据
// let cloudCountn = 0;
// const interC = setInterval(() => {
//     cloudCountn++;
//     if (cloudCountn > 20) {
//         clearInterval(interC);
//     }
//     if (!(/h5/.test(location.href) && /designer/.test(location.href))) {
//         clearInterval(interC);
//         return null;
//     }
//     if (window.CloudUI) {
//         installOptions(Vue);
//         installDirectives(Vue, window.CloudUI.directives);
//         installComponents(Vue, window.CloudUI);

//         Vue.mixin(window.CloudUI.MEmitter);
//         Vue.mixin(window.CloudUI.MPubSub);
//         Vue.use(mock);
//         clearInterval(interC);
//     }
// }, 500);

installOptions(Vue);
installDirectives(Vue, CloudUI.directives);
installComponents(Vue, CloudUI);

Vue.mixin(CloudUI.MEmitter);
Vue.mixin(CloudUI.MPubSub);
Vue.use(mock);
window.CloudUI = CloudUI;
