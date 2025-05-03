<template>
  <div class="login-container">
    <img class="logo-img" src="@/assets/images/login-logo.png" alt="logo" />

    <div id="login" class="login-form">
      <van-overlay :show="loading">
        <van-loading color="#4caf50" vertical>加载中...</van-loading>
      </van-overlay>

      <van-tabs v-model:active="loginType" swipeable line-width="60" color="#4CAF50">
        <van-tab title="邮箱登录" name="email">
          <div class="tab-content">
            <div class="input-group">
              <van-field
                v-model.trim="form.email"
                name="emailLogin"
                placeholder="请输入邮箱地址"
                type="email"
                maxlength="50"
                clearable
                :rules="[{ required: true, message: '请输入邮箱地址' }, { validator: asyncValidateEmail, message: '邮箱格式不正确' }]"
              />
            </div>
            <div class="input-group code-container">
              <van-field
                v-model.trim="form.code"
                name="emailCode"
                placeholder="请输入邮箱验证码"
                maxlength="6"
                clearable
                class="code-input"
                :rules="[{ required: true, message: '请输入验证码' }]"
              />
              <van-button
                  size="small"
                  type="default"
                  class="get-code-btn-inline"
                  @click="getCode"
                  :disabled="isCountingDown || !form.emailIsValidForCode"
                  :style="codeButtonStyle"
               >
                {{ getCodeText }}
              </van-button>
            </div>
          </div>
        </van-tab>

        <van-tab title="密码登录" name="password">
           <div class="tab-content">
              <div class="input-group">
                  <van-field
                      v-model.trim="form.email"
                      name="passwordLoginEmail"
                      placeholder="请输入邮箱地址"
                      type="email"
                      maxlength="50"
                      clearable
                      :rules="[{ required: true, message: '请输入邮箱地址' }, { validator: asyncValidateEmail, message: '邮箱格式不正确' }]"
                  />
              </div>
              <div class="input-group">
                  <van-field
                      v-model="form.password"
                      name="password"
                      placeholder="请输入密码"
                      type="password"
                      maxlength="20"
                      clearable
                      :rules="[{ required: true, message: '请输入密码' }]"
                  />
              </div>
           </div>
        </van-tab>
      </van-tabs>

       <div class="agreement-row">
           <van-checkbox v-model="agreePolicy" icon-size="16px" checked-color="#4caf50">
               我已阅读并同意<a href="#" @click.prevent="showPolicy">《隐私政策》</a>
           </van-checkbox>
        </div>

      <div class="divMsg" v-if="generalErrorMessage">{{ generalErrorMessage }}</div>

      <div class="button-row">
        <van-button
          native-type="submit"
          block
          :loading="loading"
          :disabled="!canLogin"
          @click="btnLogin"
          class="login-btn"
          loading-text="登录中..."
          :color="canLogin ? '#4CAF50' : '#a5d6a7'"
          :class="{ 'button-disabled': !canLogin }"
        >
          登录
        </van-button>
        <van-button
          type="default"
          block
          @click="goToRegister"
          class="register-btn"
        >
          注册
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showNotify, showDialog } from 'vant';
import { sendEmailCodeApi, loginApi } from '@/api/login';
// --- 新增：导入 User Store ---
import { useUserStore } from '@/stores/user';

const router = useRouter();
// --- 新增：获取 User Store 实例 ---
const userStore = useUserStore();

const loginType = ref('email'); // 'email' or 'password'
const form = ref({
  email: '',
  code: '',
  password: '',
  emailIsValid: false,
  emailIsValidForCode: false // Separate state for enabling code button
});
const generalErrorMessage = ref('');
const loading = ref(false);
const agreePolicy = ref(false);
const isCountingDown = ref(false);
const countdown = ref(60);
const getCodeText = ref('获取验证码');
let timer = null;

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const asyncValidateEmail = (val) => {
  form.value.emailIsValid = validateEmail(val);
  if (!form.value.emailIsValid && val.length > 0) {
      // 返回 Promise.reject 才能触发 Vant 的校验失败状态
      return Promise.reject('邮箱格式不正确');
  }
  // 如果校验通过，需要返回 Promise.resolve() 或 true
  return Promise.resolve();
}

