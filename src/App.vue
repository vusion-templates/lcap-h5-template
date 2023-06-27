<template>
    <div>
        <s-freesass-banner v-if="isFreeSass"></s-freesass-banner>
        <router-view></router-view>
        <s-freesass-login @afterShufanLogin="afterShufanLogin" ref="freeSassLogin"></s-freesass-login>
        <s-freesass-transfer v-if="isPersonSass && loginFinished" ref="freesassTransfer"></s-freesass-transfer>
    </div>
</template>

<script>
import SFreesassLogin from '@/components/s-freesass-login.vue';
import SFreesassBanner from '@/components/s-freesass-banner.vue';
import SFreesassTransfer from '@/components/s-freesass-transfer';
import storage from './utils/storage/localStorage';
import isEmpty from 'lodash/isEmpty';

const newDomain = location.host.split('.').includes('163');
const serviceMap = {
    checkSfToken: `${location.protocol}//sfsso.community1.lcap.qz.163yun.com/api/checkSfToken`,
    checkSfTokenNew: `${location.protocol}//sfsso-community1.app.codewave.163.com/api/checkSfToken`,
};

const ACTION_LOCAL_CACHE_VARIABLE_TYPE = {
    GET: 'get',
    UPDATE: 'update',
    UNDEFINED: 'undefined'
};

// 定义一个名为 visibilityMixin 的全局混入对象
const localCacheVariableMixin = {
    beforeMount() {
        this.actionLocalCacheVariable(ACTION_LOCAL_CACHE_VARIABLE_TYPE.GET);
    },
    mounted() {
        document.addEventListener("visibilitychange", this.handleVisibilityChange);
    },
    beforeDestroy() {
        this.actionLocalCacheVariable(ACTION_LOCAL_CACHE_VARIABLE_TYPE.UPDATE);
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    },
    methods: {
        handleVisibilityChange() {
            if (document.hidden && typeof this.actionLocalCacheVariable === 'function') {
                this.actionLocalCacheVariable(ACTION_LOCAL_CACHE_VARIABLE_TYPE.UPDATE);
            }
        },
        actionLocalCacheVariable(type = ACTION_LOCAL_CACHE_VARIABLE_TYPE.UNDEFINED) {
            const localCacheVariableSet = this.$localCacheVariableSet;
            const { frontendVariables } = this.$global;


            for (const localCacheVariableKey of localCacheVariableSet) {

                switch (type) {
                    // 从 localCache 中获取数据
                    case ACTION_LOCAL_CACHE_VARIABLE_TYPE.GET:
                        const localCacheValue = storage.get(localCacheVariableKey, true);
                        // 若存在 localCacheValue 则同步到 frontendVariables
                        if (localCacheValue) {
                            frontendVariables[localCacheVariableKey] = localCacheValue;
                        }

                        break;
                    // 将 frontendVariables 中的数据同步到 localCache 触发时机 应用销毁前 & 应用切换到后台
                    case ACTION_LOCAL_CACHE_VARIABLE_TYPE.UPDATE:
                        const currentValue = frontendVariables[localCacheVariableKey];

                        // 只同步写入非空值 避免 local 过多冗余数据
                        if (isEmpty(currentValue)) {
                            storage.remove(localCacheVariableKey);
                        } else {
                            storage.set(localCacheVariableKey, currentValue, true);
                        }

                        break;

                    default:
                        console.warn('actionLocalCacheVariable: type is undefined', type);
                        break;
                }

            }
        },

    }
};

export default {
    mixins: [localCacheVariableMixin],
    components: { SFreesassLogin, SFreesassBanner, SFreesassTransfer },
    data() {
        return {
            loginFinished: false,
        };
    },
    computed: {
        isSharePage() {
            let str = 'lcap.qz.163yun';
            if (newDomain) { str = 'app.codewave.163'; }
            const neteaseStrList = str.split('.');
            return neteaseStrList.some((it) => location.host.includes(it));
        },
        isPersonSass() {
            return +window.appInfo?.tenantType === 1;
        },
        isFreeSass() {
            return +window.appInfo?.tenantType === 1 && +window.appInfo?.tenantLevel === 0;
        },
    },
    async mounted() {
        // alert('🚀 appInfo: ' + JSON.stringify(window.appInfo));
        if (this.isSharePage && +window.appInfo?.tenantType === 1) {
            try {
                let url = serviceMap.checkSfToken;
                if (newDomain) { url = serviceMap.checkSfTokenNew; }
                // 校验接口
                const res = await fetch(url, {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include',
                });
                const data = await res.json();
                // data.Code  === 200
                if (data?.Data === true) {
                    // 制品有sf_token 什么都不做
                } else {
                    this.$refs.freeSassLogin.open();
                }
            } catch (error) {
                console.error('CheckExtendToken: ', error);
                this.$refs.freeSassLogin.open();
            }
        }
    },
    methods: {
        afterShufanLogin() {
            this.loginFinished = true;
        },
    },
};

</script>
