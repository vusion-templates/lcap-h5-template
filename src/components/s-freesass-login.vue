<template>
    <div :class="$style.login" v-if="visible">
        <div :class="$style.wrap">

            <div style="font-style: normal;font-weight: 500;font-size: 16px;color: #333333; padding: 16px; border-bottom: 1px solid #E5E5E5;;">登录/注册</div>

            <div :class="$style.title">轻舟低代码，人人皆可开发软件应用</div>
            <div :class="$style.iframeWrap" style="width:100%;height:360px;">
                <van-loading v-show="!loaded" type="spinner"></van-loading>
                <iframe
                    @load="onLoad($event)"
                    v-show="loaded"
                    ref="iframe2"
                    frameborder="0"
                    style="width:100%;height:100%;"
                    src="//id.sf.163.com/sdk-login?cmsKey=SdkLoginPage&i18nEnable=true&locale=zh_CN&h=shufanqzlcap&t=shufanqzlcap&fromnsf=lcapAppShare"></iframe>
            </div>
            <div :class="$style.content">
                <div style="width:14px;height:14px;margin-top:3px;">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 0C10.866 0 14 3.13401 14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0ZM6.28674 3.48829C6.28674 3.91693 6.63422 4.26442 7.06287 4.26442C7.49151 4.26442 7.839 3.91693 7.839 3.48829C7.839 3.05964 7.49151 2.71216 7.06287 2.71216C6.63422 2.71216 6.28674 3.05964 6.28674 3.48829ZM5.51148 10.6244C5.51148 10.8387 5.68522 11.0124 5.89954 11.0124H8.22793C8.44225 11.0124 8.61599 10.8387 8.61599 10.6244C8.61599 10.4101 8.44225 10.2363 8.22793 10.2363H7.65449V5.65902C7.65449 5.39876 7.48368 5.17839 7.24805 5.1039C7.20471 5.08718 7.15762 5.07801 7.10839 5.07801C7.09655 5.07729 7.08442 5.07693 7.07239 5.07693C7.06037 5.07693 7.04844 5.07729 7.03659 5.07801H6.20813C5.99381 5.07801 5.82006 5.25175 5.82006 5.46607C5.82006 5.6804 5.99381 5.85414 6.20813 5.85414H6.4903V10.2363H5.89954C5.68522 10.2363 5.51148 10.4101 5.51148 10.6244Z" fill="#337EFF" />
                        <path d="M6.28674 3.48853C6.28674 3.91718 6.63422 4.26466 7.06287 4.26466C7.49151 4.26466 7.839 3.91718 7.839 3.48853C7.839 3.05989 7.49151 2.7124 7.06287 2.7124C6.63422 2.7124 6.28674 3.05989 6.28674 3.48853ZM5.51147 10.6246C5.51147 10.8389 5.68522 11.0127 5.89954 11.0127H8.22793C8.44225 11.0127 8.61599 10.8389 8.61599 10.6246C8.61599 10.4103 8.44225 10.2366 8.22793 10.2366H7.65449V5.65927C7.65449 5.399 7.48368 5.17863 7.24805 5.10414C7.20471 5.08742 7.15762 5.07825 7.10839 5.07825C7.09655 5.07753 7.08442 5.07717 7.07239 5.07717C7.06037 5.07717 7.04843 5.07753 7.03659 5.07825H6.20813C5.99381 5.07825 5.82006 5.252 5.82006 5.46632C5.82006 5.68064 5.99381 5.85438 6.20813 5.85438H6.4903V10.2366H5.89954C5.68522 10.2366 5.51147 10.4103 5.51147 10.6246Z" fill="white" />
                    </svg>
                </div>

                <div>依据《互联网信息服务管理办法》，访问者需先登录低代码账号才可查看。如需无限制查看，开发者可将应用域名更换为自有域名。</div>
            </div>
        </div>

    </div>
</template>

<script>
import auth from '@/apis/auth';
import cookie from '@/utils/cookie';

export default {
    name: 's-freesass-login',
    data() {
        return {
            visible: false,
            loaded: false,
        };
    },
    created() {
        window.addEventListener('message', this.dealMessage);
    },
    methods: {
        updateHeight(value) {
            if (value < 700) {
                return;
            }
            this.$refs.iframe2.$el.style.height = `${value - 190}px`;
        },
        async dealMessage(msg) {
            if (msg?.data === 'undefined')
                return;

            if (msg?.data && typeof msg?.data === 'string' && JSON.parse(msg?.data)?.name === 'updateHeight') {
                this.updateHeight(JSON.parse(msg?.data)?.value);
            }
            if (msg?.data && typeof msg?.data === 'string' && JSON.parse(msg?.data)?.token) {
                const userId = JSON.parse(msg?.data)?.token.userId;
                this.close();
                this.$emit('afterShufanLogin', userId);
                // cookie.set({ authorization_extend_token_key: userId }, 15);
                // this.close();
                // const res = await auth.GenerateExtendToken({});
                // const token = res?.Data;
                // if (token) {
                //     cookie.set({ authorization_extend_token: token }, 15);
                // }
            }
        },
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        onLoad() {
            this.loaded = true;
        }
    },
};

</script>

<style module>
.login {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--z-index-modal, 5000);
    -webkit-overflow-scrolling: touch;
    -ms-touch-action: cross-slide-y pinch-zoom double-tap-zoom;
    touch-action: cross-slide-y pinch-zoom double-tap-zoom;
    overflow: hidden;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.6);
    padding-top: 65px;
    padding-bottom: 30px;
    animation: fadeIn 0.25s ease-out 0s 1 both;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.wrap {
    background: #fff;
    border: 1px solid #E5E5E5;
    border-radius: 4px;
    max-width: 375px;
    margin: auto;
}

.title {
    padding-top: 32px;
    font-family: 'PingFang SC';
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #333333;
    text-align: center;
}

.content {
    padding: 0 32px 32px 32px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
}

.iframeWrap {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
