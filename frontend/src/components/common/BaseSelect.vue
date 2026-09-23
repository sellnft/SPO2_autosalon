<script setup>
import {
  computed,
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  useId
} from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  options: { type: Array, default: () => [] },
  label: String,
  placeholder: { type: String, default: 'Выберите...' },
  hint: String,
  error: String,
  disabled: Boolean,
  required: Boolean,
  multiple: Boolean,
  searchable: Boolean,
  clearable: Boolean,
  name: String,
  id: String,
  max: { type: Number, default: 0 },
  /** Дополнительный offset dropdown относительно триггера */
  offset: { type: Number, default: 6 },
  /** Максимальная высота выпадашки (px). Может переопределяться через CSS-переменную */
  maxHeight: { type: Number, default: 320 },
  /** Куда телепортить. По умолчанию body */
  teleportTo: { type: [String, Object], default: 'body' }
})

const emit = defineEmits(['update:modelValue', 'change', 'search'])

/* ---------- Stable ids ---------- */
const uid = useId?.() ?? Math.random().toString(36).slice(2, 11)
const inputId = computed(() => props.id || `select-${uid}`)
const listboxId = computed(() => `select-listbox-${uid}`)
const optionId = (index) => `select-option-${uid}-${index}`

/* ---------- State ---------- */
const isOpen = ref(false)
const searchQuery = ref('')
const triggerRef = ref(null)
const dropdownRef = ref(null)
const searchInputRef = ref(null)
const optionsRef = ref(null)
const activeIndex = ref(-1)

const coords = ref({ top: 0, left: 0, width: 0 })
const resolvedPlacement = ref('bottom')
const isPositioned = ref(false)

/* ---------- Computed ---------- */
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    String(option.label).toLowerCase().includes(q)
  )
})

const selectedLabels = computed(() => {
  if (props.multiple) {
    const selected = props.options.filter(opt =>
      (props.modelValue || []).includes(opt.value)
    )
    return selected.map(opt => opt.label)
  }
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected ? [selected.label] : []
})

const isMaxed = computed(() =>
  props.multiple
  && props.max > 0
  && Array.isArray(props.modelValue)
  && props.modelValue.length >= props.max
)

/* ---------- Positioning ---------- */
function computePosition() {
  const trigger = triggerRef.value
  const dropdown = dropdownRef.value
  if (!trigger || !dropdown) return

  const triggerRect = trigger.getBoundingClientRect()
  const dropdownRect = dropdown.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const spaceBelow = vh - triggerRect.bottom - props.offset
  const spaceAbove = triggerRect.top - props.offset
  const needed = dropdownRect.height

  // Flip: если снизу не влезает и сверху места больше — открываем вверх
  let placement = 'bottom'
  if (spaceBelow < needed && spaceAbove > spaceBelow) {
    placement = 'top'
  }

  const top = placement === 'bottom'
    ? triggerRect.bottom + props.offset
    : triggerRect.top - dropdownRect.height - props.offset

  // Ширина совпадает с триггером
  const left = triggerRect.left
  const width = triggerRect.width

  coords.value = {
    top: Math.max(8, Math.min(top, vh - dropdownRect.height - 8)),
    left: Math.max(8, Math.min(left, vw - width - 8)),
    width
  }
  resolvedPlacement.value = placement
  isPositioned.value = true
}

function updatePosition() {
  if (!isOpen.value) return
  computePosition()
}

/* ---------- Open / close ---------- */
function open() {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
  isPositioned.value = false
  searchQuery.value = ''
  activeIndex.value = -1

  nextTick(() => {
    computePosition()
    if (props.searchable && searchInputRef.value) {
      searchInputRef.value.focus()
    }
  })
}

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  searchQuery.value = ''
  activeIndex.value = -1
}

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value ? close() : open()
}

/* ---------- Selection ---------- */
function selectOption(option) {
  if (option?.disabled) return

  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? props.modelValue : []
    const index = current.indexOf(option.value)
    let newValue
    if (index > -1) {
      newValue = current.filter(v => v !== option.value)
    } else {
      if (props.max > 0 && current.length >= props.max) return
      newValue = [...current, option.value]
    }
    emit('update:modelValue', newValue)
    emit('change', newValue)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    close()
    triggerRef.value?.focus()
  }
}

