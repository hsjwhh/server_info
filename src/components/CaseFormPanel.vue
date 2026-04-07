<template>
  <div class="case-edit">
    <div class="case-edit__header">
      <div>
        <div class="case-edit__eyebrow">{{ eyebrow }}</div>
        <h2 class="case-edit__title">{{ title }}<span v-if="titleAccent">：{{ titleAccent }}</span></h2>
        <p v-if="subtitle" class="case-edit__subtitle">{{ subtitle }}</p>
      </div>
      <div class="case-edit__header-actions">
        <VaButton preset="secondary" @click="$emit('cancel')">
          {{ cancelText }}
        </VaButton>
        <VaButton v-if="showSubmit" @click="$emit('submit')">
          {{ submitText }}
        </VaButton>
      </div>
    </div>

    <section class="case-edit__card case-edit__card--main">
      <div class="case-edit__card-title">
        <span class="case-edit__accent"></span>
        <span>General Information</span>
      </div>
      <div class="case-edit__form-grid">
        <template v-for="field in generalFields" :key="field.key">
          <VaSelect
            v-if="field.type === 'select'"
            v-model="field.model.value"
            :label="field.label"
            :options="field.options"
            :value-by="field.valueBy || 'value'"
            :text-by="field.textBy || 'text'"
            :readonly="field.readonly"
          />
          <VaInput
            v-else-if="field.model"
            v-model="field.model.value"
            :label="field.label"
            :placeholder="field.placeholder"
            :readonly="field.readonly"
          />
          <VaInput
            v-else
            :model-value="field.value"
            :label="field.label"
            :placeholder="field.placeholder"
            :readonly="field.readonly ?? true"
          />
        </template>
      </div>
    </section>

    <section class="case-edit__card">
      <div class="case-edit__card-title">
        <span class="case-edit__accent case-edit__accent--warm"></span>
        <span>Problem Details</span>
      </div>
      <VaTextarea
        class="case-edit__textarea"
        v-model="descriptionModel.value"
        :label="descriptionLabel"
        :placeholder="descriptionPlaceholder"
        :readonly="descriptionReadonly"
        :min-rows="descriptionRows"
        autosize
      />
    </section>

    <section v-if="resolutionModel" class="case-edit__card">
      <div class="case-edit__card-title">
        <span class="case-edit__accent case-edit__accent--soft"></span>
        <span>Resolution Strategy</span>
      </div>
      <VaTextarea
        class="case-edit__textarea"
        v-model="resolutionModel.value"
        :label="resolutionLabel"
        :placeholder="resolutionPlaceholder"
        :readonly="resolutionReadonly"
        :min-rows="resolutionRows"
        autosize
      />
      <div v-if="readonlyTip" class="case-edit__readonly-tip">
        {{ readonlyTip }}
      </div>
    </section>
  </div>
</template>

<script setup>
import { VaButton, VaInput, VaSelect, VaTextarea } from 'vuestic-ui'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  titleAccent: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  cancelText: { type: String, default: '取消' },
  submitText: { type: String, default: '提交' },
  showSubmit: { type: Boolean, default: true },
  generalFields: { type: Array, default: () => [] },
  descriptionModel: { type: Object, required: true },
  descriptionLabel: { type: String, default: '问题描述' },
  descriptionPlaceholder: { type: String, default: '' },
  descriptionReadonly: { type: Boolean, default: false },
  descriptionRows: { type: Number, default: 5 },
  resolutionModel: { type: Object, default: null },
  resolutionLabel: { type: String, default: '解决方案' },
  resolutionPlaceholder: { type: String, default: '' },
  resolutionReadonly: { type: Boolean, default: false },
  resolutionRows: { type: Number, default: 5 },
  readonlyTip: { type: String, default: '' },
})

defineEmits(['cancel', 'submit'])
</script>

<style scoped>
.case-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: min(960px, 100%);
  padding: 6px 2px;
}

.case-edit__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.case-edit__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

.case-edit__title {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--va-text-primary);
}

.case-edit__title span {
  color: #154ec1;
}

.case-edit__subtitle {
  margin-top: 8px;
  font-size: 13px;
  color: var(--va-text-secondary);
}

.case-edit__header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.case-edit__card {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 32px -4px rgba(25, 28, 30, 0.06);
}

.case-edit__card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  font-size: 18px;
  font-weight: 700;
  color: var(--va-text-primary);
}

.case-edit__accent {
  width: 4px;
  height: 24px;
  border-radius: 999px;
  background: #2356c9;
}

.case-edit__accent--warm {
  background: #9a3600;
}

.case-edit__accent--soft {
  background: #465581;
}

.case-edit__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.case-edit__textarea {
  display: block;
  width: 100%;
}

.case-edit__textarea :deep(.va-input-wrapper),
.case-edit__textarea :deep(.va-input-container),
.case-edit__textarea :deep(.va-input-content),
.case-edit__textarea :deep(textarea) {
  width: 100%;
}

.case-edit__readonly-tip {
  margin-top: 12px;
  font-size: 12px;
  color: var(--va-text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .case-edit {
    min-width: 0;
  }

  .case-edit__header {
    flex-direction: column;
  }

  .case-edit__form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
