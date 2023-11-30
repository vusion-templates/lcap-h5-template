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

export const porcessPorts = {
    async getProcessDefinitionList(query) {
        const res = await processInitService().getProcessDefinitionList({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getProcessDefinition(query) {
        const res = await processInitService().getProcessDefinition({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getProcessInstanceList(query) {
        const res = await processInitService().getProcessInstanceList({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getProcessInstance(query) {
        const res = await processInitService().getProcessInstance({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getTaskDefinitionList(query) {
        const res = await processInitService().getTaskDefinitionList({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getTaskDefinition(query) {
        const res = await processInitService().getTaskDefinition({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getTaskInstanceList(query) {
        const res = await processInitService().getTaskInstanceList({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getTaskInstance(query) {
        const res = await processInitService().getTaskInstance({
            body: {
                ...query,
            },
        });
        return res;
    },
    async claimTaskInstance(query) {
        const res = await processInitService().claimTaskInstance({
            body: {
                ...query,
            },
        });
        return res;
    },
    async unclaimTaskInstance(query) {
        const res = await processInitService().unclaimTaskInstance({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getTaskDestinationUrl(query) {
        const res = await processInitService().getTaskDestinationUrl({
            body: {
                ...query,
            },
        });
        return res;
    },
    async transferTaskInstance(query) {
        const res = await processInitService().transferTaskInstance({
            body: {
                ...query,
            },
        });
        return res;
    },
    async withdrawProcessInstance(query) {
        const res = await processInitService().withdrawProcessInstance({
            body: {
                ...query,
            },
        });
        return res;
    },
    async endProcessInstance(query) {
        const res = await processInitService().endProcessInstance({
            body: {
                ...query,
            },
        });
        return res;
    },
    async getRejectableTaskDefinitionList(query) {
        const res = await processInitService().getRejectableTaskDefinitionList({
            body: {
                ...query,
            },
        });
        return res;
    },
    async setProcessDefinitionState(query) {
        const res = await processInitService().setProcessDefinitionState({
            body: {
                ...query,
            },
        });
        return res;
    },
    async updateTaskDefinitionStrategy(query) {
        const res = await processInitService().updateTaskDefinitionStrategy({
            body: {
                ...query,
            },
        });
        return res;
    },
};