function clearSelection(event) {
  event.stopPropagation()
  const empty = props.multiple ? [] : ''
  emit('update:modelValue', empty)
  emit('change', empty)
}

function isSelected(option) {
  if (props.multiple) {
    return (props.modelValue || []).includes(option.value)
  }
  return props.modelValue === option.value
}

/* ---------- Outside click ---------- */
function handlePointerDown(event) {
  if (!isOpen.value) return
  const t = event.target
  if (triggerRef.value?.contains(t)) return
  if (dropdownRef.value?.contains(t)) return
  close()
}

/* ---------- Keyboard ---------- */
function scrollActiveIntoView() {
  const options = optionsRef.value
  if (!options) return
  const el = options.children[activeIndex.value]
  el?.scrollIntoView({ block: 'nearest' })
}

function handleTriggerKeydown(event) {
  if (props.disabled) return

  if (!isOpen.value) {
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault()
      open()
    }
    return
  }

  handleMenuKeydown(event)
}

function handleMenuKeydown(event) {
  const total = filteredOptions.value.length

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!total) return
      activeIndex.value = activeIndex.value < total - 1 ? activeIndex.value + 1 : 0
      nextTick(scrollActiveIntoView)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!total) return
      activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : total - 1
      nextTick(scrollActiveIntoView)
      break
    case 'Home':
      event.preventDefault()
      if (!total) return
      activeIndex.value = 0
      nextTick(scrollActiveIntoView)
      break
    case 'End':
      event.preventDefault()
      if (!total) return
      activeIndex.value = total - 1
      nextTick(scrollActiveIntoView)
      break
    case 'Enter':
      event.preventDefault()
      if (activeIndex.value >= 0 && filteredOptions.value[activeIndex.value]) {
        selectOption(filteredOptions.value[activeIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      close()
      triggerRef.value?.focus()
      break
    case 'Tab':
      close()
      break
  }
}

/* ---------- Lifecycle ---------- */
let resizeObserver = null

function onWindowChange() {
  updatePosition()
}

onMounted(() => {
  document.addEventListener('mousedown', handlePointerDown, true)
  window.addEventListener('resize', onWindowChange, { passive: true })
  window.addEventListener('scroll', onWindowChange, { passive: true, capture: true })

  if (typeof ResizeObserver !== 'undefined' && triggerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (isOpen.value) updatePosition()
    })
    resizeObserver.observe(triggerRef.value)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handlePointerDown, true)
  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, true)
  resizeObserver?.disconnect()
})

/* Recompute if options change while open (высота dropdown изменилась) */
watch(filteredOptions, () => {
  if (isOpen.value) nextTick(updatePosition)
})

defineExpose({ open, close, toggleDropdown, isOpen })
</script>

