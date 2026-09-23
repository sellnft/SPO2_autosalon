<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  useId
} from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  trigger: {
    type: String,
    default: 'click',
    validator: (v) => ['click', 'hover', 'manual'].includes(v)
  },
  placement: {
    type: String,
    default: 'bottom-start',
    validator: (v) =>
      ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(v)
  },
  offset: {
    type: Number,
    default: 6
  },
  disabled: Boolean,
  closeOnSelect: {
    type: Boolean,
    default: true
  },
  /** Если нужно принудительно рендерить меню в другую точку DOM */
  teleportTo: {
    type: [String, Object],
    default: 'body'
  }
})

const emit = defineEmits(['select', 'open', 'close'])

/* ---------- State ---------- */
const isOpen = ref(false)
const triggerRef = ref(null)
const menuRef = ref(null)

const menuId = `cv-dd-${useId()}`

/** Реально применённая позиция после auto-flip */
const resolvedPlacement = ref(props.placement)
/** Координаты для fixed-позиционирования */
const coords = ref({ top: 0, left: 0 })
/** Флаг, чтобы не мигало при первом рендере до замера */
const isPositioned = ref(false)

/* ---------- Handlers ---------- */
function open() {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  isPositioned.value = false
  emit('open')
  nextTick(() => {
    updatePosition()
    focusFirstItem()
  })
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
}

function toggle() {
  isOpen.value ? close() : open()
}

function selectItem(item) {
  if (item?.disabled) return
  emit('select', item)
  if (props.closeOnSelect) close()
}

/* ---------- Position calculation ---------- */
function computePosition() {
  const trigger = triggerRef.value
  const menu = menuRef.value
  if (!trigger || !menu) return

  const triggerRect = trigger.getBoundingClientRect()
  const menuRect = menu.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const [prefSide, prefAlign] = props.placement.split('-')

  const spaceBelow = vh - triggerRect.bottom
  const spaceAbove = triggerRect.top
  const needed = menuRect.height + props.offset

  // Auto-flip по вертикали
  let side = prefSide
  if (prefSide === 'bottom' && spaceBelow < needed && spaceAbove > spaceBelow) {
    side = 'top'
  } else if (prefSide === 'top' && spaceAbove < needed && spaceBelow > spaceAbove) {
    side = 'bottom'
  }

  // Auto-align по горизонтали, если не влезает
  let align = prefAlign
  const triggerCenterX = triggerRect.left + triggerRect.width / 2
  if (prefAlign === 'start' && triggerRect.left + menuRect.width > vw - 8) {
    align = 'end'
  } else if (prefAlign === 'end' && triggerRect.right - menuRect.width < 8) {
    align = 'start'
  }

  // Базовая позиция
  let top
  if (side === 'bottom') {
    top = triggerRect.bottom + props.offset
  } else {
    top = triggerRect.top - menuRect.height - props.offset
  }

  let left
  if (align === 'start') {
    left = triggerRect.left
  } else {
    left = triggerRect.right - menuRect.width
  }

  // Клэмп по горизонтали (страховка для очень узких вьюпортов)
  left = Math.max(8, Math.min(left, vw - menuRect.width - 8))
  // Клэмп по вертикали
  top = Math.max(8, Math.min(top, vh - menuRect.height - 8))

  coords.value = { top, left }
  resolvedPlacement.value = `${side}-${align}`
  isPositioned.value = true
}

function updatePosition() {
  computePosition()
}

/* ---------- Lifecycle ---------- */
let resizeObserver = null

onMounted(() => {
  document.addEventListener('mousedown', handlePointerDown, true)
  document.addEventListener('keydown', handleKeydown, true)
  window.addEventListener('resize', updatePosition, { passive: true })
  window.addEventListener('scroll', updatePosition, { passive: true, capture: true })

  // Наблюдаем за изменениями размера триггера — если он переезжает
  if (typeof ResizeObserver !== 'undefined' && triggerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (isOpen.value) updatePosition()
    })
    resizeObserver.observe(triggerRef.value)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handlePointerDown, true)
  document.removeEventListener('keydown', handleKeydown, true)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
  resizeObserver?.disconnect()
})

/* ---------- Outside click ---------- */
function handlePointerDown(event) {
  if (!isOpen.value) return
  const t = event.target
  if (triggerRef.value?.contains(t)) return
  if (menuRef.value?.contains(t)) return
  close()
}

/* ---------- Keyboard ---------- */
function getItemButtons() {
  if (!menuRef.value) return []
  return Array.from(menuRef.value.querySelectorAll('[data-dd-item]:not([disabled])'))
}

function focusFirstItem() {
  const buttons = getItemButtons()
  buttons[0]?.focus()
}

