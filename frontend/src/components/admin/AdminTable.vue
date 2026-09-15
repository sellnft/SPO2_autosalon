<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'Нет данных'
  },
  emptyIcon: {
    type: String,
    default: 'search'
  },
  emptyHint: {
    type: String,
    default: 'Попробуйте изменить фильтры или поискать иначе'
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  clickable: {
    type: Boolean,
    default: true
  },
  stickyHeader: {
    type: Boolean,
    default: false
  },
  skeletonRows: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['row-click'])

const hasItems = computed(() => props.items.length > 0)

function handleRowClick(item) {
  if (!props.clickable) return
  emit('row-click', item)
}
</script>

<template>
  <div :class="['cv-table', { 'cv-table--sticky': stickyHeader }]">
    <div class="cv-table__glow" aria-hidden="true"></div>

    <div class="cv-table__scroll">
      <table class="cv-table__table">
        <thead class="cv-table__head">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="cv-table__th"
              :style="{ width: column.width, textAlign: column.align || 'left' }"
            >
              <span class="cv-table__th-content">{{ column.label }}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="loading">
            <tr
              v-for="i in skeletonRows"
              :key="`skeleton-${i}`"
              class="cv-table__row cv-table__row--skeleton"
            >
              <td
                v-for="column in columns"
                :key="`skeleton-${i}-${column.key}`"
                class="cv-table__td"
                :style="{ textAlign: column.align || 'left' }"
              >
                <span class="cv-table__skeleton" :style="{ width: `${40 + Math.random() * 50}%` }"></span>
              </td>
            </tr>
          </template>

          <tr v-else-if="!hasItems">
            <td :colspan="columns.length" class="cv-table__empty">
              <div class="cv-table__empty-inner">
                <span class="cv-table__empty-icon" aria-hidden="true">
                  <svg v-if="emptyIcon === 'search'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="M20 20l-3.5-3.5"/>
                  </svg>
                  <svg v-else-if="emptyIcon === 'users'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <svg v-else-if="emptyIcon === 'car'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                    <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
                  </svg>
                  <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 8v5M12 17h.01"/>
                  </svg>
                </span>

                <p class="cv-table__empty-title">{{ emptyText }}</p>
                <p class="cv-table__empty-hint">{{ emptyHint }}</p>
              </div>
            </td>
          </tr>

          <tr
            v-else
            v-for="item in items"
            :key="item[rowKey]"
            :class="['cv-table__row', { 'cv-table__row--clickable': clickable }]"
            @click="handleRowClick(item)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="cv-table__td"
              :style="{ textAlign: column.align || 'left' }"
            >
              <slot :name="column.key" :item="item">
                <span class="cv-table__value">{{ item[column.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.cv-table {
  position: relative;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 1rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-table::before {
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
  z-index: 3;
}

.cv-table__glow {
  position: absolute;
  top: -80px;
  right: -60px;
  width: 300px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.14), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-table__scroll {
  position: relative;
  z-index: 1;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-table__scroll::-webkit-scrollbar {
  height: 8px;
}

.cv-table__scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-table__table {
  width: 100%;
  min-width: 720px;
  border-collapse: separate;
  border-spacing: 0;
}

.cv-table__head {
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  position: relative;
}

.cv-table--sticky .cv-table__head th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.cv-table__th {
  position: relative;
  padding: 14px 18px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
  text-align: left;
  border-bottom: 1px solid rgba(201, 169, 97, 0.14);
  white-space: nowrap;
}

.cv-table__th:first-child {
  border-top-left-radius: 1rem;
}

.cv-table__th:last-child {
  border-top-right-radius: 1rem;
}

.cv-table__th-content {
  display: inline-block;
}

.cv-table__row {
  transition: background 0.22s ease;
}

.cv-table__row--clickable {
  cursor: pointer;
}

.cv-table__row--clickable:hover {
  background: linear-gradient(90deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
}

.cv-table__row--clickable:hover .cv-table__td {
  color: #F5E6BC;
}

.cv-table__row--clickable:active {
  transform: scale(0.999);
}

.cv-table__row:not(:last-child) .cv-table__td {
  border-bottom: 1px solid rgba(201, 169, 97, 0.08);
}

.cv-table__td {
  padding: 16px 18px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.85);
  vertical-align: middle;
  transition: color 0.22s ease;
}

.cv-table__value {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cv-table__row--skeleton .cv-table__td {
  padding: 18px;
}

.cv-table__skeleton {
  position: relative;
  display: block;
  height: 14px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.cv-table__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.12) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: cvTableSkeleton 1.8s ease-in-out infinite;
}

@keyframes cvTableSkeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.cv-table__empty {
  padding: 60px 24px 56px;
  text-align: center;
}

.cv-table__empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
}

.cv-table__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  margin-bottom: 12px;
  border-radius: 22px;
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.6) 0%, rgba(15, 13, 10, 0.7) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.1);
  animation: cvTableFloat 4s ease-in-out infinite;
}

@keyframes cvTableFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-table__empty-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.9);
}

.cv-table__empty-hint {
  margin: 0;
  max-width: 320px;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.5);
}

@media (max-width: 640px) {
  .cv-table__th {
    padding: 12px 14px;
    font-size: 10px;
    letter-spacing: 1px;
  }

  .cv-table__td {
    padding: 14px;
    font-size: 13px;
  }

  .cv-table__empty {
    padding: 40px 16px 36px;
  }

  .cv-table__empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 18px;
  }

  .cv-table__empty-title {
    font-size: 13.5px;
  }

  .cv-table__empty-hint {
    font-size: 12px;
  }
}
</style>