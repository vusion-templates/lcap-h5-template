import merge from 'lodash/merge';

import { createService } from '@/utils/create';
import apiConfig from './api.config';
import api from './api';

function addMockPreview(obj) {
    if (/localhost/.test(location.href)) {
        Object.keys(obj).forEach((key) => {
            obj[key].url.path = '/proxy/nuims' + obj[key].url.path;
        });
    }
    return obj;
}
const service = createService(addMockPreview(merge(api, apiConfig)));

export default service;
