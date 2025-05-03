<template>
  <div class="register-container">
    <img class="logo-img" src="@/assets/images/login-logo.png" alt="logo" />

    <div id="register" class="register-form">
      <van-overlay :show="loading">
        <van-loading color="#4caf50" vertical>注册中...</van-loading>
      </van-overlay>

      <div class="input-group">
        <van-field
          v-model.trim="form.name"
          placeholder="请输入姓名/昵称"
          maxlength="50"
          clearable
          :rules="[{ required: true, message: '请输入姓名/昵称' }]"
        />
      </div>

      <div class="input-group">
        <van-field
          v-model.trim="form.phone"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          clearable
          :error="form.phone.length > 0 && !form.phoneIsValid"
          error-message="请输入有效的11位手机号"
          @blur="validatePhoneOnBlur"
          :rules="[{ required: true, message: '请输入手机号' }, { validator: asyncValidatePhone, message: '请输入有效的11位手机号' }]"
        />
      </div>

      <div class="input-group">
        <van-field
          v-model.trim="form.email"
          placeholder="请输入邮箱地址"
          type="email"
          maxlength="50"
          clearable
          :error="form.email.length > 0 && !form.emailIsValid"
          :error-message="emailValidationMessage"
          @blur="validateEmailOnBlur"
          :rules="[{ required: true, message: '请输入邮箱地址' }, { validator: asyncValidateEmail, message: '邮箱格式不正确' }]"
        />
      </div>

      <div class="input-group">
        <van-field
          v-model="form.password"
          placeholder="请输入密码 (6-20位)"
          type="password"
          maxlength="20"
          clearable
          :rules="[{ required: true, message: '请输入密码' }, { validator: validatePassword, message: '密码长度需为6-20位' }]"
        />
      </div>

      <div class="input-group">
        <van-field
          v-model="form.confirmPassword"
          placeholder="请确认密码"
          type="password"
          maxlength="20"
          clearable
          :rules="[{ required: true, message: '请确认密码' }, { validator: validateConfirmPassword, message: '两次输入的密码不一致' }]"
        />
      </div>


      <div class="input-group">
        <van-radio-group v-model="form.sex" direction="horizontal" class="sex-radio-group">
          <van-radio name="1" checked-color="#4caf50">男</van-radio>
          <van-radio name="2" checked-color="#4caf50">女</van-radio>
        </van-radio-group>
      </div>

      <div class="input-group code-container">
        <van-field
          v-model.trim="form.code"
          placeholder="请输入邮箱验证码"
          maxlength="6"
          clearable
          class="code-input"
          :rules="[{ required: true, message: '请输入验证码' }]"
        />
      </div>

      <div class="agreement-code-row">
        <div class="divAgreement">
          <van-checkbox v-model="agreePolicy" icon-size="16px" checked-color="#4caf50">
             我已阅读并同意<a href="#" @click.prevent="showPolicy">《隐私政策》</a>
          </van-checkbox>
        </div>
        <van-button
           size="small"
           type="default"
           class="get-code-btn"
           @click="getCode"
           :disabled="isCountingDown || !form.emailIsValid || !agreePolicy"
           :style="codeButtonStyle"
        >
          {{ getCodeText }}
        </van-button>
      </div>

      <div class="divMsg" v-if="generalErrorMessage">{{ generalErrorMessage }}</div>

      <van-button
          type="primary"
          block
          native-type="submit"
          :loading="loading"
          :disabled="!canRegister"
          @click="btnRegister"
          class="register-btn"
          loading-text="注册中..."
          :color="canRegister ? '#4CAF50' : '#a5d6a7'"
          :class="{ 'button-disabled': !canRegister }"
        >
          注册
        </van-button>

      <div class="login-link">
        已有账号？ <router-link to="/login">立即登录</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showNotify, showDialog } from 'vant';
import { sendEmailCodeApi } from '@/api/login';
import { registerApi } from '@/api/register';

