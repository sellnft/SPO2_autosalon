<script setup>
import { computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  filters: {
    type: Array,
    default: () => []
  },
  activeFilters: {
    type: Object,
    default: () => ({})
  },
  searchPlaceholder: {
    type: String,
    default: 'Поиск...'
  },
  resetText: {
    type: String,
    default: 'Сбросить'
  }
})

const emit = defineEmits(['update:search', 'update:filter', 'reset'])

const activeCount = computed(() => {
  let count = 0
  if (props.search) count++
  for (const key in props.activeFilters) {
    const value = props.activeFilters[key]
    if (value !== '' && value !== null && value !== undefined) count++
  }
  return count
})

function updateFilter(key, value) {
  emit('update:filter', { key, value })
}

function clearSearch() {
  emit('update:search', '')
}

function clearFilter(key) {
  emit('update:filter', { key, value: '' })
}

function resetAll() {
  emit('reset')
}
</script>

<template>
  <div class="cv-afilters">
    <div class="cv-afilters__glow" aria-hidden="true"></div>

    <div class="cv-afilters__row">
      <div class="cv-afilters__search">
        <span class="cv-afilters__search-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="M20 20l-3.5-3.5"/>
          </svg>
        </span>
        <input
          :value="search"
          :placeholder="searchPlaceholder"
          class="cv-afilters__search-input"
          type="text"
          @input="emit('update:search', $event.target.value)"
        />
        <button
          v-if="search"
          type="button"
          class="cv-afilters__search-clear"
          aria-label="Очистить поиск"
          @click="clearSearch"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>

      <div
        v-for="filter in filters"
        :key="filter.key"
        class="cv-afilters__select-wrap"
      >
        <select
          class="cv-afilters__select"
          :value="activeFilters[filter.key] || ''"
          @change="updateFilter(filter.key, $event.target.value)"
        >
          <option value="">{{ filter.placeholder }}</option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <span class="cv-afilters__select-arrow" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </div>

      <button
        type="button"
        class="cv-afilters__reset"
        :class="{ 'cv-afilters__reset--active': activeCount > 0 }"
        @click="resetAll"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
        <span>{{ resetText }}</span>
        <span v-if="activeCount > 0" class="cv-afilters__reset-count">{{ activeCount }}</span>
      </button>
    </div>

    <div v-if="activeCount > 0" class="cv-afilters__chips">
      <span class="cv-afilters__chips-label">Активные фильтры:</span>

      <button
        v-if="search"
        type="button"
        class="cv-afilters__chip"
        @click="clearSearch"
      >
        <span class="cv-afilters__chip-icon" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="M20 20l-3.5-3.5"/>
          </svg>
        </span>
        <span class="cv-afilters__chip-text">«{{ search }}»</span>
        <span class="cv-afilters__chip-close" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </span>
      </button>

      <template v-for="filter in filters" :key="filter.key">
        <button
          v-if="activeFilters[filter.key]"
          type="button"
          class="cv-afilters__chip"
          @click="clearFilter(filter.key)"
        >
          <span class="cv-afilters__chip-label">{{ filter.label || filter.placeholder }}:</span>
          <span class="cv-afilters__chip-text">
            {{ filter.options.find(o => o.value === activeFilters[filter.key])?.label || activeFilters[filter.key] }}
          </span>
          <span class="cv-afilters__chip-close" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4l8 8M12 4l-8 8"/>
            </svg>
          </span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cv-afilters {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 1rem;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
  isolation: isolate;
  overflow: hidden;
}

.cv-afilters::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.22) 50%,
    transparent
  );
  pointer-events: none;
}

.cv-afilters__glow {
  position: absolute;
  top: -60%;
  right: -20%;
  width: 380px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.14), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-afilters__row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-afilters__search {
  position: relative;
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 0 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  transition: all 0.25s ease;
}

.cv-afilters__search:focus-within {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 24px rgba(201, 169, 97, 0.12);
}

.cv-afilters__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.cv-afilters__search:focus-within .cv-afilters__search-icon {
  color: #E8D5A0;
}

.cv-afilters__search-input {
  flex: 1;
  min-width: 0;
  padding: 11px 0;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.92);
  background: transparent;
  border: none;
  outline: none;
}

.cv-afilters__search-input::placeholder {
  color: rgba(200, 190, 175, 0.4);
}

.cv-afilters__search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.5);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-afilters__search-clear:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.4);
}

.cv-afilters__search-clear:active {
  transform: scale(0.92);
}

.cv-afilters__select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.cv-afilters__select {
  padding: 11px 34px 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.85);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.22s ease;
  min-width: 150px;
}

.cv-afilters__select:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-afilters__select:focus {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 24px rgba(201, 169, 97, 0.12);
}

.cv-afilters__select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
  padding: 8px;
}

.cv-afilters__select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  pointer-events: none;
  transition: transform 0.25s ease;
}

.cv-afilters__select-wrap:hover .cv-afilters__select-arrow {
  color: #E8D5A0;
}

.cv-afilters__reset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.22s ease;
  flex-shrink: 0;
}

.cv-afilters__reset:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border-color: rgba(184, 119, 85, 0.35);
  transform: translateY(-1px);
}

.cv-afilters__reset:active {
  transform: translateY(0) scale(0.97);
}

.cv-afilters__reset--active {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.08);
  border-color: rgba(184, 119, 85, 0.28);
}

.cv-afilters__reset-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8A88A, #B87755);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(184, 119, 85, 0.4);
}

.cv-afilters__chips {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
}

.cv-afilters__chips-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.45);
  margin-right: 4px;
  flex-shrink: 0;
}

.cv-afilters__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 9px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
  border: 1px solid rgba(201, 169, 97, 0.32);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-afilters__chip:hover {
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.22), rgba(201, 169, 97, 0.08));
  border-color: rgba(232, 213, 160, 0.5);
  transform: translateY(-1px);
}

.cv-afilters__chip:active {
  transform: translateY(0) scale(0.96);
}

.cv-afilters__chip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.85);
  flex-shrink: 0;
}

.cv-afilters__chip-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.7);
}

.cv-afilters__chip-text {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-afilters__chip-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 2px;
  color: rgba(232, 213, 160, 0.65);
  background: rgba(201, 169, 97, 0.15);
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.22s ease;
}

.cv-afilters__chip:hover .cv-afilters__chip-close {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  transform: rotate(90deg);
}

@media (max-width: 768px) {
  .cv-afilters {
    padding: 14px 16px;
    gap: 12px;
  }

  .cv-afilters__row {
    gap: 8px;
  }

  .cv-afilters__search {
    min-width: 100%;
  }

  .cv-afilters__select-wrap {
    flex: 1;
    min-width: calc(50% - 4px);
  }

  .cv-afilters__select {
    width: 100%;
    min-width: 0;
  }

  .cv-afilters__reset {
    flex: 1 1 100%;
    justify-content: center;
  }

  .cv-afilters__chip-text {
    max-width: 100px;
  }
}

@media (max-width: 480px) {
  .cv-afilters__select-wrap {
    min-width: 100%;
  }

  .cv-afilters__chips {
    padding-top: 10px;
  }

  .cv-afilters__chips-label {
    flex-basis: 100%;
    margin-bottom: 4px;
  }
}
</style>