<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  trigger: {
    type: String,
    default: 'click',
    validator: (v) => ['click', 'hover'].includes(v)
  },
  placement: {
    type: String,
    default: 'bottom-start',
    validator: (v) => ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(v)
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

function handleMouseEnter() {
  if (props.trigger === 'hover' && !props.disabled) {
    isOpen.value = true
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
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
  <div 
    ref="dropdownRef"
    class="base-dropdown"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div @click="toggle">
      <slot name="trigger" :is-open="isOpen" />
    </div>
    
    <Transition name="dropdown">
      <div 
        v-if="isOpen"
        :class="['base-dropdown__menu', `base-dropdown__menu--${placement}`]"
        role="menu"
      >
        <slot :items="items" :select="selectItem">
          <button
            v-for="item in items"
            :key="item.value || item.label"
            class="base-dropdown__item"
            role="menuitem"
            @click="selectItem(item)"
          >
            <span v-if="item.icon" class="base-dropdown__item-icon">
              <component :is="item.icon" />
            </span>
            <span class="base-dropdown__item-label">{{ item.label }}</span>
          </button>
        </slot>
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

.base-dropdown__menu--bottom-start {
  top: calc(100% + 4px);
  left: 0;
}

.base-dropdown__menu--bottom-end {
  top: calc(100% + 4px);
  right: 0;
}

.base-dropdown__menu--top-start {
  bottom: calc(100% + 4px);
  left: 0;
}

.base-dropdown__menu--top-end {
  bottom: calc(100% + 4px);
  right: 0;
}

.base-dropdown__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: #374151;
  border-radius: 8px;
  transition: all 0.2s;
  text-align: left;
}

.base-dropdown__item:hover {
  background: #F3F4F6;
  color: #111827;
}

.base-dropdown__item-icon {
  display: flex;
  align-items: center;
  color: #6B7280;
}

/* Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>