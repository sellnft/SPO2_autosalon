<script setup>
import { reactive, watch } from 'vue'
import { useToastStore } from '@/stores/toast'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      priceChange: true,
      statusChange: true,
      messages: true,
      sold: false
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const toastStore = useToastStore()

const settings = reactive({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  Object.assign(settings, val)
}, { deep: true })

function handleChange() {
  emit('update:modelValue', { ...settings })
}

function handleSave() {
  toastStore.success('Настройки подписки сохранены')
}
</script>

<template>
  <div class="cv-subset">
    <div class="cv-subset__glow" aria-hidden="true"></div>
    <div class="cv-subset__carbon" aria-hidden="true"></div>

    <div class="cv-subset__list">
      <div class="cv-subset__item">
        <div class="cv-subset__text">
          <p class="cv-subset__title">Изменение цены</p>
          <p class="cv-subset__description">
            Уведомлять при изменении цены
          </p>
        </div>
        <BaseSwitch v-model="settings.priceChange" @change="handleChange" />
      </div>

      <div class="cv-subset__item">
        <div class="cv-subset__text">
          <p class="cv-subset__title">Изменение статуса</p>
          <p class="cv-subset__description">
            Уведомлять при изменении статуса объявления
          </p>
        </div>
        <BaseSwitch v-model="settings.statusChange" @change="handleChange" />
      </div>

      <div class="cv-subset__item">
        <div class="cv-subset__text">
          <p class="cv-subset__title">Новые сообщения</p>
          <p class="cv-subset__description">
            Уведомлять о новых сообщениях в чате
          </p>
        </div>
        <BaseSwitch v-model="settings.messages" @change="handleChange" />
      </div>

      <div class="cv-subset__item">
        <div class="cv-subset__text">
          <p class="cv-subset__title">Объявление продано</p>
          <p class="cv-subset__description">
            Уведомлять, когда объявление продано
          </p>
        </div>
        <BaseSwitch v-model="settings.sold" @change="handleChange" />
      </div>
    </div>

    <div class="cv-subset__actions">
      <BaseButton @click="handleSave">Сохранить настройки</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.cv-subset {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 22px 24px 24px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.5) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
}

.cv-subset::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.28) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 2;
}

.cv-subset__glow {
  position: absolute;
  top: -120px;
  right: -100px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.18), transparent 70%);
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-subset__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    );
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
}

.cv-subset__list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cv-subset__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 4px;
  transition: all 0.25s ease;
}

.cv-subset__item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.14) 20%,
    rgba(201, 169, 97, 0.14) 80%,
    transparent
  );
  pointer-events: none;
}

.cv-subset__item:hover .cv-subset__title {
  color: #E8D5A0;
}

.cv-subset__text {
  flex: 1;
  min-width: 0;
}

.cv-subset__title {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.1px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.9);
  transition: color 0.25s ease;
}

.cv-subset__description {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.5);
}

.cv-subset__actions {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  padding-top: 18px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-subset__actions::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.25) 50%,
    transparent
  );
}

@media (max-width: 640px) {
  .cv-subset {
    padding: 18px 18px 20px;
    gap: 16px;
    border-radius: 1rem;
  }

  .cv-subset__item {
    padding: 14px 2px;
    gap: 14px;
  }

  .cv-subset__title {
    font-size: 13.5px;
  }

  .cv-subset__description {
    font-size: 12px;
  }

  .cv-subset__actions {
    padding-top: 16px;
  }

  .cv-subset__actions :deep(button) {
    width: 100%;
  }
}
</style>