<!-- src/components/ConfigPlan/CompatibilityAlert.vue -->
<template>
  <VaCard v-if="validationResult.blockers.length > 0 || validationResult.warnings.length > 0">
    <VaCardTitle>
      <VaIcon name="mdi-alert" color="warning" class="mr-2" />
      兼容性提示
    </VaCardTitle>
    <VaCardContent>
      <VaAlert
        v-for="(item, index) in validationResult.blockers"
        :key="`blocker-${index}`"
        color="danger"
        border="left"
        class="mb-2"
      >
        {{ item }}
      </VaAlert>
      <VaAlert
        v-for="(item, index) in validationResult.warnings"
        :key="`warning-${index}`"
        color="warning"
        border="left"
        class="mb-2"
      >
        {{ item }}
      </VaAlert>
    </VaCardContent>
  </VaCard>
</template>

<script setup>
import { VaCard, VaCardTitle, VaCardContent, VaIcon, VaAlert } from 'vuestic-ui'
import { storeToRefs } from 'pinia'
import { useConfigPlanStore } from '../../stores/configPlan'

const store = useConfigPlanStore()
const { validationResult } = storeToRefs(store)
</script>
