<template>
  <div class="attachment-uploader">
    <!-- 隐藏的 file input -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 未选择文件 -->
    <button
      v-if="selectedFiles.length === 0"
      type="button"
      class="dropzone"
      :class="{ 'dropzone--dragging': isDragging }"
      @click="fileInputRef.click()"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div class="dropzone__icon">
        <VaIcon name="mdi-tray-arrow-up" />
      </div>
      <div class="dropzone__title">拖拽图片到这里，或点击选择</div>
      <div class="dropzone__meta">支持批量上传，选择后立即预览</div>
    </button>

    <!-- 已选择文件：预览 + 操作 -->
    <div v-else class="preview-area">
      <div class="preview-summary">
        <div class="preview-summary__main">
          <div class="preview-name text-sm">
            {{ selectedFiles.length === 1 ? selectedFiles[0].name : `已选择 ${selectedFiles.length} 张图片` }}
          </div>
          <div class="preview-size text-xs text-secondary">
            {{ totalSizeDisplay }}
          </div>
        </div>
        <div class="preview-actions">
          <div v-if="uploading" class="upload-progress">
            <div v-if="!processing" class="progress-bar-wrap">
              <VaProgressBar
                :model-value="uploadProgress"
                size="small"
                color="primary"
                class="progress-bar"
              />
              <span class="progress-text text-xs">{{ uploadProgress }}%</span>
            </div>
            <div v-else class="processing-wrap">
              <VaProgressCircle indeterminate size="16px" />
              <span class="text-xs text-secondary ml-1">
                {{ currentFileIndex + 1 }}/{{ selectedFiles.length }} 处理中...
              </span>
            </div>
          </div>
          <template v-else>
            <VaButton
              size="small"
              preset="secondary"
              icon="mdi-plus"
              @click="fileInputRef.click()"
            >
              继续添加
            </VaButton>
            <VaButton
              size="small"
              @click="handleUpload"
            >
              上传
            </VaButton>
            <VaButton
              size="small"
              preset="plain"
              color="secondary"
              icon="mdi-close"
              @click="clearSelection"
            />
          </template>
        </div>
      </div>

      <div class="preview-grid">
        <div
          v-for="(url, index) in previewUrls"
          :key="`${selectedFiles[index]?.name || 'file'}-${index}`"
          class="preview-grid__item"
        >
          <img :src="url" class="preview-grid__img" :alt="selectedFiles[index]?.name || '预览'" />
          <div class="preview-grid__name text-xs text-secondary">
            {{ selectedFiles[index]?.name || '图片' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'vuestic-ui'
import { uploadAttachment } from '../api/attachments'
import Pica from 'pica'

const props = defineProps({
  entityType: { type: String, required: true },
  entityId:   { type: String, required: true }
})

const emit = defineEmits(['uploaded'])

const { init: notify } = useToast()
const fileInputRef = ref(null)
const selectedFiles = ref([])
const previewUrls = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)   // 0-100，当前文件传输进度
const processing = ref(false)   // true = 当前文件已传完，后端处理中
const currentFileIndex = ref(0) // 当前正在上传的文件索引
const isDragging = ref(false)

const totalSizeDisplay = computed(() => {
  if (selectedFiles.value.length === 1) {
    return formatSize(selectedFiles.value[0].size)
  }
  const total = selectedFiles.value.reduce((acc, f) => acc + f.size, 0)
  return `总计 ${formatSize(total)}`
})

// 上传前的图片处理逻辑：
// 1. HEIF/HEIC 等苹果特定格式直接透传
// 2. 其他格式长宽均未超过 1920px 直接透传
// 3. 超过 1920px 的格式，使用 pica 缩放为最大 1920px 并转为 JPEG (0.85质量)
const processImageBeforeUpload = (file) => {
  return new Promise((resolve, reject) => {
    // 1. 苹果特定格式（HEIF/HEIC）透传
    const isAppleFormat = ['image/heic', 'image/heic-sequence', 'image/heif', 'image/heif-sequence'].includes(file.type.toLowerCase())
    if (isAppleFormat) {
      return resolve(file)
    }

    const url = URL.createObjectURL(file)
    const img = new Image()
    
    img.onload = async () => {
      URL.revokeObjectURL(url)
      
      const width = img.width
      const height = img.height
      const MAX_SIZE = 1920
      
      // 2. 长宽未超过 1920px 时直接透传原文件
      if (width <= MAX_SIZE && height <= MAX_SIZE) {
        return resolve(file)
      }
      
      // 3. 超过限制，计算缩放比例
      let targetWidth = width
      let targetHeight = height
      if (width > height) {
        targetWidth = MAX_SIZE
        targetHeight = Math.round((height * MAX_SIZE) / width)
      } else {
        targetHeight = MAX_SIZE
        targetWidth = Math.round((width * MAX_SIZE) / height)
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      try {
        const pica = new Pica()
        // 使用 pica 进行高质量缩放 (附加锐化参数以补充由于缩减像素引起的细节丢失)
        await pica.resize(img, canvas, {
          unsharpAmount: 80,
          unsharpRadius: 0.6,
          unsharpThreshold: 2
        })
        
        // 导出格式固定为 image/jpeg，质量选取 0.85 黄金标准
        const blob = await pica.toBlob(canvas, 'image/jpeg', 0.85)
        
        if (blob) {
          // 修改文件扩展名为 .jpg 以匹配真实格式
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg"
          const resizedFile = new File([blob], newName, { type: 'image/jpeg' })
          resolve(resizedFile)
        } else {
          reject(new Error('Pica to Blob failed'))
        }
      } catch (err) {
        reject(err)
      }
    }
    
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    
    img.src = url
  })
}

const appendSelectedFiles = (files) => {
  if (files.length === 0) return

  const imageFiles = files.filter((file) => file.type.startsWith('image/'))
  if (imageFiles.length === 0) return

  const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))
  selectedFiles.value = [...selectedFiles.value, ...imageFiles]
  previewUrls.value = [...previewUrls.value, ...newPreviewUrls]
}

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files || [])
  appendSelectedFiles(files)
  e.target.value = '' // 清除 input 状态以便重复选择同名文件
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  appendSelectedFiles(files)
}

