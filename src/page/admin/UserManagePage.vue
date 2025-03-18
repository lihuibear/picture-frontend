<template>
  <div id="userManagePage">
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model="searchParams.userAccount" placeholder="输入账号" allow-clear />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model="searchParams.userName" placeholder="输入用户名" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px" />
    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image v-if="record.userAvatar" :src="record.userAvatar" :width="120" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div>
            <a-tag v-if="record.userRole === 'su_admin'" color="red">超级管理员</a-tag>
            <a-tag v-if="record.userRole === 'admin'" color="green">管理员</a-tag>
            <a-tag v-if="record.userRole === 'user'" color="blue">普通用户</a-tag>
          </div>
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="record.userRole !== 'su_admin' && column.key === 'action'">
          <a-button danger @click="doDelete(record.id)">删除</a-button>
          <a-button
            @click="editUser(record.id)"
            :disabled="
              loginUserStore.loginUser.userRole === 'admin' &&
              record.userRole === 'admin' &&
              loginUserStore.loginUser.id !== record.id
            "
          >
            编辑
          </a-button>
        </template>
        <template v-else-if="column.key === 'action'">
          <!-- 这里可以写当 userRole 是 su_admin 时的操作内容 -->
          不可操作
        </template>
      </template>
    </a-table>

    <!-- 编辑用户表单 -->
    <a-modal
      v-model:visible="isEditModalVisible"
      title="编辑用户"
      @ok="submitEditForm"
      @cancel="cancelEdit"
    >
      <a-form :model="editForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 15 }">
        <a-form-item label="用户名">
          <a-input v-model:value="editForm.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="头像">
          <a-input v-model:value="editForm.userAvatar" placeholder="请输入头像链接" />
        </a-form-item>
        <a-form-item label="简介">
          <a-textarea v-model:value="editForm.userProfile" placeholder="请输入用户简介" />
        </a-form-item>
        <a-form-item
          label="角色"
          v-if="loginUserStore.loginUser.userRole !== 'user' && !isEditingSelf"
        >
          <a-select
            v-model:value="editForm.userRole"
            :disabled="loginUserStore.loginUser.userRole !== 'su_admin' && editForm.userRole === 'admin'"
          >
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">普通用户</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deleteUserUsingPost,
  listUserVoByPageUsingPost,
  updateRootUserUsingPost, updateUserUsingPost
} from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const loginUserStore = useLoginUserStore()
const isEditModalVisible = ref(false)
const editForm = ref({
  id: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: 'user',
})

const editUser = (id: string) => {
  if (!dataList.value || dataList.value.length === 0) {
    message.error('用户数据未加载，请稍后再试')
    return
  }
  const user = dataList.value.find((user) => user.id === id)
  if (user) {
    editForm.value = { ...user }
    isEditModalVisible.value = true
  } else {
    message.error('未找到该用户')
  }
}

const submitEditForm = async () => {
  try {
    const apiMethod =
      loginUserStore.loginUser.userRole === "superAdmin" ? updateRootUserUsingPost : updateUserUsingPost;

    const res = await apiMethod(editForm.value);

    if (res.data.code === 0) {
      message.success("用户信息更新成功");
      isEditModalVisible.value = false;
      fetchData();
    } else {
      message.error("更新失败：" + res.data.message);
    }
  } catch (error) {
    console.error(error);
    message.error(
      "请求失败，请检查网络连接或稍后再试：" +
      (error.response?.data?.message || error.message)
    );
  }
};


// const submitEdit = async () => {
//   try {
//     const res = await updateUserUsingPost(editForm.value)
//     if (res.data.code === 0) {
//       message.success('用户信息更新成功')
//       isEditModalVisible.value = false
//       fetchData()
//     } else {
//       message.error('更新失败：' + res.data.message)
//     }
//   } catch (error) {
//     message.error('请求失败，请检查网络连接或稍后再试')
//     console.error(error)
//   }
// }
//
// const submitAdminEdit = async () => {
//   try {
//     const res = await updateRootUserUsingPost(editForm.value)
//     if (res.data.code === 0) {
//       message.success('用户信息更新成功')
//       isEditModalVisible.value = false
//       fetchData()
//     } else {
//       message.error('更新失败：' + res.data.message)
//     }
//   } catch (error) {
//     message.error('请求失败，请检查网络连接或稍后再试')
//     console.error(error)
//   }
// }

const isEditingSelf = computed(() => {
  return editForm.id === loginUserStore.loginUser.id
})
const cancelEdit = () => {
  isEditModalVisible.value = false
  editForm.value = {
    id: '',
    userName: '',
    userAvatar: '',
    userProfile: '',
    userRole: 'user',
  }
}

const columns = [
  { title: 'id', dataIndex: 'id' },
  { title: '账号', dataIndex: 'userAccount' },
  { title: '用户名', dataIndex: 'userName' },
  { title: '头像', dataIndex: 'userAvatar' },
  { title: '简介', dataIndex: 'userProfile' },
  { title: '用户角色', dataIndex: 'userRole' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action' },
]

const dataList = ref<API.UserVO[]>([])
const total = ref(0)

const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
})

const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchData()
})

const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

const doDelete = async (id: string) => {
  if (!id) return
  const confirmed = await confirm('确定要删除该用户吗？')
  if (!confirmed) return
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败')
  }
}
</script>
