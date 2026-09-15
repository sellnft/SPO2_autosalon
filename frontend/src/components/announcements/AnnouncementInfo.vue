<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  },
  showViews: {
    type: Boolean,
    default: true
  },
  showDate: {
    type: Boolean,
    default: true
  },
  showId: {
    type: Boolean,
    default: false
  },
  showVIN: {
    type: Boolean,
    default: false
  }
})

const viewsText = computed(() => {
  const views = props.announcement.views || 0
  return `${views.toLocaleString('ru-RU')} ${pluralizeViews(views)}`
})

const isNew = computed(() => {
  if (!props.announcement.createdAt) return false
  const days = (Date.now() - new Date(props.announcement.createdAt).getTime()) / 86400000
  return days <= 3
})

const isHot = computed(() => (props.announcement.views || 0) >= 500)

function pluralizeViews(count) {
  const forms = ['просмотр', 'просмотра', 'просмотров']
  const cases = [2, 0, 1, 1, 1, 2]
  const index = count % 100 > 4 && count % 100 < 20
    ? 2
    : cases[Math.min(count % 10, 5)]
  return forms[index]
}

function maskVIN(vin) {
  if (!vin) return ''
  if (vin.length <= 6) return vin
  return vin.slice(0, 3) + '•'.repeat(vin.length - 6) + vin.slice(-3)
}
</script>

<template>
  <header class="cv-ainfo">
    <div class="cv-ainfo__badges">
      <span v-if="isNew" class="cv-ainfo__badge cv-ainfo__badge--new">
        <span class="cv-ainfo__badge-spark" aria-hidden="true">✨</span>
        Новое
      </span>

      <span v-if="isHot" class="cv-ainfo__badge cv-ainfo__badge--hot">
        <span class="cv-ainfo__badge-flame" aria-hidden="true">🔥</span>
        Популярное
      </span>

      <span v-if="announcement.status === 'pending'" class="cv-ainfo__badge cv-ainfo__badge--pending">
        <span class="cv-ainfo__badge-dot" aria-hidden="true"></span>
        На модерации
      </span>

      <span v-if="announcement.is_verified" class="cv-ainfo__badge cv-ainfo__badge--verified">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l2.5 2 3.5-.5 1.5 3 3 1.5-.5 3.5 2 2.5-2 2.5.5 3.5-3 1.5-1.5 3-3.5-.5L12 22l-2.5-2-3.5.5-1.5-3-3-1.5.5-3.5L0 12l2-2.5L1.5 6l3-1.5L6 1.5 9.5 2z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        Проверено
      </span>
    </div>

    <h1 class="cv-ainfo__title">
      {{ announcement.brand }}
      <span class="cv-ainfo__title-accent">{{ announcement.model }}</span><span class="cv-ainfo__title-sep">,</span>
      <span class="cv-ainfo__title-year">{{ announcement.year }}</span>
    </h1>

    <div class="cv-ainfo__meta">
      <span v-if="showViews" class="cv-ainfo__meta-item" :class="{ 'cv-ainfo__meta-item--hot': isHot }">
        <span class="cv-ainfo__meta-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/>
            <circle cx="7" cy="7" r="1.5"/>
          </svg>
        </span>
        {{ viewsText }}
      </span>

      <span v-if="showViews && showDate" class="cv-ainfo__meta-dot" aria-hidden="true"></span>

      <span v-if="showDate" class="cv-ainfo__meta-item">
        <span class="cv-ainfo__meta-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="6" width="18" height="14" rx="2"/>
            <path d="M3 10h18M8 6V3M16 6V3"/>
          </svg>
        </span>
        {{ formatDate(announcement.createdAt, 'long') }}
      </span>

      <template v-if="showId && announcement.id">
        <span class="cv-ainfo__meta-dot" aria-hidden="true"></span>
        <span class="cv-ainfo__meta-id">
          <span class="cv-ainfo__meta-id-label">ID</span>
          <span class="cv-ainfo__meta-id-value">#{{ announcement.id }}</span>
        </span>
      </template>
    </div>

    <div v-if="showVIN && announcement.vin" class="cv-ainfo__vin">
      <span class="cv-ainfo__vin-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M7 8v8M11 8v8M15 8v8M19 8v8"/>
        </svg>
      </span>
      <span class="cv-ainfo__vin-label">VIN</span>
      <span class="cv-ainfo__vin-value">{{ maskVIN(announcement.vin) }}</span>
    </div>
  </header>
</template>

<style scoped>
.cv-ainfo {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-ainfo__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cv-ainfo__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 999px;
  border: 1px solid transparent;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  white-space: nowrap;
}

.cv-ainfo__badge--new {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-ainfo__badge-spark {
  font-size: 11px;
  filter: saturate(1.3);
}

.cv-ainfo__badge--hot {
  color: #E8A88A;
  background: rgba(60, 30, 20, 0.75);
  border-color: rgba(184, 119, 85, 0.5);
  box-shadow: 0 4px 14px rgba(184, 119, 85, 0.25);
}

.cv-ainfo__badge-flame {
  font-size: 11px;
  animation: cvAinfoFlame 1.6s ease-in-out infinite;
}

@keyframes cvAinfoFlame {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.15) rotate(-4deg); }
}

.cv-ainfo__badge--pending {
  color: #F0C080;
  background: rgba(60, 40, 10, 0.75);
  border-color: rgba(217, 119, 6, 0.45);
}

.cv-ainfo__badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
  animation: cvAinfoDot 1.8s ease-in-out infinite;
}

@keyframes cvAinfoDot {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.cv-ainfo__badge--verified {
  color: #B8CEA8;
  background: rgba(20, 30, 15, 0.75);
  border-color: rgba(122, 154, 106, 0.45);
  box-shadow: 0 4px 14px rgba(122, 154, 106, 0.2);
}

.cv-ainfo__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.95);
}

.cv-ainfo__title-accent {
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.cv-ainfo__title-sep {
  color: rgba(200, 190, 175, 0.4);
  margin: 0 1px;
}

.cv-ainfo__title-year {
  color: rgba(220, 210, 195, 0.7);
  font-weight: 700;
}

.cv-ainfo__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.55);
}

.cv-ainfo__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cv-ainfo__meta-item--hot {
  color: #E8A88A;
  font-weight: 650;
}

.cv-ainfo__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-ainfo__meta-item--hot .cv-ainfo__meta-icon {
  color: #E8A88A;
}

.cv-ainfo__meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.4);
  flex-shrink: 0;
}

.cv-ainfo__meta-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
}

.cv-ainfo__meta-id-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.4);
}

.cv-ainfo__meta-id-value {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: #E8D5A0;
}

.cv-ainfo__vin {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 11px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  border: 1px solid rgba(201, 169, 97, 0.2);
  width: fit-content;
}

.cv-ainfo__vin-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.cv-ainfo__vin-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-ainfo__vin-value {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #E8D5A0;
}

@media (max-width: 768px) {
  .cv-ainfo {
    gap: 12px;
  }

  .cv-ainfo__title {
    font-size: 22px;
    letter-spacing: -0.4px;
  }

  .cv-ainfo__badge {
    padding: 4px 9px;
    font-size: 10.5px;
  }

  .cv-ainfo__meta {
    font-size: 12.5px;
    gap: 8px;
  }

  .cv-ainfo__vin {
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .cv-ainfo__title {
    font-size: 19px;
    letter-spacing: -0.3px;
  }

  .cv-ainfo__meta {
    font-size: 12px;
  }

  .cv-ainfo__vin {
    width: 100%;
  }
}
</style>