const router = useRouter();
const form = ref({
name: '',
phone: '',
email: '',
password: '',
confirmPassword: '',
sex: '1',
code: '',
emailIsValid: false,
phoneIsValid: false,
});
const emailValidationMessage = ref('');
const generalErrorMessage = ref('');
const loading = ref(false);
const agreePolicy = ref(false);
const isCountingDown = ref(false);
const countdown = ref(60);
const getCodeText = ref('获取验证码');
let timer = null;

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone) => /^1[3-9]\d{9}$/.test(phone);
const validatePassword = (val) => val && val.length >= 6 && val.length <= 20;
const validateConfirmPassword = (val) => val === form.value.password;

const asyncValidateEmail = (val) => {
  form.value.emailIsValid = validateEmail(val);
  if (!form.value.emailIsValid && val.length > 0) {
      emailValidationMessage.value = '邮箱格式不正确';
      return Promise.reject('邮箱格式不正确');
  }
  emailValidationMessage.value = '';
  return Promise.resolve();
}
const asyncValidatePhone = (val) => {
  form.value.phoneIsValid = validatePhone(val);
   if (!form.value.phoneIsValid && val.length > 0) {
      return Promise.reject('请输入有效的11位手机号');
  }
  return Promise.resolve();
}


const canRegister = computed(() => {
return form.value.name &&
       form.value.phoneIsValid &&
       form.value.emailIsValid &&
       validatePassword(form.value.password) &&
       form.value.password === form.value.confirmPassword &&
       form.value.sex &&
       form.value.code &&
       agreePolicy.value;
});

const codeButtonStyle = computed(() => ({
  color: isCountingDown.value ? '#ccc' : (form.value.emailIsValid && agreePolicy.value ? '#4caf50' : '#aaa'),
  cursor: isCountingDown.value ? 'default' : (form.value.emailIsValid && agreePolicy.value ? 'pointer' : 'not-allowed')
}));

const clearError = () => {
generalErrorMessage.value = '';
};

const validateEmailOnBlur = () => {
  form.value.emailIsValid = validateEmail(form.value.email);
  if (!form.value.emailIsValid && form.value.email.length > 0) {
      emailValidationMessage.value = '邮箱格式不正确';
  } else if (form.value.emailIsValid && emailValidationMessage.value === '邮箱格式不正确') {
       emailValidationMessage.value = '';
  }
};

const validatePhoneOnBlur = () => {
  form.value.phoneIsValid = validatePhone(form.value.phone);
};

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
if (!agreePolicy.value) { showNotify({ type: 'warning', message: '请先阅读并同意《隐私政策》' }); return; }
if (!form.value.email) { showNotify({ type: 'warning', message: '请输入邮箱地址' }); return; }
if (!validateEmail(form.value.email)) { showNotify({ type: 'warning', message: '邮箱格式不正确' }); return; }

form.value.emailIsValid = true; // Assume valid if validation passed
clearError();
isCountingDown.value = true;
getCodeText.value = `${countdown.value}s后重试`;

