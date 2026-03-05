<!-- src/components/ConfigPlan/CompatibilityAlert.vue -->
<template>
  <VaCard v-if="compatibilityWarnings.length > 0">
    <VaCardTitle>
      <VaIcon name="mdi-alert" color="warning" class="mr-2" />
      兼容性提示
    </VaCardTitle>
    <VaCardContent>
      <VaAlert
        v-for="(warning, index) in compatibilityWarnings"
        :key="index"
        color="warning"
        border="left"
        class="mb-2"
      >
        {{ warning }}
      </VaAlert>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
import { VaCard, VaCardTitle, VaCardContent, VaIcon, VaAlert } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const { compatibilityWarnings } = storeToRefs(store)
</script>
