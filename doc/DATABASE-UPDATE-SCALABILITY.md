# 数据库更新 - 添加 scalability 字段

## 📝 更新说明

为支持智能 CPU 数量控制功能，需要在 `cpu_info` 表中添加 `scalability` 字段。

## 🔧 SQL 更新脚本

### 1. 添加 scalability 字段

```sql
-- 添加 scalability 字段
ALTER TABLE cpu_info 
ADD COLUMN scalability VARCHAR(10) AFTER socket;

-- 添加注释
ALTER TABLE cpu_info 
MODIFY COLUMN scalability VARCHAR(10) 
COMMENT 'CPU可扩展性: 1P/1S(单路), 2P/2S(双路), 4P/4S(四路), 8P/8S(八路)';
```

### 2. 批量更新现有数据

根据你的实际情况选择合适的更新语句：

#### 方案 A: 根据 CPU 系列自动判断

```sql
-- Intel Xeon E5 系列 → 2S (双路)
UPDATE cpu_info 
SET scalability = '2S' 
WHERE cpu_short_name LIKE '%Xeon E5%';

-- Intel Xeon E7 系列 → 4S (四路)
UPDATE cpu_info 
SET scalability = '4S' 
WHERE cpu_short_name LIKE '%Xeon E7%';

-- Intel Xeon Gold/Silver → 2S (双路)
UPDATE cpu_info 
SET scalability = '2S' 
WHERE cpu_short_name LIKE '%Xeon Gold%' 
   OR cpu_short_name LIKE '%Xeon Silver%';

-- Intel Xeon Platinum → 8S (八路，部分型号)
UPDATE cpu_info 
SET scalability = '8S' 
WHERE cpu_short_name LIKE '%Xeon Platinum%';

-- AMD EPYC → 根据型号判断
-- 单插槽版本 (通常是奇数型号末尾)
UPDATE cpu_info 
SET scalability = '1P' 
WHERE cpu_short_name LIKE '%EPYC%' 
  AND (cpu_short_name LIKE '%1' 
    OR cpu_short_name LIKE '%3' 
    OR cpu_short_name LIKE '%5' 
    OR cpu_short_name LIKE '%7' 
    OR cpu_short_name LIKE '%9');

-- 双插槽版本 (通常是偶数型号末尾)
UPDATE cpu_info 
SET scalability = '2P' 
WHERE cpu_short_name LIKE '%EPYC%' 
  AND scalability IS NULL;

-- 其他未匹配的 CPU 默认为单路
UPDATE cpu_info 
SET scalability = '1P' 
WHERE scalability IS NULL;
```

#### 方案 B: 手动逐个更新（更精确）

```sql
-- 查看需要更新的 CPU
SELECT id, cpu_short_name, socket 
FROM cpu_info 
WHERE scalability IS NULL 
ORDER BY manufacturer, cpu_short_name;

-- 手动更新示例
UPDATE cpu_info SET scalability = '2S' WHERE id = 1;
UPDATE cpu_info SET scalability = '2S' WHERE id = 2;
UPDATE cpu_info SET scalability = '1P' WHERE id = 3;
-- ... 继续更新其他记录
```

### 3. 验证更新结果

```sql
-- 检查更新情况
SELECT 
  scalability,
  COUNT(*) as count,
  GROUP_CONCAT(cpu_short_name SEPARATOR ', ') as examples
FROM cpu_info
GROUP BY scalability
ORDER BY scalability;

-- 查看未设置 scalability 的记录
SELECT id, cpu_short_name, socket 
FROM cpu_info 
WHERE scalability IS NULL;
```

## 📊 scalability 字段规范

### 字段值说明

| 值 | 含义 | CPU 数量控制 | 示例 CPU |
|----|------|-------------|----------|
| 1P | 单路 (1 Processor) | 固定 1 颗，禁止修改 | AMD EPYC 7001P, Intel Xeon D |
| 1S | 单路 (1 Socket) | 固定 1 颗，禁止修改 | AMD EPYC 7502P |
| 2P | 双路 (2 Processors) | 默认 2 颗，可选 1/2 | Intel Xeon E5-2680 v4 |
| 2S | 双路 (2 Sockets) | 默认 2 颗，可选 1/2 | Intel Xeon Gold 6148 |
| 4P | 四路 (4 Processors) | 默认 4 颗，可选 1/2/4 | Intel Xeon E7-8890 v4 |
| 4S | 四路 (4 Sockets) | 默认 4 颗，可选 1/2/4 | Intel Xeon Platinum 8180 |
| 8P | 八路 (8 Processors) | 默认 8 颗，可选 1/2/4/8 | Intel Xeon Platinum 8380 |
| 8S | 八路 (8 Sockets) | 默认 8 颗，可选 1/2/4/8 | 高端型号 |

