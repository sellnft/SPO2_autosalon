<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

function reload() {
  window.location.reload()
}
</script>

<template>
  <div class="error-page">
    <div class="error-page__code">500</div>
    <h1 class="error-page__title">Ошибка сервера</h1>
    <p class="error-page__text">
      Что-то пошло не так. Мы уже работаем над исправлением
    </p>
    <div class="error-page__actions">
      <BaseButton @click="reload">Обновить страницу</BaseButton>
      <BaseButton variant="outline" @click="router.push('/')">На главную</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  text-align: center;
}

.error-page__code {
  font-family: 'Playfair Display', serif;
  font-size: 120px;
  font-weight: 700;
  color: #EF4444;
  line-height: 1;
  margin-bottom: 16px;
}

.error-page__title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.error-page__text {
  max-width: 400px;
  margin-bottom: 32px;
  font-size: 15px;
  color: #6B7280;
}

.error-page__actions {
  display: flex;
  gap: 12px;
}
</style>