import Service from 'request-pre';
import axios from 'axios';
import { stringify } from 'qs';
import addConfigs from './add.configs';
import { getFilenameFromContentDispositionHeader } from './tools';
import paramsSerializer from './paramsSerializer';
import cookie from '@/utils/cookie';

const formatContentType = function (contentType, data) {
    const map = {
        'application/x-www-form-urlencoded'(data) {
            return stringify(data);
        },
    };
    return map[contentType] ? map[contentType](data) : data;
};

/**
 * 目前主要测试的是 get 请求
 * 图片，文件，和文件流形式的下载
 * https://raw.githubusercontent.com/vusion/cloud-ui/master/src/assets/images/1.jpg
 * 支持 query 参数
 */
function download(url) {
    const { path, method, body = {}, headers = {}, query = {} } = url;

    return axios({
        url: path,
        method,
        params: query,
        data: formatContentType(headers['Content-Type'], body),
        responseType: 'blob',
    }).then((res) => {
        // 包含 content-disposition， 从中解析名字，不包含 content-disposition 的获取请求地址的后缀
        const effectiveFileName = res.request.getAllResponseHeaders().includes('content-disposition') ? getFilenameFromContentDispositionHeader(res.request.getResponseHeader('content-disposition')) : res.request.responseURL.split('/').pop();
        const { data, status, statusText } = res;
        const downloadUrl = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', effectiveFileName); // any other extension
        document.body.appendChild(link);
        link.click();
        link.remove();
        return Promise.resolve({
            data: {
                code: status,
                msg: statusText,
            },
        });
    }).catch((err) =>
        // 基于 AxiosError 的错误类型 https://github.com/axios/axios/blob/b7e954eba3911874575ed241ec2ec38ff8af21bb/index.d.ts#L85
        Promise.resolve({
            data: {
                code: err.code,
                msg: err.response.statusText,
            },
        }));
}

const requester = function (requestInfo) {
    // requestInfo = cloneDeep(requestInfo, (value) => value === undefined ? null : value);

    const { url, config = {} } = requestInfo;
    const { path, method, body = {}, headers = {}, query = {} } = url;
    const baseURL = config.baseURL ? config.baseURL : '';
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    if (!headers.Authorization && cookie.get('authorization')) {
        headers.Authorization = cookie.get('authorization');
    }
    headers.DomainName = window.appInfo?.domainName;
    if (window.appInfo?.frontendName)
        headers['LCAP-FRONTEND'] = window.appInfo?.frontendName;
    // 时区信息，默认是user
    headers.TimeZone = window.appInfo?.appTimeZone || 'user';

    if (config.download) {
        return download(url);
    }
    let data;
    const method2 = method.toUpperCase();
    if (Array.isArray(body) || Object.keys(body).length || ['PUT', 'POST', 'PATCH', 'DELETE'].includes(method2)) {
        data = formatContentType(headers['Content-Type'], body);
    }
    // eslint-disable-next-line prefer-arrow-callback
    axios.interceptors.response.use(function (response) {
        if (response.headers.authorization) {
            response.data.authorization = response.headers.authorization;
        }
        return response;
        // eslint-disable-next-line prefer-arrow-callback
    }, function (error) {
        return Promise.reject(error);
    });
    const req = axios({
        params: query,
        paramsSerializer,
        baseURL,
        method: method2,
        url: path,
        data,
        headers,
        withCredentials: !baseURL,
        xsrfCookieName: 'csrfToken',
        xsrfHeaderName: 'x-csrf-token',

    });
    return req;
};
const service = new Service(requester);
addConfigs(service);

// 调整请求路径
const adjustPathWithSysPrefixPath = (apiSchemaList) => {
    const newApiSchemaMap = {};
    if (apiSchemaList) {
        for (const key in apiSchemaList) {
            if (!newApiSchemaMap[key]) {
                const { url, ...others } = apiSchemaList[key] || {};
                newApiSchemaMap[key] = {
                    url: {
                        ...url,
                    },
                    ...others,
                };
            }
            const newApiSchema = newApiSchemaMap[key];
            const path = newApiSchema?.url?.path;
            const sysPrefixPath = window.appInfo?.sysPrefixPath;
            if (path && path.startsWith('/') && sysPrefixPath) {
                newApiSchema.url.path = sysPrefixPath + path;
            }
        }
    }
    return newApiSchemaMap;
};

export const createService = function createService(apiSchemaList, serviceConfig, dynamicServices) {
    const fixServiceConfig = serviceConfig || {};
    fixServiceConfig.config = fixServiceConfig.config || {};
    Object.assign(fixServiceConfig.config, {
        httpCode: true,
        httpError: true,
        shortResponse: true,
    });
    serviceConfig = fixServiceConfig;
    const newApiSchemaMap = adjustPathWithSysPrefixPath(apiSchemaList);
    return service.generator(newApiSchemaMap, dynamicServices, serviceConfig);
};

export const createLogicService = function createLogicService(apiSchemaList, serviceConfig, dynamicServices) {
    const fixServiceConfig = serviceConfig || {};
    fixServiceConfig.config = fixServiceConfig.config || {};
    Object.assign(fixServiceConfig.config, {
        httpCode: true,
        httpError: true,
        shortResponse: true,
        concept: 'Logic',
    });
    serviceConfig = fixServiceConfig;
    const newApiSchemaMap = adjustPathWithSysPrefixPath(apiSchemaList);
    return service.generator(newApiSchemaMap, dynamicServices, serviceConfig);
};
