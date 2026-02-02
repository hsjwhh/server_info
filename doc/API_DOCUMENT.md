# API 接口文档

## 概述

本文档描述了服务器资产管理系统前端所需的后端 API 接口规范。

-----

## 基础信息

**Base URL**: `http://your-domain.com/api`

**认证方式**: Bearer Token (JWT)

- 在请求头中添加: `Authorization: Bearer {accessToken}`

**通用响应格式**:

```json
{
  "code": 200,
  "message": "success",
  "data": { /* 实际数据 */ }
}
```

**错误响应**:

```json
{
  "code": 400/401/404/500,
  "message": "错误信息"
}
```

-----

## 1. SN 查询模块

### 1.1 搜索服务器

**接口**: `GET /api/sn`

**描述**: 根据关键词和筛选条件搜索服务器

**请求参数** (Query Parameters):

|参数       |类型    |必填|说明              |示例        |
|---------|------|--|----------------|----------|
|keyword  |string|是 |搜索关键词(SN/主机名/IP)|R730      |
|customer |string|否 |客户名称            |阿里云       |
|business |string|否 |业务类型            |云计算       |
|dateStart|string|否 |开始日期 YYYY-MM-DD |2024-01-01|
|dateEnd  |string|否 |结束日期 YYYY-MM-DD |2024-12-31|

**请求示例**:

```
GET /api/sn?keyword=R730&customer=阿里云&business=云计算
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "SN": "R730-001",
      "年份": 2024,
      "月份": 1,
      "日期": 15,
      "出机客户": "阿里云",
      "业务": "云计算",
      "数量": 10,
      "备注": "北京机房",
      "机箱": "Dell PowerEdge R730 2U",
      "电源": "800W冗余电源",
      "主板": "Dell PowerEdge R730 主板",
      "BMC密码": "admin123",
      "CPU": "Intel Xeon E5-2680 v4 2.4GHz",
      "CPU数量": 2,
      "内存": "32GB DDR4 2400MHz",
      "内存数量": 8,
      "M2": "512GB Samsung PM981 NVMe",
      "M2数量": 1,
      "SSD": "1TB Samsung 860 EVO SATA",
      "SSD数量": 2,
      "HDD": "4TB Seagate Enterprise SATA",
      "HDD数量": 4,
      "阵列卡": "LSI MegaRAID 9361-8i",
      "阵列卡数量": 1,
      "网卡": "Intel X540 10GbE Dual Port",
      "网卡数量": 2,
      "显卡": "NVIDIA Tesla P40 24GB",
      "显卡数量": 2,
      "系统": "Ubuntu 20.04 LTS Server"
    }
  ]
}
```

**注意事项**:

- keyword 为空时返回空数组
- 支持模糊搜索
- 返回完整的服务器对象数组，不是简单的 SN 字符串数组
- 数据量大时建议加入分页参数

-----

### 1.2 获取 SN 详情

**接口**: `GET /api/sn/:sn`

**描述**: 根据 SN 编号获取服务器详细信息

**路径参数**:

|参数|类型    |必填|说明   |
|--|------|--|-----|
|sn|string|是 |SN 编号|

**请求示例**:

```
GET /api/sn/R730-001
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "SN": "R730-001",
    "年份": 2024,
    "月份": 1,
    "日期": 15,
    "出机客户": "阿里云",
    "业务": "云计算",
    "数量": 10,
    "备注": "北京机房",
    "机箱": "Dell PowerEdge R730 2U",
    "电源": "800W冗余电源",
    "主板": "Dell PowerEdge R730 主板",
    "BMC密码": "admin123",
    "CPU": "Intel Xeon E5-2680 v4 2.4GHz",
    "CPU数量": 2,
    "内存": "32GB DDR4 2400MHz",
    "内存数量": 8,
    "M2": "512GB Samsung PM981 NVMe",
    "M2数量": 1,
    "SSD": "1TB Samsung 860 EVO SATA",
    "SSD数量": 2,
    "HDD": "4TB Seagate Enterprise SATA",
    "HDD数量": 4,
    "阵列卡": "LSI MegaRAID 9361-8i",
    "阵列卡数量": 1,
    "网卡": "Intel X540 10GbE Dual Port",
    "网卡数量": 2,
    "显卡": "NVIDIA Tesla P40 24GB",
    "显卡数量": 2,
    "系统": "Ubuntu 20.04 LTS Server"
  }
}
```

**错误响应**:

```json
{
  "code": 404,
  "message": "SN 不存在"
}
```

-----

## 2. 筛选选项模块

### 2.1 获取客户列表

**接口**: `GET /api/filters/customers`

**描述**: 获取所有出机客户列表，用于筛选器下拉选项

**请求示例**:

```
GET /api/filters/customers
```

**响应示例** (推荐格式):

```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "name": "阿里云", "value": "阿里云" },
    { "name": "腾讯云", "value": "腾讯云" },
    { "name": "华为云", "value": "华为云" },
    { "name": "百度云", "value": "百度云" },
    { "name": "字节跳动", "value": "字节跳动" }
  ]
}
```

**简化格式** (也支持):

```json
{
  "code": 200,
  "message": "success",
  "data": ["阿里云", "腾讯云", "华为云", "百度云", "字节跳动"]
}
```

-----

### 2.2 获取业务类型列表

**接口**: `GET /api/filters/businesses`

