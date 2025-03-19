<template>
  <div id="userRegisterPage">
    <h2 class="title">云图库 - 用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" label-align="left" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item
        name="userEmail"
        :rules="[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]"
      >
        <a-input v-model:value="formState.userEmail" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item name="verifyCode" :rules="[{ required: true, message: '请输入验证码' }]">
        <div style="display: flex; gap: 8px">
          <a-input v-model:value="formState.verifyCode" placeholder="请输入验证码" />
          <a-button @click="getverifyCode" :disabled="isButtonDisabled">{{ buttonText }}</a-button>
        </div>
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[{ required: true, message: '请输入密码' }, { min: 8, message: '密码不能小于 8 位' }]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item
        name="checkPassword"
        :rules="[{ required: true, message: '请输入确认密码' }, { min: 8, message: '确认密码不能小于 8 位' }]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
      </a-form-item>
      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { userRegisterUsingPost } from '@/api/userController.ts'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mailUsingGet } from '@/api/sendMailController.ts'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userEmail: '',
  verifyCode: '',
  userPassword: '',
  checkPassword: '',
})

const router = useRouter()
const isButtonDisabled = ref(false)
const buttonText = ref('获取验证码')
let timer: number | null = null

const getverifyCode = async () => {
  if (!formState.userEmail) {
    message.warning('请先输入邮箱')
    return
  }

  isButtonDisabled.value = true
  buttonText.value = '请 60 秒后再重试'

  try {
    // 确保邮箱地址没有二次编码，直接传递原始邮箱
    const encodedEmail = formState.userEmail // 不做多余的 encodeURIComponent 编码

    // 使用 mailUsingGet 来发送邮件请求，传递正确的邮箱地址
    const response = await mailUsingGet({ targetEmail: encodedEmail })
    if (response) {
      message.success('验证码已发送，请查收邮箱')
    } else {
      throw new Error('验证码发送失败')
    }
  } catch (error) {
    message.error(error.message || '获取验证码失败')
    isButtonDisabled.value = false
    buttonText.value = '获取验证码'
    return
  }

  let second = 60
  const countdown = () => {
    if (second === 0) {
      buttonText.value = '获取验证码'
      isButtonDisabled.value = false
      return
    }
    buttonText.value = `请 ${second} 秒后再重试`
    second--
    timer = window.setTimeout(countdown, 1000)
  }
  countdown()
}

const handleSubmit = async () => {
  if (formState.userPassword !== formState.checkPassword) {
    message.error('两次输入的密码不一致')
    return
  }

  try {
    const res = await userRegisterUsingPost({
      userAccount: formState.userAccount,
      userEmail: formState.userEmail,
      verifyCode: formState.verifyCode,
      userPassword: formState.userPassword,
      checkPassword: formState.checkPassword,
    })

    if (res.data.code === 0) {
      message.success('注册成功')
      router.push('/user/login')
    } else {
      message.error(`注册失败：${res.data.message}`)
    }
  } catch (error) {
    message.error('注册请求失败，请稍后重试')
  }
}
</script>

<style scoped>
#userRegisterPage {
  max-width: 360px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 16px;
}

.desc {
  text-align: center;
  color: #bbb;
  margin-bottom: 16px;
}

.tips {
  margin-bottom: 16px;
  color: #bbb;
  font-size: 13px;
  text-align: right;
}
</style>
