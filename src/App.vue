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
import { localCacheVariableMixin } from '@/mixins/localCacheVariableMixin';

const newDomain = location.host.split('.').includes('163');
const serviceMap = {
    checkSfToken: `${location.protocol}//sfsso.community1.lcap.qz.163yun.com/api/checkSfToken`,
    checkSfTokenNew: `${location.protocol}//sfsso-community1.app.codewave.163.com/api/checkSfToken`,
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