function handleKeydown(event) {
  if (event.key === 'Escape' && isOpen.value) {
    event.stopPropagation()
    close()
    triggerRef.value?.focus()
    return
  }

  if (!isOpen.value) {
    // Открытие с клавиатуры по триггеру
    if (
      triggerRef.value &&
      document.activeElement === triggerRef.value &&
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault()
      open()
    }
    return
  }

  const buttons = getItemButtons()
  if (!buttons.length) return
  const currentIndex = buttons.indexOf(document.activeElement)

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault()
      const next = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0
      buttons[next].focus()
      break
    }
    case 'ArrowUp': {
      event.preventDefault()
      const prev = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1
      buttons[prev].focus()
      break
    }
    case 'Home': {
      event.preventDefault()
      buttons[0].focus()
      break
    }
    case 'End': {
      event.preventDefault()
      buttons[buttons.length - 1].focus()
      break
    }
    case 'Tab': {
      // Закрываем и отпускаем фокус дальше
      close()
      break
    }
  }
}

/* ---------- Hover trigger ---------- */
let hoverCloseTimer = null

function onTriggerMouseEnter() {
  if (props.trigger !== 'hover' || props.disabled) return
  clearTimeout(hoverCloseTimer)
  open()
}

function onTriggerMouseLeave() {
  if (props.trigger !== 'hover') return
  hoverCloseTimer = setTimeout(() => close(), 120)
}

function onMenuMouseEnter() {
  if (props.trigger !== 'hover') return
  clearTimeout(hoverCloseTimer)
}

function onMenuMouseLeave() {
  if (props.trigger !== 'hover') return
  hoverCloseTimer = setTimeout(() => close(), 120)
}

/* ---------- Aria ---------- */
const ariaExpanded = computed(() => (isOpen.value ? 'true' : 'false'))

/* ---------- Trigger bindings ---------- */
function onTriggerClick() {
  if (props.trigger === 'click') toggle()
}

/* Пересчитываем позицию, если поменялся placement через props */
watch(() => props.placement, () => {
  if (isOpen.value) nextTick(updatePosition)
})

defineExpose({ open, close, toggle, isOpen })
</script>

<template>
  <div
    ref="triggerRef"
    class="cv-dd"
    @click="onTriggerClick"
    @mouseenter="onTriggerMouseEnter"
    @mouseleave="onTriggerMouseLeave"
  >
    <div
      class="cv-dd__trigger"
      :aria-expanded="ariaExpanded"
      aria-haspopup="menu"
      :aria-controls="menuId"
      :tabindex="disabled ? -1 : 0"
    >
      <slot name="trigger" :is-open="isOpen" />
    </div>
  </div>

  <Teleport :to="teleportTo">
    <Transition name="cv-dd">
      <div
        v-if="isOpen"
        :id="menuId"
        ref="menuRef"
        :class="['cv-dd__menu', `cv-dd__menu--${resolvedPlacement}`]"
        :style="{
          position: 'fixed',
          top: coords.top + 'px',
          left: coords.left + 'px',
          visibility: isPositioned ? 'visible' : 'hidden'
        }"
        role="menu"
        @mouseenter="onMenuMouseEnter"
        @mouseleave="onMenuMouseLeave"
      >
        <div class="cv-dd__glow" aria-hidden="true"></div>
        <div class="cv-dd__carbon" aria-hidden="true"></div>

        <div class="cv-dd__menu-inner">
          <template v-for="(item, index) in items" :key="item.value || item.label || index">
            <div v-if="item.type === 'divider'" class="cv-dd__divider" aria-hidden="true"></div>

            <button
              v-else
              type="button"
              :class="[
                'cv-dd__item',
                { 'cv-dd__item--danger': item.danger }
              ]"
              role="menuitem"
              :disabled="item.disabled"
              data-dd-item
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
  </Teleport>
</template>

<style scoped>
.cv-dd {
  position: relative;
  display: inline-block;
}

.cv-dd__trigger {
  display: inline-flex;
  outline: none;
}

.cv-dd__trigger:focus-visible {
  border-radius: 12px;
  box-shadow: 0 0 0 2px rgba(201, 169, 97, 0.55);
}

/* Меню теперь fixed, координаты задаются inline через style.
   position в CSS всё равно оставляем как fallback. */
.cv-dd__menu {
  position: fixed;
  z-index: 1100;
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

.cv-dd__item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
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

.cv-dd__item:hover,
.cv-dd__item:focus-visible {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.2);
  transform: translateX(2px);
  outline: none;
}

.cv-dd__item:hover::before,
.cv-dd__item:focus-visible::before {
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

.cv-dd__item:hover .cv-dd__item-icon,
.cv-dd__item:focus-visible .cv-dd__item-icon {
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

.cv-dd__item--danger:hover,
.cv-dd__item--danger:focus-visible {
  color: #E8A88A;
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-dd__item--danger:hover::before,
.cv-dd__item--danger:focus-visible::before {
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.15), rgba(184, 119, 85, 0.04));
}

.cv-dd__item--danger:hover .cv-dd__item-icon,
.cv-dd__item--danger:focus-visible .cv-dd__item-icon {
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

/* Анимация. transform-origin зависит от направления, но т.к.
   мы теперь центрируем через fixed — оставляем нейтральный origin. */
.cv-dd-enter-active,
.cv-dd-leave-active {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.cv-dd-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

.cv-dd-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
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