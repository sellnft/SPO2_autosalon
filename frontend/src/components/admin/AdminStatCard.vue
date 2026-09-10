<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  trend: {
    type: String,
    default: null
  },
  trendDirection: {
    type: String,
    default: null,
    validator: (v) => [null, 'up', 'down'].includes(v)
  },
  accent: {
    type: String,
    default: 'accent',
    validator: (v) => ['accent', 'info', 'success', 'warning', 'danger'].includes(v)
  }
})
</script>

<template>
  <div :class="['admin-stat-card', `admin-stat-card--${accent}`]">
    <div class="admin-stat-card__header">
      <span class="admin-stat-card__label">{{ label }}</span>
    </div>
    <div class="admin-stat-card__body">
      <span class="admin-stat-card__value">{{ value }}</span>
      <span
        v-if="trend"
        :class="[
          'admin-stat-card__trend',
          trendDirection === 'up' ? 'admin-stat-card__trend--up' : 'admin-stat-card__trend--down'
        ]"
      >
        {{ trendDirection === 'up' ? '↑' : '↓' }}
        {{ trend }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.admin-stat-card {
  padding: 20px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.admin-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #C8A96E;
}

.admin-stat-card--info::before { background: #0A84FF; }
.admin-stat-card--success::before { background: #10B981; }
.admin-stat-card--warning::before { background: #F59E0B; }
.admin-stat-card--danger::before { background: #EF4444; }

.admin-stat-card__header {
  margin-bottom: 12px;
}

.admin-stat-card__label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6B7280;
}

.admin-stat-card__body {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.admin-stat-card__value {
  font-size: 32px;
  font-weight: 700;
  color: #E5E7EB;
  line-height: 1;
}

.admin-stat-card__trend {
  font-size: 12px;
  font-weight: 600;
}

.admin-stat-card__trend--up {
  color: #10B981;
}

.admin-stat-card__trend--down {
  color: #EF4444;
}
</style>