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
  <div ref="dropdownRef" class="base-dropdown">
    <div @click="toggle">
      <slot name="trigger" :is-open="isOpen" />
    </div>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :class="['base-dropdown__menu', `base-dropdown__menu--${placement}`]"
        role="menu"
      >
        <template v-for="(item, index) in items" :key="item.value || item.label || index">
          <div v-if="item.type === 'divider'" class="base-dropdown__divider"></div>

          <button
            v-else
            :class="[
              'base-dropdown__item',
              { 'base-dropdown__item--danger': item.danger }
            ]"
            role="menuitem"
            @click="selectItem(item)"
          >
            <span class="base-dropdown__item-label">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.base-dropdown {
  position: relative;
  display: inline-block;
}

.base-dropdown__menu {
  position: absolute;
  z-index: 50;
  min-width: 200px;
  padding: 6px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.base-dropdown__menu--bottom-start { top: calc(100% + 4px); left: 0; }
.base-dropdown__menu--bottom-end { top: calc(100% + 4px); right: 0; }
.base-dropdown__menu--top-start { bottom: calc(100% + 4px); left: 0; }
.base-dropdown__menu--top-end { bottom: calc(100% + 4px); right: 0; }

.base-dropdown__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #374151;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.base-dropdown__item:hover {
  background: #F3F4F6;
  color: #111827;
}

.base-dropdown__item--danger {
  color: #EF4444;
}

.base-dropdown__item--danger:hover {
  background: #FEF2F2;
  color: #DC2626;
}

.base-dropdown__divider {
  height: 1px;
  margin: 4px 0;
  background: #F3F4F6;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>