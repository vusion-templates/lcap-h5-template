import { createService } from '@/global/features/service/create';
import api from './api';
import apiConfig from './api.config';
import merge from 'lodash/merge';
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
