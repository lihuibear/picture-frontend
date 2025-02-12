<template>
  <div id="app">
    <BaseLayout />
  </div>
</template>

<script setup lang="ts">
import { healthUsingGet } from '@/api/mainController.ts'
import BaseLayout from '@/layouts/BaseLayout.vue'

healthUsingGet().then((res) => {
  console.log(res)
})
</script>
