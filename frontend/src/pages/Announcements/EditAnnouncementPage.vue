<script setup>
import { useRoute } from 'vue-router'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import AnnouncementWizard from '@/components/announcements/wizard/AnnouncementWizard.vue'

const route = useRoute()
</script>

<template>
  <div class="edit-page">
    <div class="container">
      <Breadcrumbs />
      <h1 class="edit-page__title">Редактировать объявление</h1>
      <AnnouncementWizard
        mode="edit"
        :announcement-id="route.params.id"
      />
    </div>
  </div>
</template>

<style scoped>
.edit-page {
  padding: 20px 0 40px;
}

.edit-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

@media (max-width: 640px) {
  .edit-page__title {
    font-size: 24px;
  }
}
</style>