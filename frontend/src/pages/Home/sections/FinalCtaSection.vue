<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
</script>

<template>
  <section class="final">
    <div class="final__bg" aria-hidden="true">
      <div class="final__glow"></div>
    </div>

    <div class="final__container">
      <h2 class="final__title">Присоединяйтесь к CarVibe</h2>
      <p class="final__subtitle">
        Создайте аккаунт за 30 секунд и получите доступ к лучшим
        автомобилям и продавцам страны.
      </p>
      <div class="final__actions">
        <BaseButton size="lg" @click="router.push('/register')">
          Начать бесплатно
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </BaseButton>
        <BaseButton variant="outline" size="lg" @click="router.push('/announcements')">
          Смотреть каталог
        </BaseButton>
      </div>
      <p class="final__note">Бесплатно · Без обязательств · Верификация за 1 минуту</p>
    </div>
  </section>
</template>

<style scoped>
.final {
  position: relative;
  padding: 120px 0 96px;
  overflow: hidden;
  isolation: isolate;
}
.final__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.final__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 65%);
  filter: blur(90px);
  opacity: 0.6;
}

.final__container {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
}

.final__title {
  margin: 0;
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1.2px;
  line-height: 1.1;
  background: linear-gradient(135deg, #f5e6bc 0%, #c9a961 55%, #8b6f3f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.final__subtitle {
  margin: 0;
  max-width: 540px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.75);
}
.final__actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}
.final__note {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: rgba(200, 190, 175, 0.5);
}

@media (max-width: 1024px) {
  .final { padding: 80px 0 64px; }
  .final__title { font-size: 34px; }
}
@media (max-width: 768px) {
  .final { padding: 60px 0 48px; }
  .final__title { font-size: 28px; letter-spacing: -0.6px; }
  .final__actions { flex-direction: column; width: 100%; }
  .final__actions > * { width: 100%; }
}
@media (max-width: 480px) {
  .final__title { font-size: 24px; }
}
</style>