**注意**: P 和 S 在此处含义相同，都表示物理 CPU 插槽数量。

### 常见 CPU 系列的 scalability 值

#### Intel

- **Xeon E3 系列**: `1S` (单路工作站/服务器)
- **Xeon E5 v1-v4**: `2S` (主流双路服务器)
- **Xeon E7 v1-v4**: `4S` 或 `8S` (关键业务服务器)
- **Xeon Scalable (Bronze/Silver/Gold)**: `2S` (标准双路)
- **Xeon Scalable (Platinum)**: `4S` 或 `8S` (高端多路)
- **Xeon D**: `1S` (嵌入式/边缘计算)

#### AMD

- **EPYC 7xx1P/7xx2P/7xx3P** (末尾带P): `1P` (单路)
- **EPYC 7xx1/7xx2/7xx3** (标准型号): `2P` (双路)
- **EPYC 9xx4** (Genoa): `2P` (双路)

## 🎯 前端显示效果

### 单路 CPU (1P/1S)
```
数量: [1] (不可修改，显示灰色)
提示: 单路CPU，固定1颗
```

### 双路 CPU (2P/2S)
```
数量: [-] [2] [+] (可修改)
提示: 此 CPU 支持最多 2 路配置
可选值: 1, 2
```

### 四路 CPU (4P/4S)
```
数量: [-] [4] [+] (可修改)
提示: 此 CPU 支持最多 4 路配置
可选值: 1, 2, 4
```

### 八路 CPU (8P/8S)
```
数量: [-] [8] [+] (可修改)
提示: 此 CPU 支持最多 8 路配置
可选值: 1, 2, 4, 8
```

## 📋 数据填充建议

### 批量导入 CSV 示例

如果你有 CPU 列表的 CSV 文件，可以添加 scalability 列：

```csv
id,cpu_short_name,scalability
1,Intel Xeon E5-2680 v4,2S
2,Intel Xeon Gold 6148,2S
3,AMD EPYC 7502,1P
4,Intel Xeon Platinum 8380,8S
```

导入命令：
```sql
LOAD DATA LOCAL INFILE 'cpu_scalability.csv'
INTO TABLE cpu_info
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, @dummy, scalability)
SET id = id, scalability = scalability;
```

## 🔍 常见问题

### Q1: 如何判断一个 CPU 是单路还是双路？

**方法 1**: 查看 CPU 规格书的 "Scalability" 或 "Max # of CPUs" 字段

**方法 2**: 根据型号命名规则：
- Intel: 末尾带 "P" 的通常是单路 (如 E3-1200 系列)
- AMD: 型号末尾带 "P" 的是单路 (如 EPYC 7502P)

**方法 3**: 查看官方 ARK 数据库 (Intel) 或产品页 (AMD)

### Q2: 如果 scalability 为空怎么办？

前端会默认为单路 CPU，数量固定为 1 且不可修改。

### Q3: 可以支持非标准配置吗？（如 3 路）

目前不支持。如果有特殊需求，建议：
1. 在数据库中设置为最接近的标准值
2. 在备注中说明实际配置

## ✅ 更新检查清单

- [ ] 执行 ALTER TABLE 添加 scalability 字段
- [ ] 批量更新现有 CPU 数据的 scalability 值
- [ ] 验证更新结果（确保无 NULL 值）
- [ ] 测试前端页面 CPU 数量控制功能
- [ ] 更新数据录入文档，要求新增 CPU 必须填写 scalability

## 📝 数据维护建议

1. **新增 CPU 时**: 必须填写 scalability 字段
2. **定期检查**: 每月检查是否有 scalability 为 NULL 的记录
3. **数据校验**: 可以添加约束确保 scalability 在允许的值范围内

```sql
-- 添加检查约束 (MySQL 8.0+)
ALTER TABLE cpu_info
ADD CONSTRAINT chk_scalability 
CHECK (scalability IN ('1P', '1S', '2P', '2S', '4P', '4S', '8P', '8S'));
```
