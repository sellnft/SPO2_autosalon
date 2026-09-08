<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const layout = computed(() => route.meta.layout || 'DefaultLayout')
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>