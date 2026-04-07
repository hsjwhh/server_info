<template>
  <VaCard class="server-image-panel">
    <VaCardTitle class="server-image-panel__title">
      <div class="server-image-panel__title-row">
        <div>
          <div class="server-image-panel__eyebrow">Attachment Studio</div>
          <div class="server-image-panel__heading">{{ title }}</div>
        </div>
        <VaChip size="small" color="primary" flat>
          {{ attachments.length }} 张
        </VaChip>
      </div>
    </VaCardTitle>

    <VaCardContent class="server-image-panel__content">
      <div class="server-image-panel__hero">
        <section class="upload-stage">
          <div class="upload-stage__icon">
            <VaIcon name="mdi-image-multiple-outline" size="28px" />
          </div>
          <div class="upload-stage__title">上传图片到服务器附件区</div>
          <div class="upload-stage__desc">
            支持拖拽或点击选择，多图预览后再上传。
          </div>
          <div class="upload-stage__actions">
            <AttachmentUploader
              :entity-type="entityType"
              :entity-id="entityId"
              @uploaded="emit('uploaded')"
            />
          </div>
        </section>

        <section class="gallery-stage">
          <div v-if="attachmentsLoading" class="gallery-stage__loading">
            <VaProgressCircle indeterminate size="small" />
          </div>

          <template v-else-if="previewAttachments.length > 0">
            <div class="gallery-stage__mosaic">
              <button
                v-for="attachment in previewAttachments"
                :key="attachment.id"
                type="button"
                class="gallery-stage__thumb"
                @click="openLightbox(attachment)"
              >
                <img
                  :src="`${attachment.imgPath}?w=100`"
                  :alt="attachment.originalName || '附件图片'"
                  class="gallery-stage__image"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </div>
            <div class="gallery-stage__summary">
              <div>
                <div class="gallery-stage__label">预览图库</div>
                <div class="gallery-stage__name">共 {{ attachments.length }} 张附件图片</div>
              </div>
              <div class="gallery-stage__hint">点击缩略图查看大图</div>
            </div>
          </template>

          <div v-else class="gallery-stage__empty">
            <VaIcon name="mdi-image-off-outline" size="28px" color="secondary" />
            <div class="gallery-stage__empty-title">还没有附件图片</div>
            <div class="gallery-stage__empty-desc">上传后的图片会在这里展示并支持大图预览。</div>
          </div>
        </section>
      </div>
    </VaCardContent>

    <VaModal
      v-model="lightboxVisible"
      hide-default-actions
      size="large"
      class="image-lightbox"
    >
      <div v-if="lightboxImage" class="image-lightbox__content">
        <img
          :src="lightboxImage.previewPath || lightboxImage.imgPath"
          :alt="lightboxImage.originalName || '附件图片'"
          class="image-lightbox__img"
        />
        <div class="image-lightbox__footer">
          <div class="image-lightbox__name">{{ lightboxImage.originalName || '未命名图片' }}</div>
          <VaButton preset="secondary" icon="mdi-open-in-new" @click="openImage(lightboxImage.imgPath)">
            新窗口打开
          </VaButton>
        </div>
      </div>
    </VaModal>
  </VaCard>
</template>

<script setup>
import { computed, ref } from 'vue'
import AttachmentUploader from '../AttachmentUploader.vue'

const props = defineProps({
  title: { type: String, default: '附件图片' },
  attachments: { type: Array, default: () => [] },
  attachmentsLoading: { type: Boolean, default: false },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true }
})

const emit = defineEmits(['uploaded'])

const lightboxVisible = ref(false)
const lightboxImage = ref(null)

const previewAttachments = computed(() => props.attachments)

const openImage = (imgPath) => {
  window.open(imgPath, '_blank')
}

const openLightbox = (attachment) => {
  lightboxImage.value = {
    ...attachment,
    previewPath: `${attachment.imgPath}?w=800`
  }
  lightboxVisible.value = true
}

</script>

<style scoped>
.server-image-panel {
  overflow: hidden;
}

.server-image-panel__title {
  padding-bottom: 0;
}

.server-image-panel__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.server-image-panel__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--va-primary);
}

.server-image-panel__heading {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--va-text-primary);
}

.server-image-panel__content {
  display: flex;
  flex-direction: column;
}

.server-image-panel__hero {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 2fr);
  gap: 20px;
}

.upload-stage,
.gallery-stage {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(19, 127, 236, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 1));
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
}

.upload-stage {
  min-height: 320px;
  padding: 24px;
}

.upload-stage__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: rgba(19, 127, 236, 0.12);
  color: var(--va-primary);
}

.upload-stage__title {
  margin-top: 18px;
  font-size: 22px;
  font-weight: 700;
  color: var(--va-text-primary);
}

.upload-stage__desc {
  margin-top: 8px;
  max-width: 44ch;
  line-height: 1.6;
  color: var(--va-text-secondary);
}

.upload-stage__actions {
  margin-top: 24px;
}

.gallery-stage {
  display: flex;
  flex-direction: column;
  min-height: 320px;
  padding: 18px;
}

.gallery-stage__loading,
.gallery-stage__empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.gallery-stage__empty-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--va-text-primary);
}

.gallery-stage__empty-desc {
  max-width: 28ch;
  line-height: 1.6;
  color: var(--va-text-secondary);
}

.gallery-stage__mosaic {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.gallery-stage__thumb {
  padding: 0;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.04);
  cursor: zoom-in;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.gallery-stage__thumb:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
}

.gallery-stage__image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

.gallery-stage__summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
  width: 100%;
}

.gallery-stage__hint {
  font-size: 13px;
  color: var(--va-text-secondary);
}

.gallery-stage__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--va-text-secondary);
}

.gallery-stage__name {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 700;
  color: var(--va-text-primary);
  word-break: break-word;
}

.image-lightbox__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-lightbox__img {
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.04);
}

.image-lightbox__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.image-lightbox__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  word-break: break-word;
}

@media (max-width: 900px) {
  .server-image-panel__hero {
    grid-template-columns: 1fr;
  }

  .selection-panel__header,
  .gallery-stage__summary,
  .image-lightbox__footer,
  .server-image-panel__title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .selection-panel__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .upload-stage,
  .gallery-stage {
    padding: 16px;
    border-radius: 16px;
  }

  .selection-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-stage__image {
    aspect-ratio: 1;
  }
}
</style>
