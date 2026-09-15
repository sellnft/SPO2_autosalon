<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

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
  id: String
})

const emit = defineEmits(['update:modelValue', 'change', 'search'])

const isOpen = ref(false)
const searchQuery = ref('')
const selectRef = ref(null)

const inputId = computed(() => props.id || `select-${Math.random().toString(36).slice(2, 11)}`)

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

function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (isOpen.value && props.searchable) {
      searchQuery.value = ''
    }
  }
}

function selectOption(option) {
  if (props.multiple) {
    const current = Array.isArray(props.modelValue) ? props.modelValue : []
    const index = current.indexOf(option.value)
    let newValue
    if (index > -1) {
      newValue = current.filter(v => v !== option.value)
    } else {
      newValue = [...current, option.value]
    }
    emit('update:modelValue', newValue)
    emit('change', newValue)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    isOpen.value = false
  }
}

function clearSelection(event) {
  event.stopPropagation()
  if (props.multiple) {
    emit('update:modelValue', [])
    emit('change', [])
  } else {
    emit('update:modelValue', '')
    emit('change', '')
  }
}

function isSelected(option) {
  if (props.multiple) {
    return (props.modelValue || []).includes(option.value)
  }
  return props.modelValue === option.value
}

function handleClickOutside(event) {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
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
  <div class="base-select-wrapper">
    <label v-if="label" :for="inputId" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>

    <div ref="selectRef" class="base-select">
      <div
        :class="[
          'base-select__trigger',
          {
            'base-select__trigger--open': isOpen,
            'base-select__trigger--error': error,
            'base-select__trigger--disabled': disabled
          }
        ]"
        @click="toggleDropdown"
      >
        <div class="base-select__value">
          <template v-if="selectedLabels.length">
            <span
              v-for="label in selectedLabels"
              :key="label"
              class="base-select__tag"
            >
              {{ label }}
            </span>
          </template>
          <span v-else class="base-select__placeholder">{{ placeholder }}</span>
        </div>

        <div class="base-select__actions">
          <button
            v-if="clearable && selectedLabels.length"
            type="button"
            class="base-select__clear"
            aria-label="Очистить"
            @click="clearSelection"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <svg
            class="base-select__arrow"
            :class="{ 'base-select__arrow--open': isOpen }"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <Transition name="dropdown">
        <div v-if="isOpen" class="base-select__dropdown">
          <div v-if="searchable" class="base-select__search">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск..."
              class="base-select__search-input"
              @input="emit('search', $event.target.value)"
            />
          </div>

          <ul class="base-select__options">
            <li
              v-for="option in filteredOptions"
              :key="option.value"
              :class="[
                'base-select__option',
                { 'base-select__option--selected': isSelected(option) }
              ]"
              @click="selectOption(option)"
            >
              <span>{{ option.label }}</span>
              <svg
                v-if="isSelected(option)"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </li>
            <li v-if="!filteredOptions.length" class="base-select__empty">
              Нет опций
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <p v-if="error" class="base-select__error">{{ error }}</p>
    <p v-else-if="hint" class="base-select__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-select-wrapper {
  width: 100%;
}

.base-select__label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.base-select__required {
  color: #EF4444;
  margin-left: 2px;
}

.base-select {
  position: relative;
}

.base-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding: 10px 14px;
  background: white;
  border: 1.5px solid #D1D5DB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.base-select__trigger:hover:not(.base-select__trigger--disabled) {
  border-color: #9CA3AF;
}

.base-select__trigger--open {
  border-color: #0A84FF;
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
}

.base-select__trigger--error {
  border-color: #EF4444;
}

.base-select__trigger--disabled {
  background: #F9FAFB;
  cursor: not-allowed;
  opacity: 0.7;
}

.base-select__value {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.base-select__placeholder {
  font-size: 14px;
  color: #9CA3AF;
}

.base-select__tag {
  padding: 2px 8px;
  font-size: 13px;
  color: #374151;
  background: #F3F4F6;
  border-radius: 6px;
}

.base-select__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.base-select__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #9CA3AF;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.base-select__clear:hover {
  color: #EF4444;
}

.base-select__arrow {
  color: #9CA3AF;
  transition: transform 0.2s;
}

.base-select__arrow--open {
  transform: rotate(180deg);
}

.base-select__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.base-select__search {
  padding: 8px;
  border-bottom: 1px solid #F3F4F6;
}

.base-select__search-input {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  outline: none;
}

.base-select__search-input:focus {
  border-color: #0A84FF;
}

.base-select__options {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.base-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #374151;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.base-select__option:hover {
  background: #F3F4F6;
}

.base-select__option--selected {
  color: #0A84FF;
  background: #F0F7FF;
}

.base-select__empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #9CA3AF;
}

.base-select__error {
  margin-top: 6px;
  font-size: 12px;
  color: #EF4444;
}

.base-select__hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6B7280;
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