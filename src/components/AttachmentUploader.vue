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
        <VaButton
          size="small"
          :loading="uploading"
          @click="handleUpload"
        >
          上传
        </VaButton>
        <VaButton
          size="small"
          preset="plain"
          color="secondary"
          icon="mdi-close"
          :disabled="uploading"
          @click="clearSelection"
        />
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

// 前端利用 Canvas 转换为 WebP
const convertToWebpBrowser = (file, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      // 绘制图像（对于 GIF 默认只截取第一帧）
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          // 替换原扩展名为 .webp
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
          const webpFile = new File([blob], newName, { type: 'image/webp' })
          resolve(webpFile)
        } else {
          reject(new Error('Canvas to Blob failed'))
        }
      }, 'image/webp', quality)
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
    // 尝试压缩并转换为 WebP
    const webpFile = await convertToWebpBrowser(file)
    
    // 择优录取：仅当 WebP 更小时才使用，否则保留原文件
    if (webpFile.size < file.size) {
      selectedFile.value = webpFile
    } else {
      selectedFile.value = file
    }
    
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
  try {
    await uploadAttachment(selectedFile.value, props.entityType, props.entityId)
    notify({ message: '上传成功', color: 'success' })
    clearSelection()
    emit('uploaded')
  } catch (err) {
    const msg = err.response?.data?.message || '上传失败，请重试'
    notify({ message: msg, color: 'danger' })
  } finally {
    uploading.value = false
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
</style>
