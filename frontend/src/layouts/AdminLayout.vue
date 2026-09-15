<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const isSidebarOpen = ref(true)
const isMobile = ref(false)
const pageTitle = computed(() => route.meta?.title || 'Админ-панель')

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function handleResize() {
  isMobile.value = window.innerWidth < 1024
  isSidebarOpen.value = !isMobile.value
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => route.path, () => {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
})
</script>

<template>
  <div class="cv-admin" :class="{ 'cv-admin--sidebar-open': isSidebarOpen }">
    <div class="cv-admin__bg" aria-hidden="true">
      <div class="cv-admin__bg-orb cv-admin__bg-orb--1"></div>
      <div class="cv-admin__bg-orb cv-admin__bg-orb--2"></div>
      <div class="cv-admin__bg-orb cv-admin__bg-orb--3"></div>
      <div class="cv-admin__bg-grid"></div>
    </div>

    <AdminSidebar
      :is-open="isSidebarOpen"
      @close="closeSidebar"
    />

    <div class="cv-admin__content">
      <AdminHeader @toggle-sidebar="toggleSidebar" />

      <main class="cv-admin__main">
        <div class="cv-admin__main-inner">
          <div class="cv-admin__main-header">
            <div class="cv-admin__main-heading">
              <span class="cv-admin__main-eyebrow">
                <span class="cv-admin__main-eyebrow-dot" aria-hidden="true"></span>
                Панель управления
              </span>
              <h1 class="cv-admin__main-title">{{ pageTitle }}</h1>
            </div>

            <div class="cv-admin__main-meta">
              <span class="cv-admin__main-date">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="6" width="18" height="14" rx="2"/>
                  <path d="M3 10h18M8 6V3M16 6V3"/>
                </svg>
                {{ new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </span>
            </div>
          </div>

          <router-view v-slot="{ Component }">
            <Transition name="cv-admin-page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </div>
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<style scoped>
.cv-admin {
  position: relative;
  display: flex;
  min-height: 100vh;
  background: #0A0A0C;
  color: rgba(245, 240, 230, 0.9);
  isolation: isolate;
  overflow: hidden;
}

.cv-admin__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-admin__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.55;
}

.cv-admin__bg-orb--1 {
  top: -10%;
  left: 8%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  animation: cvAdminOrbFloat 18s ease-in-out infinite;
}

.cv-admin__bg-orb--2 {
  bottom: -15%;
  right: -5%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.16), transparent 70%);
  animation: cvAdminOrbFloat 22s ease-in-out infinite reverse;
  animation-delay: -4s;
}

.cv-admin__bg-orb--3 {
  top: 40%;
  right: 30%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.1), transparent 70%);
  animation: cvAdminOrbFloat 26s ease-in-out infinite;
  animation-delay: -8s;
}

@keyframes cvAdminOrbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.06); }
  66% { transform: translate(-30px, 20px) scale(0.94); }
}

.cv-admin__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
  opacity: 0.5;
}

.cv-admin__content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
}

.cv-admin__main {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-admin__main::-webkit-scrollbar {
  width: 10px;
}

.cv-admin__main::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 5px;
  border: 2px solid #0A0A0C;
}

.cv-admin__main::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-admin__main-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 28px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-admin__main-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  position: relative;
}

.cv-admin__main-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 120px;
  height: 1px;
  background: linear-gradient(90deg, rgba(201, 169, 97, 0.6), transparent);
}

.cv-admin__main-heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cv-admin__main-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}

.cv-admin__main-eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.7);
  animation: cvAdminPageDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvAdminPageDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-admin__main-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.95);
  text-shadow: 0 2px 24px rgba(201, 169, 97, 0.08);
}

.cv-admin__main-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cv-admin__main-date {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.18);
  text-transform: capitalize;
}

.cv-admin__main-date svg {
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
}

.cv-admin-page-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-admin-page-leave-active {
  transition: all 0.2s ease;
}

.cv-admin-page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-admin-page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1024px) {
  .cv-admin__main-inner {
    padding: 20px 20px 32px;
    gap: 20px;
  }

  .cv-admin__main-title {
    font-size: 24px;
    letter-spacing: -0.4px;
  }

  .cv-admin__main-header {
    padding-bottom: 16px;
  }
}

@media (max-width: 640px) {
  .cv-admin__main-inner {
    padding: 16px 14px 24px;
    gap: 16px;
  }

  .cv-admin__main-title {
    font-size: 20px;
    letter-spacing: -0.3px;
  }

  .cv-admin__main-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .cv-admin__main-meta {
    width: 100%;
  }

  .cv-admin__main-date {
    width: 100%;
    justify-content: center;
    padding: 7px 12px;
    font-size: 11.5px;
  }

  .cv-admin__bg-orb--1,
  .cv-admin__bg-orb--2 {
    width: 280px;
    height: 280px;
  }
}
</style>