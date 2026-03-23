# Bug 修复任务单

| 字段 | 内容 |
|------|------|
| **任务编号** | BUG-2026-001 |
| **任务标题** | ServerEntryPage 表单已填写完整仍触发校验失败 |
| **所属模块** | 服务器入库录入 / `ServerEntryPage.vue` |
| **优先级** | 🔴 高 |
| **状态** | 待修复 |
| **发现日期** | 2026-03-23 |
| **负责人** | — |

---

## 问题描述

用户在「服务器入库录入」页面，填写所有必填项后点击「保存服务器入库」按钮，系统仍然弹出校验失败提示，无法正常提交。

---

## 复现步骤

1. 打开「服务器入库录入」页面
2. 填写「入库日期」、「序列号」、「客户名称」
3. 在 CPU 搜索框中输入关键词，从下拉建议中**选中**一条记录
4. 在主板搜索框中输入关键词，从下拉建议中**选中**一条记录
5. 点击「保存服务器入库」
6. **预期**：提交成功，弹出「服务器入库成功！」
7. **实际**：仍提示「必填项未完善」或「表单校验未通过」

---

## 根本原因分析

### Bug 1 — CPU / 主板校验字段绑定错误

CPU 和主板的搜索 `VaInput` 上挂载的 `:rules="requiredRule"` 校验的是**关键词文本** (`cpuKeyword` / `mbKeyword`)，而非真正表示"已从数据库选中"的 `form.cpu_id` / `form.mb_id`。

- 用户输入关键词后**不点击下拉选项**，直接继续填写，`cpuKeyword` 有值但 `cpu_id` 为 `null`
- 业务语义要求必须选中数据库记录，仅有文本不满足要求
- 当前校验无法区分"已选中"与"仅输入了文字"两种状态

### Bug 2 — async SN 规则与 `validate()` 存在竞态

`snRules` 第三条规则为 `async`（调用 `checkSnUnique` API），而部分版本的 Vuestic UI `formRef.value.validate()` **不保证等待所有异步规则 resolve** 后再返回结果，导致在 async rule 尚未完成时被判定为 `false`，进而误触发校验失败提示。

---

## 修复方案

### 方案 1：用隐藏字段承载 cpu_id / mb_id 校验

移除搜索框上的 `:rules`，改为在同一 `cpu-container` 内添加**隐藏 `VaInput`**，绑定 `form.cpu_id`（选中后值为非空字符串，未选中为空）：

```vue
<!-- 搜索框：移除 :rules，保持纯搜索功能 -->
<VaInput
  v-model="cpuKeyword"
  placeholder="输入型号搜索..."
  clearable
  :loading="searchingCpu"
  class="f-grow"
  @update:model-value="handleCpuSearch"
  @clear="clearCpu"
/>

<!-- 隐藏校验字段：绑定真正的业务约束 -->
<VaInput
  :model-value="form.cpu_id ? 'selected' : ''"
  :rules="[(v) => !!v || '请从搜索结果中选择 CPU 型号']"
  style="display: none"
  aria-hidden="true"
/>
```

主板字段同理，改为校验 `form.mb_id`。

### 方案 2：在 handleSubmit 中前置同步检查

在调用 `formRef.value.validate()` **之前**，先手动同步校验核心必填项，绕开 async rule 竞态：

```js
const handleSubmit = async () => {
  // 前置同步校验，不依赖 Vuestic async rule
  const missing = []
  if (!entryDate.value)                  missing.push('入库日期')
  if (!form.sn || form.sn.length < 4)   missing.push('序列号（至少4位）')
  if (!form.customer)                    missing.push('客户名称')
  if (!form.cpu_id)                      missing.push('CPU 型号（需从搜索结果选中）')
  if (!form.mb_id)                       missing.push('主板型号（需从搜索结果选中）')

  if (missing.length > 0) {
    notify({ message: `必填项未完善：${missing.join('、')}`, color: 'warning' })
    return
  }

  // 通过后再交由 Vuestic 做格式兜底
  const isValid = await formRef.value.validate()
  if (!isValid) {
    notify({ message: '表单校验未通过，请检查红色标注项', color: 'warning' })
    return
  }

  // ... 后续保存逻辑
}
```

---

## 改动文件清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/pages/server/ServerEntryPage.vue` | 修改 | CPU / 主板搜索框移除 `:rules`，新增隐藏校验字段；`handleSubmit` 增加前置同步检查 |

---

## 验收标准

- [ ] CPU / 主板搜索框输入文字但**未点击选项**时，提交后提示「请从搜索结果中选择 CPU 型号」
- [ ] CPU / 主板均已从下拉中选中后，不再触发该校验错误
- [ ] 序列号重复时，提示「该序列号已在库中」，不出现竞态误判
- [ ] 所有必填项完整填写、CPU/主板已选中时，可正常提交并弹出成功通知
- [ ] 重置表单后，再次填写流程正常

---

## 备注

- `StorageSelector` / `ExpansionSelector` 的 `size="small"` 按钮**不在本次改动范围内**，保持不变
- 如需同步修复 `CpuAddModal` 的 `syncSName` 参数 Bug 及 `async preventDefault` 问题，建议另开独立任务单
