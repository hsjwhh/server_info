<!-- src/components/ServerList/ServerSearchFilter.vue -->
<template>
  <VaCard>
    <VaCardContent>
      <div class="toolbar">
        <!-- SN 搜索框 -->
        <div class="search-container">
          <VaInput
            v-model="searchQuery"
            placeholder="请输入 SN 进行搜索..."
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prepend>
              <VaIcon name="mdi-magnify" />
            </template>
          </VaInput>
          <VaButton
            @click="handleSearch"
            :loading="searching"
            :disabled="!searchQuery"
          >
            搜索
          </VaButton>
        </div>
      </div>

    </VaCardContent>
  </VaCard>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import {
  VaCard,
  VaCardContent,
  VaInput,
  VaButton,
  VaIcon
} from 'vuestic-ui'
import { useServerListStore } from '../../stores/useServerListStore'
import { useServerSearch } from '../../composables/useServerSearch'

// 初始化 Store 和 Composables
const store = useServerListStore()
const { searchQuery, searching, loading } = storeToRefs(store)

const {
  executeSearch
} = useServerSearch()

// 直接调用 composable 中的防抖或对应的处理函数
const handleSearch = () => {
  executeSearch()
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.search-container {
  flex: 1;
  max-width: 600px;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.search-input {
  flex: 1;
}


@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
    flex-direction: column;
  }
}
</style>
