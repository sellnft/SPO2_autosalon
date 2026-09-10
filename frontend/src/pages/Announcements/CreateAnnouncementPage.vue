<script setup>
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import AnnouncementWizard from '@/components/announcements/wizard/AnnouncementWizard.vue'
</script>

<template>
  <div class="create-page">
    <div class="container">
      <Breadcrumbs />
      <h1 class="create-page__title">Создать объявление</h1>
      <AnnouncementWizard mode="create" />
    </div>
  </div>
</template>

<style scoped>
.create-page {
  padding: 20px 0 40px;
}

.create-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

@media (max-width: 640px) {
  .create-page__title {
    font-size: 24px;
  }
}
</style>