watch(() => form.value.email, (newVal) => {
  form.value.emailIsValidForCode = validateEmail(newVal);
});


const canLogin = computed(() => {
  if (!agreePolicy.value) return false;
  if (loginType.value === 'email') {
    // email 验证需要更可靠的方式，直接使用 emailIsValidForCode
    return form.value.emailIsValidForCode && form.value.code && form.value.code.length === 6; // 假设验证码是6位
  } else { // password login
    return form.value.emailIsValidForCode && form.value.password;
  }
});

const codeButtonStyle = computed(() => ({
  color: isCountingDown.value ? '#ccc' : (form.value.emailIsValidForCode ? '#4caf50' : '#aaa'),
  cursor: isCountingDown.value ? 'default' : (form.value.emailIsValidForCode ? 'pointer' : 'not-allowed')
}));

const showPolicy = () => {
  showDialog({ title: '隐私政策', message: '此处为隐私政策内容...' }).catch(() => {});
};

const resetCodeButton = () => {
  clearInterval(timer);
  isCountingDown.value = false;
  getCodeText.value = '获取验证码';
  countdown.value = 60;
  timer = null;
};

const getCode = async () => {
  if (isCountingDown.value) return;
  if (!form.value.email) { showNotify({ type: 'warning', message: '请输入邮箱地址' }); return; }
  if (!validateEmail(form.value.email)) { showNotify({ type: 'warning', message: '邮箱格式不正确' }); return; }

  form.value.emailIsValidForCode = true;
  generalErrorMessage.value = '';
  isCountingDown.value = true;
  getCodeText.value = `${countdown.value}s`;

  timer = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--;
      getCodeText.value = `${countdown.value}s`;
    } else {
      resetCodeButton();
    }
  }, 1000);

  try {
    const response = await sendEmailCodeApi({ email: form.value.email });
    if (response?.data?.code === 1) {
      showNotify({ type: 'success', message: response.data.msg || '验证码已发送' });
    } else {
      showNotify({ type: 'warning', message: response?.data?.msg || '验证码发送失败' });
      resetCodeButton();
    }
  } catch (error) {
    console.error("发送验证码失败:", error);
    showNotify({ type: 'danger', message: '请求发送验证码接口出错' });
    resetCodeButton();
  }
};

