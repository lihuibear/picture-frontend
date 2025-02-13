<template>
  <div id="app">
    <BaseLayout />
  </div>
</template>

<script setup lang="ts">
import { healthUsingGet } from '@/api/mainController.ts'
import BaseLayout from '@/layouts/BaseLayout.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

const loginUserStore = useLoginUserStore()
loginUserStore.fetchLoginUser()
healthUsingGet().then((res) => {
  console.log(res)
})
</script>
