<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  label: String,
  placeholder: {
    type: String,
    default: 'Выберите...'
  },
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
  return props.options.filter(option => 
    String(option.label).toLowerCase().includes(searchQuery.value.toLowerCase())
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

function handleClickOutside(event) {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

import { onMounted, onUnmounted } from 'vue'

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
            class="base-select__clear"
            @click="clearSelection"
            aria-label="Clear"
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
                { 
                  'base-select__option--selected': 
                    multiple 
                      ? (modelValue || []).includes(option.value)
                      : modelValue === option.value
                }
              ]"
              @click="selectOption(option)"
            >
              <span>{{ option.label }}</span>
              <svg 
                v-if="multiple 
                  ? (modelValue || []).includes(option.value)
                  : modelValue === option.value"
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none"
              >
                <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
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
/* ... стили ... */
</style>