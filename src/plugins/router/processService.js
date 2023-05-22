import { initService as processInitService } from '@/apis/process';
import $auth from '../auth/index';

let assignee;
export default {
    async getTasks(param = {}) {
        const userInfo = await $auth.getUserInfo() || {};
        assignee = userInfo.UserId;
        const { query } = param;
        const res = await processInitService().getTasks({
            path: {
                domainName: window.appInfo && window.appInfo.domainName,
            },
            query: {
                ...query,
                assignee,
            },
        });
        return res;
    },
    async claimTask(param = {}) {
        const { path = {} } = param;
        const res = await processInitService().claimTask({
            path: {
                ...path,
                domainName: window.appInfo && window.appInfo.domainName,
            },
            body: {
                assignee,
            },
        });
        return res;
    },
    async getDestinationUrl(param = {}) {
        const { path: { id } } = param;
        const res = await processInitService().getDestinationUrl({
            path: {
                id,
                domainName: window.appInfo && window.appInfo.domainName,
            },
            query: {
                assignee,
            },
        });
        return res;
    },
};