<template>
  <div class="cv-select-wrap">
    <label v-if="label" :for="inputId" class="cv-select__label">
      {{ label }}
      <span v-if="required" class="cv-select__required">*</span>
    </label>

    <div
      ref="triggerRef"
      class="cv-select"
      :aria-disabled="disabled"
      @keydown="handleTriggerKeydown"
    >
      <div
        :id="inputId"
        :class="[
          'cv-select__trigger',
          {
            'cv-select__trigger--open': isOpen,
            'cv-select__trigger--error': error,
            'cv-select__trigger--disabled': disabled
          }
        ]"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-controls="listboxId"
        :aria-activedescendant="
          isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
        "
        :tabindex="disabled ? -1 : 0"
        @click="toggleDropdown"
      >
        <div class="cv-select__value">
          <template v-if="selectedLabels.length">
            <span
              v-for="label in selectedLabels"
              :key="label"
              class="cv-select__tag"
            >
              <span class="cv-select__tag-label">{{ label }}</span>
            </span>
          </template>
          <span v-else class="cv-select__placeholder">{{ placeholder }}</span>
        </div>

        <div class="cv-select__actions">
          <button
            v-if="clearable && selectedLabels.length"
            type="button"
            class="cv-select__clear"
            aria-label="Очистить"
            @click="clearSelection"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4l8 8M12 4l-8 8"/>
            </svg>
          </button>

          <span class="cv-select__arrow" :class="{ 'cv-select__arrow--open': isOpen }" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 7.5l5 5 5-5"/>
            </svg>
          </span>
        </div>
      </div>

      <!-- Скрытый input для нативной формы / name -->
      <input
        v-if="name"
        type="hidden"
        :name="name"
        :value="multiple ? (modelValue || []).join(',') : modelValue"
      />
    </div>

    <Teleport :to="teleportTo">
      <Transition name="cv-select">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="cv-select__dropdown"
          :class="`cv-select__dropdown--${resolvedPlacement}`"
          :style="{
            position: 'fixed',
            top: coords.top + 'px',
            left: coords.left + 'px',
            width: coords.width + 'px',
            maxHeight: maxHeight + 'px',
            visibility: isPositioned ? 'visible' : 'hidden'
          }"
          @keydown="handleMenuKeydown"
        >
          <div class="cv-select__glow" aria-hidden="true"></div>
          <div class="cv-select__carbon" aria-hidden="true"></div>

          <div class="cv-select__dropdown-inner">
            <div v-if="searchable" class="cv-select__search">
              <span class="cv-select__search-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="9" r="6"/>
                  <path d="M15 15l3 3"/>
                </svg>
              </span>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Поиск..."
                class="cv-select__search-input"
                @input="emit('search', $event.target.value)"
              />
            </div>

            <ul
              ref="optionsRef"
              :id="listboxId"
              class="cv-select__options"
              role="listbox"
              :aria-multiselectable="multiple"
            >
              <li
                v-for="(option, index) in filteredOptions"
                :id="optionId(index)"
                :key="option.value"
                :class="[
                  'cv-select__option',
                  {
                    'cv-select__option--selected': isSelected(option),
                    'cv-select__option--active': index === activeIndex,
                    'cv-select__option--disabled': (isMaxed && !isSelected(option)) || option.disabled
                  }
                ]"
                role="option"
                :aria-selected="isSelected(option)"
                :aria-disabled="option.disabled || (isMaxed && !isSelected(option))"
                @click="selectOption(option)"
                @mouseenter="activeIndex = index"
              >
                <span class="cv-select__option-check" aria-hidden="true">
                  <svg v-if="isSelected(option)" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 8.5l3.5 3.5L13 5"/>
                  </svg>
                </span>

                <span class="cv-select__option-label">{{ option.label }}</span>
              </li>

              <li v-if="!filteredOptions.length" class="cv-select__empty">
                <span class="cv-select__empty-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="M20 20l-3.5-3.5"/>
                  </svg>
                </span>
                <span class="cv-select__empty-text">Ничего не найдено</span>
                <span v-if="searchQuery" class="cv-select__empty-hint">
                  Попробуйте изменить запрос
                </span>
              </li>
            </ul>

            <div v-if="multiple && max > 0" class="cv-select__footer">
              <span class="cv-select__footer-count">
                Выбрано <strong>{{ (modelValue || []).length }}</strong> из {{ max }}
              </span>
              <span class="cv-select__footer-bar" aria-hidden="true">
                <span
                  class="cv-select__footer-bar-fill"
                  :style="{ width: `${Math.min(100, ((modelValue || []).length / max) * 100)}%` }"
                ></span>
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <p v-if="error" class="cv-select__error">{{ error }}</p>
    <p v-else-if="hint" class="cv-select__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cv-select-wrap {
  width: 100%;
}

.cv-select__label {
  display: block;
  margin-bottom: 8px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.7);
}

.cv-select__required {
  color: #E8A88A;
  margin-left: 3px;
  font-weight: 700;
}

.cv-select {
  position: relative;
  outline: none;
}

.cv-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding: 10px 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.25),
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-select__trigger:hover:not(.cv-select__trigger--disabled) {
  border-color: rgba(201, 169, 97, 0.42);
}

.cv-select__trigger--open {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 32px rgba(201, 169, 97, 0.12),
    0 1px 0 rgba(232, 213, 160, 0.08) inset;
}

.cv-select__trigger--error {
  border-color: rgba(184, 119, 85, 0.65);
}

.cv-select__trigger--error.cv-select__trigger--open {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(184, 119, 85, 0.15),
    0 0 32px rgba(184, 119, 85, 0.15);
}