timer = setInterval(() => {
  if (countdown.value > 1) {
    countdown.value--;
    getCodeText.value = `${countdown.value}s后重试`;
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

const btnRegister = async () => {
clearError();
// 前端基本校验 (Vant Form 的 rules 会做更严格的校验)
if (!agreePolicy.value) { showNotify({ type: 'warning', message: '请先同意隐私政策' }); return; }
if (!form.value.name || !form.value.phone || !form.value.email || !form.value.password || !form.value.confirmPassword || !form.value.code || !form.value.sex) {
    showNotify({ type: 'warning', message: '请填写所有必填项' });
    return;
}
 if (!validatePhone(form.value.phone)) { showNotify({ type: 'warning', message: '手机号格式不正确' }); return; }
 if (!validateEmail(form.value.email)) { showNotify({ type: 'warning', message: '邮箱格式不正确' }); return; }
 if (!validatePassword(form.value.password)) { showNotify({ type: 'warning', message: '密码长度需为6-20位' }); return; }
 if (form.value.password !== form.value.confirmPassword) { showNotify({ type: 'warning', message: '两次输入的密码不一致' }); return; }


loading.value = true;

try {
  const registrationData = {
    name: form.value.name,
    phone: form.value.phone,
    email: form.value.email,
    password: form.value.password, // 发送明文密码给后端
    sex: form.value.sex,
    code: form.value.code
  };

  const response = await registerApi(registrationData);

  if (response?.data?.code === 1) {
    showToast('注册成功！');
    router.replace('/login');
  } else {
    generalErrorMessage.value = response?.data?.msg || '注册失败，请稍后重试';
    showNotify({ type: 'warning', message: generalErrorMessage.value });
  }
} catch (error) {
  console.error("注册失败:", error);
  generalErrorMessage.value = '注册请求出错，请检查网络或联系管理员';
  showNotify({ type: 'danger', message: '注册请求出错' });
} finally {
  loading.value = false;
}
};

onUnmounted(() => {
if (timer) {
  clearInterval(timer);
}
});

watch(() => form.value.email, (newVal) => {
  form.value.emailIsValid = validateEmail(newVal);
  if (form.value.emailIsValid && emailValidationMessage.value === '邮箱格式不正确') {
     emailValidationMessage.value = '';
  }
});

watch(() => form.value.phone, (newVal) => {
  form.value.phoneIsValid = validatePhone(newVal);
});

</script>

<style scoped>
.register-container { display: flex; flex-direction: column; align-items: center; padding: 20px 15px 50px 15px; background-color: #f8fbf6; min-height: 100vh; box-sizing: border-box; }
.logo-img { display: block; padding-top: 30px; padding-bottom: 25px; width: 130px; height: auto; }
.register-form { width: 100%; max-width: 450px; box-sizing: border-box; }
.input-group { margin-bottom: 16px; border-radius: 25px; background-color: #ffffff; border: 1px solid #eef3e8; overflow: hidden; height: 48px; display: flex; align-items: center; transition: border-color 0.2s ease-in-out; }
.input-group:focus-within { border-color: #4CAF50; }
.input-group .van-cell { padding: 0 18px !important; height: 100% !important; background-color: transparent !important; border: none !important; font-size: 15px !important; color: #333; align-items: center; }
:deep(.input-group .van-field__control) { color: #333; height: 100%; line-height: normal; font-size: 15px; }
:deep(.input-group .van-field__control::placeholder) { color: #aeaeae !important; font-size: 15px !important; }
.input-group.has-error { border-color: #ee0a24 !important; }
:deep(.input-group .van-field__error-message) { font-size: 12px; text-align: right; padding-right: 18px; }
.sex-radio-group.van-radio-group--horizontal { padding: 0 18px; height: 100%; width: 100%; justify-content: flex-start; align-items: center; }
.sex-radio-group .van-radio { margin-right: 35px !important; }
:deep(.sex-radio-group .van-radio__label) { font-size: 15px !important; color: #333 !important; line-height: 1.2; }
.code-container {}
.code-input {}
.agreement-code-row { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; margin-bottom: 20px; height: auto; min-height: 24px; }
.divAgreement { display: flex; align-items: center; flex-shrink: 1; margin-right: 10px; }
.divAgreement .van-checkbox { font-size: 13px; }
:deep(.divAgreement .van-checkbox__label) { color: #757575; line-height: 1.4; }
.divAgreement a { color: #4CAF50; text-decoration: none; margin: 0 2px; }
.divAgreement a:hover { text-decoration: underline; }
.get-code-btn.van-button--small { font-size: 13px !important; height: auto; padding: 4px 0; border: none; background: none; white-space: nowrap; flex-shrink: 0; line-height: 1.4; }
.divMsg { color: #ee0a24; font-size: 12px; text-align: center; margin-bottom: 10px; height: 16px; line-height: 16px; }
.register-btn.van-button { width: 100% !important; height: 48px !important; border-radius: 25px !important; font-size: 16px !important; font-weight: 500; border: none !important; margin-top: 10px; transition: background-color 0.3s ease, opacity 0.3s ease; background-color: #4CAF50; color: #ffffff; }
.register-btn.button-disabled { background-color: #a5d6a7 !important; opacity: 0.7 !important; color: #ffffff !important; }
.login-link { text-align: center; margin-top: 20px; font-size: 14px; color: #757575; }
.login-link a { color: #4CAF50; text-decoration: none; font-weight: 500; }
.login-link a:hover { text-decoration: underline; }
:deep(.van-overlay) { background-color: rgba(255, 255, 255, 0.7); }
:deep(.van-loading__text) { color: #4CAF50; }
</style>