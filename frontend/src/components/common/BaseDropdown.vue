<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  trigger: {
    type: String,
    default: 'click'
  },
  placement: {
    type: String,
    default: 'bottom-start'
  },
  disabled: Boolean
})

const emit = defineEmits(['select'])

const isOpen = ref(false)
const dropdownRef = ref(null)

function toggle() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function selectItem(item) {
  emit('select', item)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="cv-dd">
    <div @click="toggle">
      <slot name="trigger" :is-open="isOpen" />
    </div>

    <Transition name="cv-dd">
      <div
        v-if="isOpen"
        :class="['cv-dd__menu', `cv-dd__menu--${placement}`]"
        role="menu"
      >
        <div class="cv-dd__glow" aria-hidden="true"></div>
        <div class="cv-dd__carbon" aria-hidden="true"></div>

        <div class="cv-dd__menu-inner">
          <template v-for="(item, index) in items" :key="item.value || item.label || index">
            <div v-if="item.type === 'divider'" class="cv-dd__divider" aria-hidden="true"></div>

            <button
              v-else
              :class="[
                'cv-dd__item',
                { 'cv-dd__item--danger': item.danger }
              ]"
              role="menuitem"
              @click="selectItem(item)"
            >
              <span v-if="item.icon" class="cv-dd__item-icon" aria-hidden="true">
                <svg v-if="item.icon === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
                <svg v-else-if="item.icon === 'list'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                <svg v-else-if="item.icon === 'heart'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
                </svg>
                <svg v-else-if="item.icon === 'settings'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
                </svg>
                <svg v-else-if="item.icon === 'logout'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <path d="M16 17l5-5-5-5"/>
                  <path d="M21 12H9"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                </svg>
              </span>

              <span class="cv-dd__item-label">{{ item.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-dd {
  position: relative;
  display: inline-block;
}

.cv-dd__menu {
  position: absolute;
  z-index: 50;
  min-width: 220px;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4) 0%, rgba(15, 13, 10, 0.55) 100%),
    linear-gradient(180deg, #16161B 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 60px rgba(201, 169, 97, 0.08);
  overflow: hidden;
  isolation: isolate;
}

.cv-dd__menu::before {
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

.cv-dd__menu--bottom-start { top: calc(100% + 6px); left: 0; }
.cv-dd__menu--bottom-end { top: calc(100% + 6px); right: 0; }
.cv-dd__menu--top-start { bottom: calc(100% + 6px); left: 0; }
.cv-dd__menu--top-end { bottom: calc(100% + 6px); right: 0; }

.cv-dd__glow {
  position: absolute;
  top: -100px;
  right: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.2), transparent 70%);
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-dd__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;
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

.cv-dd__menu-inner {
  position: relative;
  z-index: 1;
  padding: 6px;
}

.cv-dd__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.75);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  overflow: hidden;
}

.cv-dd__item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.cv-dd__item:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.2);
  transform: translateX(2px);
}

.cv-dd__item:hover::before {
  opacity: 1;
}

.cv-dd__item:active {
  transform: translateX(2px) scale(0.98);
}

.cv-dd__item-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: currentColor;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-dd__item:hover .cv-dd__item-icon {
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.3);
  color: #E8D5A0;
}

.cv-dd__item-label {
  position: relative;
  z-index: 1;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-dd__item--danger {
  color: rgba(232, 168, 138, 0.8);
}

.cv-dd__item--danger:hover {
  color: #E8A88A;
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-dd__item--danger:hover::before {
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.15), rgba(184, 119, 85, 0.04));
}

.cv-dd__item--danger:hover .cv-dd__item-icon {
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.4);
  color: #E8A88A;
}

.cv-dd__divider {
  height: 1px;
  margin: 5px 8px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.18) 20%,
    rgba(201, 169, 97, 0.18) 80%,
    transparent
  );
}

.cv-dd-enter-active,
.cv-dd-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  transform-origin: top center;
}

.cv-dd-enter-from,
.cv-dd-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.cv-dd__menu--top-start.cv-dd-enter-from,
.cv-dd__menu--top-start.cv-dd-leave-to,
.cv-dd__menu--top-end.cv-dd-enter-from,
.cv-dd__menu--top-end.cv-dd-leave-to {
  transform: translateY(8px) scale(0.96);
  transform-origin: bottom center;
}

@media (max-width: 640px) {
  .cv-dd__menu {
    min-width: 200px;
    border-radius: 14px;
  }

  .cv-dd__item {
    font-size: 13px;
    padding: 9px 10px;
    gap: 10px;
  }

  .cv-dd__item-icon {
    width: 26px;
    height: 26px;
  }
}
</style>