const clearSelection = () => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
  selectedFiles.value = []
  previewUrls.value = []
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0 || uploading.value) return

  uploading.value = true
  
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < selectedFiles.value.length; i++) {
    currentFileIndex.value = i
    uploadProgress.value = 0
    processing.value = false
    
    try {
      const processedFile = await processImageBeforeUpload(selectedFiles.value[i])
      await uploadAttachment(
        processedFile,
        props.entityType,
        props.entityId,
        (percent) => {
          uploadProgress.value = percent
          if (percent >= 100) {
            processing.value = true
          }
        }
      )
      successCount++
    } catch (err) {
      failCount++
      console.error(`Upload failed for file ${i}:`, err)
    }
  }

  if (successCount > 0) {
    notify({ message: `成功上传 ${successCount} 张图片${failCount > 0 ? `，${failCount} 张失败` : ''}`, color: 'success' })
    clearSelection()
    emit('uploaded')
  } else if (failCount > 0) {
    notify({ message: '所有图片上传失败，请重试', color: 'danger' })
  }

  uploading.value = false
  uploadProgress.value = 0
  processing.value = false
  currentFileIndex.value = 0
}
</script>

<style scoped>
.attachment-uploader {
  width: 100%;
}

.dropzone {
  width: 100%;
  padding: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.45);
  border-radius: var(--radius-md);
  background: rgba(248, 250, 252, 0.8);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}

.dropzone:hover,
.dropzone--dragging {
  border-color: var(--va-primary);
  background: rgba(239, 246, 255, 0.92);
  transform: translateY(-1px);
}

.dropzone__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: rgba(19, 127, 236, 0.12);
  color: var(--va-primary);
}

.dropzone__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.dropzone__meta {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.preview-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-element);
}

.preview-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
}

.preview-summary__main {
  flex: 1;
  min-width: 0;
}

.preview-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.upload-progress {
  display: flex;
  align-items: center;
  min-width: 140px;
}

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
}

.progress-bar {
  flex: 1;
  min-width: 80px;
}

.progress-text {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  width: 32px;
  text-align: right;
}

.processing-wrap {
  display: flex;
  align-items: center;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: var(--space-2);
  width: 100%;
}

.preview-grid__item {
  min-width: 0;
}

.preview-grid__img {
  width: 100%;
  display: block;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-light);
}

.preview-grid__name {
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .preview-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .preview-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
