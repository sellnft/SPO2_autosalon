<script setup>
defineProps({
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
  }
})
</script>

<template>
  <div class="admin-table-wrapper">
    <table class="admin-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width, textAlign: column.align || 'left' }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="admin-table__loading">
            Загрузка...
          </td>
        </tr>
        <tr v-else-if="!items.length">
          <td :colspan="columns.length" class="admin-table__empty">
            {{ emptyText }}
          </td>
        </tr>
        <tr
          v-else
          v-for="item in items"
          :key="item.id"
          class="admin-table__row"
          @click="$emit('row-click', item)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :style="{ textAlign: column.align || 'left' }"
          >
            <slot :name="column.key" :item="item">
              {{ item[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-table-wrapper {
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
  overflow: hidden;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.admin-table thead {
  background: #1A1A1D;
}

.admin-table th {
  padding: 14px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6B7280;
  text-align: left;
  border-bottom: 1px solid #26262A;
}

.admin-table td {
  padding: 16px;
  font-size: 14px;
  color: #E5E7EB;
  border-bottom: 1px solid #1F1F22;
}

.admin-table__row {
  transition: background 0.15s;
  cursor: pointer;
}

.admin-table__row:hover {
  background: #1A1A1D;
}

.admin-table__row:last-child td {
  border-bottom: none;
}

.admin-table__loading,
.admin-table__empty {
  padding: 40px 16px;
  text-align: center;
  color: #6B7280;
  font-size: 13px;
}
</style>