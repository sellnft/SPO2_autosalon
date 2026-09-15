<script setup>
import { computed, ref } from 'vue'
import { formatPrice } from '@/utils/formatPrice'

const props = defineProps({
  price: {
    type: Number,
    required: true
  },
  negotiable: {
    type: Boolean,
    default: false
  },
  oldPrice: {
    type: Number,
    default: null
  },
  marketAverage: {
    type: Number,
    default: null
  },
  showMarketCompare: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})

const isCopied = ref(false)

const discount = computed(() => {
  if (!props.oldPrice || props.oldPrice <= props.price) return 0
  return Math.round(((props.oldPrice - props.price) / props.oldPrice) * 100)
})

const marketDiff = computed(() => {
  if (!props.marketAverage || !props.showMarketCompare) return null
  const diff = props.price - props.marketAverage
  const percent = Math.round((diff / props.marketAverage) * 100)
  if (Math.abs(percent) < 3) return { state: 'fair', percent: 0 }
  return {
    state: diff < 0 ? 'good' : 'high',
    percent: Math.abs(percent),
    diff: Math.abs(diff)
  }
})

async function copyPrice() {
  try {
    await navigator.clipboard.writeText(String(props.price))
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 1500)
  } catch (e) {
    // silent
  }
}
</script>

<template>
  <div class="cv-price" :class="`cv-price--${size}`">
    <div class="cv-price__main">
      <div class="cv-price__row">
        <span class="cv-price__value">{{ formatPrice(price) }}</span>

        <button
          type="button"
          class="cv-price__copy"
          :aria-label="isCopied ? 'Скопировано' : 'Скопировать цену'"
          @click="copyPrice"
        >
          <svg v-if="!isCopied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
        </button>

        <span v-if="negotiable" class="cv-price__negotiable">торг</span>
      </div>

      <div v-if="oldPrice || discount" class="cv-price__old-row">
        <span v-if="oldPrice" class="cv-price__old">{{ formatPrice(oldPrice) }}</span>
        <span v-if="discount" class="cv-price__discount">−{{ discount }}%</span>
      </div>

      <div
        v-if="marketDiff"
        class="cv-price__market"
        :data-state="marketDiff.state"
      >
        <span class="cv-price__market-icon" aria-hidden="true">
          <svg v-if="marketDiff.state === 'good'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <svg v-else-if="marketDiff.state === 'high'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
          </svg>
        </span>

        <span v-if="marketDiff.state === 'good'" class="cv-price__market-text">
          Ниже рынка на {{ marketDiff.percent }}%
        </span>
        <span v-else-if="marketDiff.state === 'high'" class="cv-price__market-text">
          Выше рынка на {{ marketDiff.percent }}%
        </span>
        <span v-else class="cv-price__market-text">
          Цена соответствует рынку
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cv-price {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-price__main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-price__row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-price__value {
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.05;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 2px 24px rgba(201, 169, 97, 0.15);
  white-space: nowrap;
}

.cv-price--sm .cv-price__value { font-size: 22px; }
.cv-price--md .cv-price__value { font-size: 32px; }
.cv-price--lg .cv-price__value { font-size: 40px; }

.cv-price__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-price__copy:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  transform: translateY(-1px);
}

.cv-price__copy:active {
  transform: translateY(0) scale(0.94);
}

.cv-price__copy:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-price__negotiable {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.2), rgba(122, 154, 106, 0.08));
  border: 1px solid rgba(122, 154, 106, 0.4);
  border-radius: 999px;
  white-space: nowrap;
}

.cv-price__old-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cv-price__old {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.1px;
  color: rgba(200, 190, 175, 0.45);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  text-decoration-color: rgba(200, 190, 175, 0.4);
}

.cv-price--sm .cv-price__old { font-size: 13px; }
.cv-price--lg .cv-price__old { font-size: 17px; }

.cv-price__discount {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8A88A 0%, #B87755 55%, #6B4225 100%);
  border-radius: 999px;
  box-shadow:
    0 4px 12px rgba(184, 119, 85, 0.35),
    0 1px 0 rgba(255, 210, 190, 0.4) inset;
  white-space: nowrap;
}

.cv-price__market {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  width: fit-content;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cv-price__market-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cv-price__market[data-state="good"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.14), rgba(122, 154, 106, 0.04));
  border: 1px solid rgba(122, 154, 106, 0.32);
}

.cv-price__market[data-state="high"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.14), rgba(184, 119, 85, 0.04));
  border: 1px solid rgba(184, 119, 85, 0.32);
}

.cv-price__market[data-state="fair"] {
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 640px) {
  .cv-price--lg .cv-price__value { font-size: 32px; }
  .cv-price--md .cv-price__value { font-size: 26px; }
  .cv-price--sm .cv-price__value { font-size: 20px; }

  .cv-price__old { font-size: 13px; }

  .cv-price__copy {
    width: 28px;
    height: 28px;
  }

  .cv-price__market {
    font-size: 11px;
    padding: 5px 10px;
  }
}
</style>