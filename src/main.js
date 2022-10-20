import Vue from 'vue';
import { installOptions, installDirectives, installComponents } from '@vusion/utils';
import * as Vant from '@lcap/mobile-ui/dist-theme';
import * as CloudUI from 'cloud-ui.vusion/dist';

import metaData from './metaData.json';
import platformConfig from './platform.config.json';
import { routes } from './router/routes';
import './library';
import { init } from './init';

init(platformConfig?.appConfig, platformConfig, routes, metaData);

installOptions(Vue);
installDirectives(Vue, CloudUI.directives);
installComponents(Vue, CloudUI);
Vue.mixin(CloudUI.MEmitter);
Vue.mixin(CloudUI.MPubSub);
Vue.use(Vant);