.cv-select__trigger--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-select__value {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.cv-select__placeholder {
  font-size: 14px;
  color: rgba(200, 190, 175, 0.4);
}

.cv-select__tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.18), rgba(201, 169, 97, 0.06));
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(201, 169, 97, 0.12);
}

.cv-select__tag-label {
  position: relative;
  z-index: 1;
}

.cv-select__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.cv-select__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: rgba(220, 210, 195, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-select__clear:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-select__clear:active {
  transform: scale(0.92);
}

.cv-select__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.cv-select__arrow--open {
  transform: rotate(180deg);
  color: #E8D5A0;
}

/* Меню — fixed, координаты inline. */
.cv-select__dropdown {
  position: fixed;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4) 0%, rgba(15, 13, 10, 0.55) 100%),
    linear-gradient(180deg, #16161B 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 14px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 60px rgba(201, 169, 97, 0.08);
  overflow: hidden;
  isolation: isolate;
  box-sizing: border-box;
}

.cv-select__dropdown::before {
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

/* Для верхнего раскрытия — линия снизу и скругления/анимация */
.cv-select__dropdown--top::before {
  top: auto;
  bottom: 0;
}

.cv-select__glow {
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

.cv-select__dropdown--top .cv-select__glow {
  top: auto;
  bottom: -100px;
}

.cv-select__carbon {
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

.cv-select__dropdown-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.cv-select__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  background: rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.cv-select__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-select__search-input {
  flex: 1;
  font-family: inherit;
  font-size: 13.5px;
  color: rgba(245, 240, 230, 0.92);
  background: transparent;
  border: none;
  outline: none;
  padding: 4px 0;
}

.cv-select__search-input::placeholder {
  color: rgba(200, 190, 175, 0.4);
}

.cv-select__options {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  margin: 0;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
  min-height: 0;
}

.cv-select__options::-webkit-scrollbar {
  width: 8px;
}

.cv-select__options::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-select__options::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-select__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.75);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  overflow: hidden;
}

.cv-select__option::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.12), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.cv-select__option--active {
  color: #E8D5A0;
}

.cv-select__option--active::before {
  opacity: 0.7;
}

.cv-select__option--selected {
  color: #F5E6BC;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.16), rgba(201, 169, 97, 0.04));
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-select__option--disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.cv-select__option-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: transparent;
  transition: all 0.2s ease;
}

.cv-select__option--selected .cv-select__option-check {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 2px 10px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-select__option-label {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-select__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 20px;
  text-align: center;
}

.cv-select__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: rgba(201, 169, 97, 0.55);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.18);
  margin-bottom: 4px;
}

.cv-select__empty-text {
  font-size: 13.5px;
  font-weight: 600;
  color: rgba(220, 210, 195, 0.7);
}

.cv-select__empty-hint {
  font-size: 12px;
  color: rgba(200, 190, 175, 0.45);
}

.cv-select__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.cv-select__footer-count {
  flex-shrink: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.55);
}

.cv-select__footer-count strong {
  color: #E8D5A0;
  font-weight: 700;
}

.cv-select__footer-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: rgba(201, 169, 97, 0.12);
  overflow: hidden;
}

.cv-select__footer-bar-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #8B6F3F, #C9A961, #E8D5A0);
  border-radius: 2px;
  transition: width 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.5);
}

.cv-select__error {
  margin: 6px 0 0 4px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: #E8A88A;
}

.cv-select__hint {
  margin: 6px 0 0 4px;
  font-size: 12px;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.5);
}

.cv-select-enter-active,
.cv-select-leave-active {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
}

/* Анимация зависит от направления раскрытия */
.cv-select-enter-from,
.cv-select-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.cv-select__dropdown--top.cv-select-enter-from,
.cv-select__dropdown--top.cv-select-leave-to {
  transform: translateY(8px) scale(0.97);
}

@media (max-width: 640px) {
  .cv-select__trigger {
    min-height: 42px;
    padding: 9px 12px;
  }

  .cv-select__tag {
    font-size: 12px;
    padding: 2px 8px;
  }

  .cv-select__option {
    padding: 11px 12px;
    font-size: 14px;
  }
}
</style>