**描述**: 获取所有业务类型列表，用于筛选器下拉选项

**请求示例**:

```
GET /api/filters/businesses
```

**响应示例** (推荐格式):

```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "name": "云计算", "value": "云计算" },
    { "name": "大数据", "value": "大数据" },
    { "name": "AI训练", "value": "AI训练" },
    { "name": "CDN", "value": "CDN" },
    { "name": "存储", "value": "存储" }
  ]
}
```

**简化格式** (也支持):

```json
{
  "code": 200,
  "message": "success",
  "data": ["云计算", "大数据", "AI训练", "CDN", "存储"]
}
```

-----

### 2.3 获取所有筛选选项 (可选，推荐)

**接口**: `GET /api/filters/all`

**描述**: 一次性获取所有筛选选项，减少请求次数

**请求示例**:

```
GET /api/filters/all
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "customers": [
      { "name": "阿里云", "value": "阿里云" },
      { "name": "腾讯云", "value": "腾讯云" }
    ],
    "businesses": [
      { "name": "云计算", "value": "云计算" },
      { "name": "大数据", "value": "大数据" }
    ],
    "idcs": [
      { "name": "北京机房", "value": "LAX-DC-1" },
      { "name": "上海机房", "value": "LAX-DC-2" }
    ]
  }
}
```

-----

## 3. 认证模块 (已有)

### 3.1 登录

**接口**: `POST /api/auth/login`

**请求体**:

```json
{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

-----

### 3.2 刷新 Token

**接口**: `POST /api/auth/refresh`

**请求体**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

-----

## 4. 数据字段说明

### 服务器对象字段

|字段名  |类型    |必填|说明       |示例          |
|-----|------|--|---------|------------|
|SN   |string|是 |服务器 SN 编号|R730-001    |
|年份   |number|是 |出机年份     |2024        |
|月份   |number|是 |出机月份     |1           |
|日期   |number|是 |出机日期     |15          |
|出机客户 |string|是 |客户名称     |阿里云         |
|业务   |string|是 |业务类型     |云计算         |
|数量   |number|是 |数量       |10          |
|备注   |string|否 |备注信息     |北京机房        |
|机箱   |string|否 |机箱型号     |Dell R730 2U|
|电源   |string|否 |电源规格     |800W 冗余     |
|主板   |string|否 |主板型号     |Dell R730   |
|BMC密码|string|否 |BMC 密码   |admin123    |
|CPU  |string|否 |CPU 型号   |E5-2680 v4  |
|CPU数量|number|否 |CPU 数量   |2           |
|内存   |string|否 |内存规格     |32GB DDR4   |
|内存数量 |number|否 |内存数量     |8           |
|M2   |string|否 |M.2 规格   |512GB NVMe  |
|M2数量 |number|否 |M.2 数量   |1           |
|SSD  |string|否 |SSD 规格   |1TB SATA    |
|SSD数量|number|否 |SSD 数量   |2           |
|HDD  |string|否 |HDD 规格   |4TB SATA    |
|HDD数量|number|否 |HDD 数量   |4           |
|阵列卡  |string|否 |阵列卡型号    |LSI 9361-8i |
|阵列卡数量|number|否 |阵列卡数量    |1           |
|网卡   |string|否 |网卡型号     |X540 10GbE  |
|网卡数量 |number|否 |网卡数量     |2           |
|显卡   |string|否 |显卡型号     |Tesla P40   |
|显卡数量 |number|否 |显卡数量     |2           |
|系统   |string|否 |操作系统     |Ubuntu 20.04|

-----

## 5. 状态码说明

|状态码|说明          |
|---|------------|
|200|请求成功        |
|400|请求参数错误      |
|401|未授权/Token 过期|
|403|无权限         |
|404|资源不存在       |
|500|服务器内部错误     |

-----

## 6. 前端调用示例

### 搜索服务器

```javascript
import { searchSn } from '@/api/sn'

// 基础搜索
const results = await searchSn('R730')

// 带筛选条件的搜索
const results = await searchSn('R730', {
  customer: '阿里云',
  business: '云计算',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31')
  }
})
```

### 获取详情

```javascript
import { getSnDetail } from '@/api/sn'

const detail = await getSnDetail('R730-001')
```

### 获取筛选选项

```javascript
import { getCustomerList, getBusinessList } from '@/api/filters'

const customers = await getCustomerList()
const businesses = await getBusinessList()
```

-----

## 7. 开发建议

### 7.1 性能优化

- 搜索接口建议添加分页支持
- 筛选选项可以添加缓存机制
- 考虑添加防抖/节流

### 7.2 数据一致性

- 确保所有必填字段都有值
- 日期字段统一使用数字类型
- 数量字段统一使用数字类型

### 7.3 错误处理

- 提供清晰的错误信息
- 401 错误时前端会自动刷新 Token
- 网络错误时前端会显示友好提示

-----

## 8. 测试接口

为了方便前端开发，建议先提供以下测试数据:

### 测试 SN 列表

- R730-001 (完整数据)
- R730-002 (完整数据)
- R740-001 (完整数据)

### 测试客户

- 阿里云
- 腾讯云
- 华为云

### 测试业务

- 云计算
- 大数据
- AI训练

-----

**文档版本**: V1.0
**更新日期**: 2026-02-01
**联系方式**: 前端开发团队