# CPU 数量控件 - 两种实现方案

## 问题说明

`VaCounter` 组件在当前版本的 Vuestic UI 中可能不显示 `[-]` `[+]` 按钮，导致用户只能通过键盘方向键调整数量，用户体验不佳。

## 解决方案

### 方案 1: 自定义数字输入控件（已采用）✅

使用 `VaButton` + `VaInput[type=number]` 组合，完全自定义控制。

#### 代码实现

```vue
<template>
  <!-- CPU 数量 -->
  <div class="cpu-count-control">
    <label class="va-input-label">{{ cpuCountLabel }}</label>
    <div class="count-input-group">
      <VaButton
        :disabled="cpuScalability.disabled || cpuCount <= cpuScalability.min"
        icon="mdi-minus"
        size="small"
        @click="cpuCount--"
      />
      <VaInput
        v-model.number="cpuCount"
        :disabled="cpuScalability.disabled"
        :min="cpuScalability.min"
        :max="cpuScalability.max"
        type="number"
        style="width: 80px; text-align: center;"
        class="mx-2"
      />
      <VaButton
        :disabled="cpuScalability.disabled || cpuCount >= cpuScalability.max"
        icon="mdi-plus"
        size="small"
        @click="cpuCount++"
      />
    </div>
  </div>
</template>

<style scoped>
.cpu-count-control .va-input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.count-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-input-group .va-input input {
  text-align: center;
  font-weight: 600;
}
</style>
```

#### 优点
- ✅ 直观清晰：明确的 `[-]` `[+]` 按钮
- ✅ 多种交互方式：点击按钮、键盘、直接输入
- ✅ 完全可控：自定义样式和逻辑
- ✅ 兼容性好：不依赖特定版本

#### 缺点
- ⚠️ 代码稍多：需要手动处理按钮状态
- ⚠️ 需要验证：用户可能直接输入超出范围的数字

---

### 方案 2: VaSelect 下拉选择（备选）

使用下拉选择器，特别适合只允许特定值的场景。

#### 代码实现

```vue
<script setup>
/**
 * CPU 数量选项
 * 根据 scalability 生成可选值
 */
const cpuCountOptions = computed(() => {
  const max = cpuScalability.value.max
  
  // 方式 1: 连续数值 [1, 2, 3, 4, ...]
  // return Array.from({ length: max }, (_, i) => i + 1)
  
  // 方式 2: 2 的幂次方 [1, 2, 4, 8]
  const options = []
  for (let i = 1; i <= max; i *= 2) {
    options.push(i)
  }
  return options
})
</script>

<template>
  <!-- 单路 CPU: 显示静态文本 -->
  <VaInput
    v-if="cpuScalability.disabled"
    :model-value="1"
    label="数量 (单路CPU，固定1颗)"
    disabled
    readonly
    class="mt-3"
  />
  
  <!-- 多路 CPU: 下拉选择 -->
  <VaSelect
    v-else
    v-model="cpuCount"
    :label="cpuCountLabel"
    :options="cpuCountOptions"
    class="mt-3"
  >
    <template #prepend>
      <VaIcon name="mdi-chip" size="small" />
    </template>
  </VaSelect>
</template>
```

#### 优点
- ✅ 代码简洁：无需手动控制按钮状态
- ✅ 限制明确：用户只能选择预定义的值
- ✅ 移动端友好：下拉选择在手机上体验更好

#### 缺点
- ⚠️ 灵活性差：无法输入任意值
- ⚠️ 需要额外点击：下拉打开 → 选择，步骤较多

---

## 方案对比

| 特性 | 方案 1: 自定义控件 | 方案 2: VaSelect |
|-----|------------------|-----------------|
| **UI 直观性** | ⭐⭐⭐⭐⭐ 非常直观 | ⭐⭐⭐⭐ 清晰 |
| **操作便捷性** | ⭐⭐⭐⭐⭐ 点击±即可 | ⭐⭐⭐ 需要展开下拉 |
| **代码复杂度** | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 简单 |
| **灵活性** | ⭐⭐⭐⭐⭐ 任意整数 | ⭐⭐⭐ 仅预定义值 |
| **移动端体验** | ⭐⭐⭐⭐ 好 | ⭐⭐⭐⭐⭐ 很好 |
| **适用场景** | 通用场景 | 限定值场景 |

---

## 推荐使用场景

### 使用方案 1（自定义控件）当：
- ✅ 允许任意整数（如 1-8 路都可以）
- ✅ 用户需要快速调整数量
- ✅ PC 端为主要使用场景

### 使用方案 2（VaSelect）当：
- ✅ 只允许特定值（如 1, 2, 4, 8）
- ✅ 移动端为主要使用场景
- ✅ 选项数量较少（<10 个）

---

## 当前实现

**已采用方案 1**，理由：
1. 服务器配置允许灵活调整 CPU 数量
2. 用户体验更直观（点击 `[-]` `[+]` 立即响应）
3. 符合常见硬件配置工具的交互习惯

---

## 扩展：添加输入验证

为了防止用户在数字输入框中输入无效值，可以添加 `watch` 监听：

```javascript
/**
 * 监听 cpuCount 变化，确保值在有效范围内
 */
watch(cpuCount, (newValue) => {
  const { min, max, disabled } = cpuScalability.value
  
  if (disabled) {
    cpuCount.value = 1
    return
  }
  
  // 确保值在 min 和 max 之间
  if (newValue < min) {
    cpuCount.value = min
  } else if (newValue > max) {
    cpuCount.value = max
  }
  
  // 确保是整数
  if (!Number.isInteger(newValue)) {
    cpuCount.value = Math.round(newValue)
  }
})
```

---

## UI 效果展示

### 方案 1 效果

**单路 CPU (1S):**
```
数量 (单路CPU，固定1颗)
┌────────────────────────────┐
│  [-]    [1]    [+]         │ (全部禁用，灰色)
└────────────────────────────┘
```

**双路 CPU (2S):**
```
数量 (最多2路)
┌────────────────────────────┐
│  [-]    [2]    [+]         │ (可点击)
└────────────────────────────┘
💡 此 CPU 支持最多 2 路配置
```

**八路 CPU (8S):**
```
数量 (最多8路)
┌────────────────────────────┐
│  [-]    [8]    [+]         │ (可点击)
└────────────────────────────┘
💡 此 CPU 支持最多 8 路配置
```

### 方案 2 效果

**单路 CPU (1S):**
```
数量 (单路CPU，固定1颗)
┌────────────────────────────┐
│  1                         │ (禁用输入框)
└────────────────────────────┘
```

**双路 CPU (2S):**
```
数量 (最多2路)
┌────────────────────────────┐
│  2                      ▼  │ (下拉选择)
└────────────────────────────┘
  ┌──────────┐
  │  1       │
  │  2    ✓  │
  └──────────┘
```

---

## 结论

当前采用的**方案 1（自定义控件）**最适合服务器配置场景，提供了清晰的 UI 和灵活的操作方式。如果后续有特殊需求（如只允许 2 的幂次方），可以轻松切换到方案 2。