const btnLogin = async () => {
  generalErrorMessage.value = '';
  if (!agreePolicy.value) { showNotify({ type:'warning', message:'请先阅读并同意《隐私政策》'}); return; }
  if (!validateEmail(form.value.email)) { showNotify({ type:'warning', message:'请输入有效的邮箱地址'}); return; }

  const loginData = {
      email: form.value.email,
      loginType: loginType.value
  };

  if (loginType.value === 'email') {
      if (!form.value.code) { showNotify({ type:'warning', message:'请输入验证码'}); return; }
      loginData.code = form.value.code;
  } else {
      if (!form.value.password) { showNotify({ type:'warning', message:'请输入密码'}); return; }
      loginData.password = form.value.password;
  }

  loading.value = true;
  try {
    const response = await loginApi(loginData);

    if (response?.data?.code === 1 && response.data.data) {
      // --- 修改：调用 Store 的 loginSuccess 方法 ---
      const loginResult = userStore.loginSuccess(response.data.data);
      if (loginResult) {
        showToast('登录成功');
        // 登录成功后，尝试跳转到之前的重定向目标，如果没有则跳转到首页
        const redirect = router.currentRoute.value.query.redirect || '/';
        router.replace(redirect);
      } else {
         // loginSuccess 内部可能因为数据问题返回 false
         generalErrorMessage.value = '处理用户信息失败';
         showNotify({ type: 'danger', message: generalErrorMessage.value });
      }

    } else {
      generalErrorMessage.value = response?.data?.msg || '登录失败，请检查输入信息';
      showNotify({ type: 'warning', message: generalErrorMessage.value });
    }
  } catch (error) {
    console.error("Login error:", error);
   
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.login-container { display: flex; flex-direction: column; align-items: center; padding: 20px 15px 50px 15px; background-color: #f8fbf6; min-height: 100vh; box-sizing: border-box; }
.logo-img { display: block; padding-top: 40px; padding-bottom: 30px; width: 130px; height: auto; }
.login-form { width: 100%; max-width: 450px; box-sizing: border-box; }

/* Tabs styling */
:deep(.van-tabs__nav) { background-color: transparent; border-bottom: 1px solid #eef3e8; margin-bottom: 10px; }
:deep(.van-tab) { color: #757575; }
:deep(.van-tab--active) { color: #4CAF50; font-weight: 500; }
.tab-content { padding-top: 15px; } 

.input-group { margin-bottom: 16px; border-radius: 25px; background-color: #ffffff; border: 1px solid #eef3e8; overflow: hidden; height: 48px; display: flex; align-items: center; transition: border-color 0.2s ease-in-out; }
.input-group:focus-within { border-color: #4CAF50; }
.input-group .van-cell { padding: 0 18px !important; height: 100% !important; background-color: transparent !important; border: none !important; font-size: 15px !important; color: #333; align-items: center; flex-grow: 1; } /* Field should grow */
:deep(.input-group .van-field__control) { color: #333; height: 100%; line-height: normal; font-size: 15px; }
:deep(.input-group .van-field__control::placeholder) { color: #aeaeae !important; font-size: 15px !important; }
.input-group.has-error { border-color: #ee0a24 !important; }
:deep(.input-group .van-field__error-message) { font-size: 12px; text-align: right; padding-right: 18px; }

.code-container { padding-right: 10px; } /* Space for inline button */
.code-input { flex-grow: 1; } /* Let input take available space */
.get-code-btn-inline.van-button--small { font-size: 13px !important; height: auto; padding: 4px 0 4px 10px; border: none; background: none; white-space: nowrap; flex-shrink: 0; line-height: 1.4; margin-left: 5px; } /* Inline button style */

.agreement-row { display: flex; justify-content: flex-start; align-items: center; padding: 5px 5px 15px 5px; font-size: 13px; } /* Agreement row below tabs */
.agreement-row .van-checkbox { font-size: 13px; }
:deep(.agreement-row .van-checkbox__label) { color: #757575; line-height: 1.4; }
.agreement-row a { color: #4CAF50; text-decoration: none; margin: 0 2px; }
.agreement-row a:hover { text-decoration: underline; }

.divMsg { color: #ee0a24; font-size: 12px; text-align: center; margin-bottom: 10px; min-height: 16px; line-height: 16px; }

.button-row { display: flex; gap: 15px; margin-top: 20px; } /* Container for buttons */
.login-btn.van-button, .register-btn.van-button { width: 100% !important; height: 48px !important; border-radius: 25px !important; font-size: 16px !important; font-weight: 500; border: none !important; transition: background-color 0.3s ease, opacity 0.3s ease; flex-grow: 1; }
.login-btn { background-color: #4CAF50; color: #ffffff; }
.login-btn.button-disabled { background-color: #a5d6a7 !important; opacity: 0.7 !important; color: #ffffff !important; }
.register-btn { background-color: #ffffff; border: 1px solid #4CAF50 !important; color: #4CAF50; }
.register-btn:active { background-color: #e8f5e9; }

:deep(.van-overlay) { background-color: rgba(255, 255, 255, 0.7); }
:deep(.van-loading__text) { color: #4CAF50; }
</style>