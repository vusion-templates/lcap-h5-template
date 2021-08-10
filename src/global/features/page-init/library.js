import '../../../../node_modules/cloud-ui.vusion/dist-raw/index.css';
import Vue from 'vue';
import * as CloudUI from 'cloud-ui.vusion';
import { installOptions, installDirectives, installComponents } from '@vusion/utils';
import mock from '@vusion/mock'; // 用于物料添加时的填充默认数据

installOptions(Vue);
installDirectives(Vue, CloudUI.directives);
installComponents(Vue, CloudUI);

Vue.mixin(CloudUI.MEmitter);
Vue.mixin(CloudUI.MPubSub);
Vue.use(mock);
