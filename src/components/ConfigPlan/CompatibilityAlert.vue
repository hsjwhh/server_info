<!-- src/components/ConfigPlan/CompatibilityAlert.vue -->
<template>
  <VaCard v-if="validationResult.blockers.length > 0 || validationResult.warnings.length > 0 || validationResult.infos.length > 0">
    <VaCardTitle>
      <VaIcon name="mdi-alert-circle-outline" color="primary" class="mr-2" />
      兼容性与建议
    </VaCardTitle>
    <VaCardContent>
      <!-- Blockers (红色) -->
      <VaAlert
        v-for="(item, index) in validationResult.blockers"
        :key="`blocker-${index}`"
        color="danger"
        border="left"
        class="mb-2"
      >
        <template #icon>
          <VaIcon name="mdi-close-octagon" />
        </template>
        {{ item }}
      </VaAlert>

      <!-- Warnings (黄色) -->
      <VaAlert
        v-for="(item, index) in validationResult.warnings"
        :key="`warning-${index}`"
        color="warning"
        border="left"
        class="mb-2"
      >
        <template #icon>
          <VaIcon name="mdi-alert" />
        </template>
        {{ item }}
      </VaAlert>

      <!-- Infos (蓝色/Outline) -->
      <VaAlert
        v-for="(item, index) in validationResult.infos"
        :key="`info-${index}`"
        color="info"
        outline
        class="mb-2"
      >
        <template #icon>
          <VaIcon name="mdi-information" />
        </template>
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
