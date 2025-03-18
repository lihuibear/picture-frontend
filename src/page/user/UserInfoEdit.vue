<template>
  <div class="user-info-container">
    <!-- 展示用户头像和角色标签在同一行 -->
    <div class="avatar-role-container">
      <a-avatar :size="64" :src="editableData['userAvatar'] || loginUserStore.loginUser.userAvatar">
        <template #icon>
          <UserOutlined />
        </template>
      </a-avatar>
      <a-input
        v-if="isEditing"
        v-model:value="editableData['userAvatar']"
        placeholder="请输入头像URL"
        style="margin-left: 10px; width: 200px"
      />
      <a-tag color="success">{{ displayUserRole }}</a-tag>
      {{ loginUserStore.loginUser.userName || '暂无信息' }}
    </div>
    <a-divider type="horizontal" />

    <!-- 展示用户详细信息 -->
    <div class="user-details">
      <div class="user-info-item">
        <span class="label">用户Id:</span>
        {{ loginUserStore.loginUser.id || '暂无信息' }}
      </div>
      <div class="user-info-item">
        <span class="label">用户名:</span>
        <span class="value">
          <a-input
            v-if="isEditing"
            v-model:value="editableData['userName']"
            style="margin: -5px 0"
          />
          <template v-else>{{ loginUserStore.loginUser.userName || '暂无信息' }}</template>
        </span>
      </div>
      <div class="user-info-item">
        <span class="label">用户账号:</span>
        <span class="value">
          {{ loginUserStore.loginUser.userAccount || '暂无信息' }}
        </span>
      </div>
      <div class="user-info-item">
        <span class="label">用户简介:</span>
        <span class="value">
          <a-input
            v-if="isEditing"
            v-model:value="editableData['userProfile']"
            style="margin: -5px 0"
          />
          <template v-else>{{ loginUserStore.loginUser.userProfile || '暂无信息' }}</template>
        </span>
      </div>
      <div class="user-info-item">
        <span class="label">注册时间:</span>
        <span class="value">{{
          formatDate(loginUserStore.loginUser.createTime) || '暂无信息'
        }}</span>
      </div>
    </div>

    <a-divider type="horizontal" />

    <!-- 操作按钮 -->
    <a-row justify="start" style="margin-top: 20px">
      <a-button @click="edit" style="margin-right: 10px">编辑</a-button>
      <a-button v-if="isEditing" @click="save" style="margin-right: 10px">保存</a-button>
      <a-button v-if="isEditing" @click="cancel">取消</a-button>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { UserOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { editUserUsingPost, getLoginUserUsingGet } from '../../api/userController.ts'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()

const displayUserRole = computed(() => {
  const userRole = loginUserStore.loginUser.userRole
  if (userRole === 'user') {
    return '用户'
  } else if (userRole === 'admin') {
    return '管理员'
  } else if (userRole === 'su_admin') {
    return '超级管理员'
  }
  return userRole || '暂无信息'
})

const isEditing = ref(false)
const editableData = ref({
  id: '',
  userName: '',
  userAccount: '',
  userProfile: '',
  userAvatar: '',
})

const edit = () => {
  isEditing.value = true
  editableData.value = {
    id: loginUserStore.loginUser.id || '',
    userName: loginUserStore.loginUser.userName || '',
    userAccount: loginUserStore.loginUser.userAccount || '',
    userProfile: loginUserStore.loginUser.userProfile || '',
    userAvatar: loginUserStore.loginUser.userAvatar || '',
  }
}

const save = async () => {
  if (
    editableData.value.userName === loginUserStore.loginUser.userName &&
    editableData.value.userAccount === loginUserStore.loginUser.userAccount &&
    editableData.value.userProfile === loginUserStore.loginUser.userProfile &&
    editableData.value.userAvatar === loginUserStore.loginUser.userAvatar
  ) {
    message.info('没有修改任何内容，无需保存')
    isEditing.value = false
    return
  }

  try {
    const response = await editUserUsingPost(editableData.value)
    if (response.data.code === 0) {
      message.success('保存成功')
      isEditing.value = false
      await fetchLoginUser() // 重新获取用户信息
    } else {
      message.error(`保存失败: ${response.data.message}`)
    }
  } catch (error) {
    console.error('保存出错:', error)
    message.error('保存失败，请稍后重试')
  }
}

const cancel = () => {
  isEditing.value = false
  editableData.value = {
    userName: loginUserStore.loginUser.userName || '',
    userAccount: loginUserStore.loginUser.userAccount || '',
    userProfile: loginUserStore.loginUser.userProfile || '',
    userAvatar: loginUserStore.loginUser.userAvatar || '',
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '暂无信息'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const fetchLoginUser = async () => {
  try {
    const response = await getLoginUserUsingGet()
    if (response.data.code === 0) {
      loginUserStore.setLoginUser(response.data.data)
    } else {
      console.error('获取用户信息失败:', response.data.message)
    }
  } catch (error) {
    console.error('请求出错:', error)
  }
}

onMounted(() => {
  fetchLoginUser()
})
</script>

<style scoped>
.user-info-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-role-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-role-container a-avatar {
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user-details {
  margin-top: 20px;
}

.user-info-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info-item .label {
  font-weight: 600;
  color: #333;
  width: 100px;
}

.user-info-item .value {
  font-size: 14px;
  color: #555;
}

.user-info-item a-input {
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 6px 10px;
  font-size: 14px;
  width: 300px;
}

.user-info-item a-input:focus {
  border-color: #4f84f4;
  box-shadow: 0 0 5px rgba(79, 132, 244, 0.3);
}

a-divider {
  margin: 20px 0;
}

a-row {
  margin-top: 20px;
}

a-button {
  border-radius: 6px;
  font-size: 14px;
  padding: 6px 16px;
  height: auto;
}

a-button:hover {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

a-button:focus {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

a-button + a-button {
  margin-left: 10px;
}

a-tag {
  font-weight: 500;
  font-size: 14px;
}
</style>
