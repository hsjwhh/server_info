<template>
  <div class="attachment-uploader">
    <!-- 隐藏的 file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 未选择文件 -->
    <VaButton
      v-if="!selectedFile"
      preset="secondary"
      icon="mdi-image-plus"
      size="small"
      @click="fileInputRef.click()"
    >
      选择图片
    </VaButton>

    <!-- 已选择文件：预览 + 操作 -->
    <div v-else class="preview-area">
      <img :src="previewUrl" class="preview-thumb" alt="预览" />
      <div class="preview-info">
        <div class="preview-name text-sm">{{ selectedFile.name }}</div>
        <div class="preview-size text-xs text-secondary">{{ formatSize(selectedFile.size) }}</div>
      </div>
      <div class="preview-actions">
        <!-- 上传中：显示进度条或处理中提示 -->
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
            <span class="text-xs text-secondary ml-1">处理中...</span>
          </div>
        </div>

        <!-- 未上传：显示上传和取消按钮 -->
        <template v-else>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'vuestic-ui'
import { uploadAttachment } from '../api/attachments'

const props = defineProps({
  entityType: { type: String, required: true },
  entityId:   { type: String, required: true }
})

const emit = defineEmits(['uploaded'])

const { init: notify } = useToast()
const fileInputRef = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)   // 0-100，文件传输进度
const processing = ref(false)   // true = 文件已传完，后端处理中

// 上传前的图片处理：仅当长或宽超过 1920px 时进行等比例缩放，否则透传原文件
const processImageBeforeUpload = (file) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      const width = img.width
      const height = img.height
      const MAX_SIZE = 1920
      
      // 如果长或宽都没有超过 1920，直接返回原文件
      if (width <= MAX_SIZE && height <= MAX_SIZE) {
        resolve(file)
        return
      }
      
      // 计算缩放比例
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
      const ctx = canvas.getContext('2d')
      
      // 绘制缩放后的图像
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      
      // 导出处理后的图像
      // 质量设为 1.0 以尽可能保留细节，交由后端进行最终压缩
      canvas.toBlob((blob) => {
        if (blob) {
          // 如果浏览器不支持原格式导出，blob.type 会自动降级（如降级为 image/png）
          // 我们使用实际导出的 blob.type 来创建新文件，确保后端识别正确
          const resizedFile = new File([blob], file.name, { type: blob.type })
          resolve(resizedFile)
        } else {
          reject(new Error('Canvas to Blob failed'))
        }
      }, file.type, 1.0) 
    }
    
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    
    img.src = url
  })
}

const handleFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  try {
    // 执行预处理：超大图缩放，普通图透传
    selectedFile.value = await processImageBeforeUpload(file)
    previewUrl.value = URL.createObjectURL(selectedFile.value)
  } catch (error) {
    notify({ message: '图片处理失败，请重试', color: 'danger' })
    console.error('Image processing error:', error)
  } finally {
    e.target.value = '' // 清除 input 状态以便重复选择同名文件
  }
}

const clearSelection = () => {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const handleUpload = async () => {
  if (!selectedFile.value || uploading.value) return

  uploading.value = true
  uploadProgress.value = 0
  processing.value = false

  try {
    await uploadAttachment(
      selectedFile.value,
      props.entityType,
      props.entityId,
      (percent) => {
        uploadProgress.value = percent
        // 传输完成（100%）后切换为处理中状态
        if (percent >= 100) {
          processing.value = true
        }
      }
    )
    notify({ message: '上传成功', color: 'success' })
    clearSelection()
    emit('uploaded')
  } catch (err) {
    const msg = err.response?.data?.message || '上传失败，请重试'
    notify({ message: msg, color: 'danger' })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    processing.value = false
  }
}
</script>

<style scoped>
.attachment-uploader {
  display: inline-block;
}

.preview-area {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-element);
}

.preview-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
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
}

.upload-progress {
  display: flex;
  align-items: center;
  min-width: 120px;
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
</style>
