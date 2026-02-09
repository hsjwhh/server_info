// mock/hardwareData.js
/**
 * 硬件配置方案 - Mock 数据示例
 * 
 * 这些是后端 API 应该返回的数据格式示例
 * 可用于前端开发测试,或作为后端开发的参考
 */

// ==================== CPU 数据示例 ====================
export const mockCpuList = [
  {
    cpu_short_name: "Intel Xeon E5-2680 v4",
    full_name: "Intel Xeon E5-2680 v4 @ 2.40GHz",
    manufacturer: "Intel",
    series: "Xeon E5 v4",
    socket: "LGA2011-3",
    cores: 14,
    threads: 28,
    base_freq: 2.4,      // GHz
    turbo_freq: 3.3,     // GHz
    tdp: 120,            // Watts
    cache_l3: 35,        // MB
    memory_type: "DDR4",
    memory_channels: 4,
    max_memory_speed: 2400, // MHz
    max_memory: 768,     // GB
    pcie_lanes: 40,
    release_date: "2016-Q1"
  },
  {
    cpu_short_name: "Intel Xeon Gold 6148",
    full_name: "Intel Xeon Gold 6148 @ 2.40GHz",
    manufacturer: "Intel",
    series: "Xeon Scalable",
    socket: "LGA3647",
    cores: 20,
    threads: 40,
    base_freq: 2.4,
    turbo_freq: 3.7,
    tdp: 150,
    cache_l3: 27.5,
    memory_type: "DDR4",
    memory_channels: 6,
    max_memory_speed: 2666,
    max_memory: 768,
    pcie_lanes: 48,
    release_date: "2017-Q3"
  },
  {
    cpu_short_name: "AMD EPYC 7502",
    full_name: "AMD EPYC 7502 32-Core Processor",
    manufacturer: "AMD",
    series: "EPYC 7002",
    socket: "SP3",
    cores: 32,
    threads: 64,
    base_freq: 2.5,
    turbo_freq: 3.35,
    tdp: 180,
    cache_l3: 128,
    memory_type: "DDR4",
    memory_channels: 8,
    max_memory_speed: 3200,
    max_memory: 4096,
    pcie_lanes: 128,
    release_date: "2019-Q3"
  },
  {
    cpu_short_name: "Intel Xeon Platinum 8380",
    full_name: "Intel Xeon Platinum 8380 @ 2.30GHz",
    manufacturer: "Intel",
    series: "Xeon Scalable 3rd Gen",
    socket: "LGA4189",
    cores: 40,
    threads: 80,
    base_freq: 2.3,
    turbo_freq: 3.4,
    tdp: 270,
    cache_l3: 60,
    memory_type: "DDR4",
    memory_channels: 8,
    max_memory_speed: 3200,
    max_memory: 6144,
    pcie_lanes: 64,
    release_date: "2021-Q2"
  }
]

// ==================== 主板数据示例 ====================
export const mockMotherboardList = [
  {
    model: "Supermicro X10DRi",
    manufacturer: "Supermicro",
    chipset: "Intel C612",
    form_factor: "ATX",
    socket: "LGA2011-3",
    cpu_slots: 2,
    cpu_support: ["Xeon E5-2600 v3", "Xeon E5-2600 v4"],
    memory_slots: 16,
    memory_type: "DDR4",
    memory_speed: [2133, 2400],
    max_memory: 512,     // GB per CPU
    pcie_slots: "3 × PCIe 3.0 x16, 2 × PCIe 3.0 x8",
    sata_ports: 10,
    m2_slots: 0,
    network: "2 × 1GbE",
    power_connector: "24-pin ATX, 2 × 8-pin EPS",
    power: 50            // Estimated power consumption in Watts
  },
  {
    model: "Supermicro X11DPi-N",
    manufacturer: "Supermicro",
    chipset: "Intel C621",
    form_factor: "ATX",
    socket: "LGA3647",
    cpu_slots: 2,
    cpu_support: ["Xeon Scalable 1st Gen", "Xeon Scalable 2nd Gen"],
    memory_slots: 16,
    memory_type: "DDR4",
    memory_speed: [2133, 2400, 2666, 2933],
    max_memory: 768,
    pcie_slots: "4 × PCIe 3.0 x16, 1 × PCIe 3.0 x8",
    sata_ports: 8,
    m2_slots: 2,
    network: "2 × 10GbE",
    power_connector: "24-pin ATX, 2 × 8-pin EPS",
    power: 60
  },
  {
    model: "ASUS RS720-E9-RS24-E",
    manufacturer: "ASUS",
    chipset: "Intel C621",
    form_factor: "Proprietary",
    socket: "LGA3647",
    cpu_slots: 2,
    cpu_support: ["Xeon Scalable 1st Gen", "Xeon Scalable 2nd Gen"],
    memory_slots: 24,
    memory_type: "DDR4",
    memory_speed: [2133, 2400, 2666, 2933],
    max_memory: 1536,
    pcie_slots: "6 × PCIe 3.0 x16",
    sata_ports: 8,
    m2_slots: 2,
    network: "2 × 10GbE",
    power_connector: "Redundant PSU",
    power: 70
  },
  {
    model: "Gigabyte MZ32-AR0",
    manufacturer: "Gigabyte",
    chipset: "AMD Embedded",
    form_factor: "ATX",
    socket: "SP3",
    cpu_slots: 1,
    cpu_support: ["EPYC 7001", "EPYC 7002"],
    memory_slots: 8,
    memory_type: "DDR4",
    memory_speed: [2133, 2400, 2666, 2933, 3200],
    max_memory: 2048,
    pcie_slots: "3 × PCIe 4.0 x16, 1 × PCIe 4.0 x8",
    sata_ports: 8,
    m2_slots: 2,
    network: "2 × 1GbE",
    power_connector: "24-pin ATX, 8-pin EPS",
    power: 55
  }
]

// ==================== CPU 与主板兼容性映射 ====================
export const cpuMotherboardCompatibility = {
  "Intel Xeon E5-2680 v4": [
    "Supermicro X10DRi",
    // 其他兼容的 LGA2011-3 主板
  ],
  "Intel Xeon Gold 6148": [
    "Supermicro X11DPi-N",
    "ASUS RS720-E9-RS24-E",
    // 其他兼容的 LGA3647 主板
  ],
  "AMD EPYC 7502": [
    "Gigabyte MZ32-AR0",
    // 其他兼容的 SP3 主板
  ],
  "Intel Xeon Platinum 8380": [
    // LGA4189 主板
  ]
}

// ==================== GPU 功耗数据 ====================
export const gpuPowerData = {
  "GTX 1650": { tdp: 75, brand: "NVIDIA", memory: "4GB GDDR6" },
  "RTX 3060": { tdp: 170, brand: "NVIDIA", memory: "12GB GDDR6" },
  "RTX 4090": { tdp: 450, brand: "NVIDIA", memory: "24GB GDDR6X" },
  "A100": { tdp: 400, brand: "NVIDIA", memory: "40GB/80GB HBM2e" },
  "H100": { tdp: 700, brand: "NVIDIA", memory: "80GB HBM3" },
  "AMD MI250X": { tdp: 560, brand: "AMD", memory: "128GB HBM2e" }
}

// ==================== 后端 API 响应格式示例 ====================

/**
 * GET /api/hardware/cpu/search?keyword=xeon
 * 
 * Response:
 */
export const apiResponseCpuSearch = {
  success: true,
  data: [
    {
      cpu_short_name: "Intel Xeon E5-2680 v4",
      cores: 14,
      threads: 28,
      base_freq: 2.4,
      turbo_freq: 3.3,
      tdp: 120,
      memory_type: "DDR4",
      max_memory_speed: 2400
    },
    // ... 更多结果
  ],
  count: 15
}

/**
 * GET /api/hardware/motherboard/compatible?cpu=Intel Xeon E5-2680 v4
 * 
 * Response:
 */
export const apiResponseMotherboardCompatible = {
  success: true,
  data: [
    {
      model: "Supermicro X10DRi",
      chipset: "Intel C612",
      socket: "LGA2011-3",
      cpu_support: ["Xeon E5-2600 v3", "Xeon E5-2600 v4"],
      memory_slots: 16,
      memory_type: "DDR4",
      max_memory: 512,
      pcie_slots: "3 × PCIe 3.0 x16, 2 × PCIe 3.0 x8",
      power: 50
    },
    // ... 更多兼容主板
  ],
  count: 8
}

/**
 * POST /api/config-plan
 * 
 * Request Body:
 */
export const apiRequestSaveConfig = {
  name: "双路E5服务器配置方案",
  description: "高性能计算服务器",
  cpu: {
    model: "Intel Xeon E5-2680 v4",
    count: 2
  },
  motherboard: "Supermicro X10DRi",
  memory: {
    type: "DDR4",
    capacity: "32GB",
    count: 8,
    total: 256
  },
  storage: {
    m2: { capacity: "512GB", count: 2 },
    ssd: { capacity: "960GB", count: 4 },
    hdd: { capacity: "4TB", count: 8 }
  },
  expansion: {
    nic: 2,
    gpu: { model: "RTX 3060", count: 1 },
    raid: "高级 RAID"
  },
  power: {
    total: 650,
    recommended: 850
  }
}

/**
 * Response:
 */
export const apiResponseSaveConfig = {
  success: true,
  data: {
    id: "cfg_1234567890",
    name: "双路E5服务器配置方案",
    created_at: "2024-02-08T10:30:00Z",
    updated_at: "2024-02-08T10:30:00Z"
  },
  message: "配置方案保存成功"
}

// ==================== 数据库表结构参考 ====================

/**
 * CPU 表 (cpu_specs)
 * 
 * CREATE TABLE cpu_specs (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   cpu_short_name VARCHAR(255) UNIQUE NOT NULL,
 *   full_name VARCHAR(255),
 *   manufacturer VARCHAR(50),
 *   series VARCHAR(100),
 *   socket VARCHAR(50),
 *   cores INT,
 *   threads INT,
 *   base_freq DECIMAL(4,2),
 *   turbo_freq DECIMAL(4,2),
 *   tdp INT,
 *   cache_l3 DECIMAL(5,1),
 *   memory_type VARCHAR(20),
 *   memory_channels INT,
 *   max_memory_speed INT,
 *   max_memory INT,
 *   pcie_lanes INT,
 *   release_date VARCHAR(20),
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_short_name (cpu_short_name),
 *   INDEX idx_socket (socket),
 *   INDEX idx_manufacturer (manufacturer)
 * );
 */

/**
 * 主板表 (motherboard_specs)
 * 
 * CREATE TABLE motherboard_specs (
 *   id BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   model VARCHAR(255) UNIQUE NOT NULL,
 *   manufacturer VARCHAR(50),
 *   chipset VARCHAR(50),
 *   form_factor VARCHAR(50),
 *   socket VARCHAR(50),
 *   cpu_slots INT,
 *   cpu_support TEXT,  -- JSON array of supported CPU series
 *   memory_slots INT,
 *   memory_type VARCHAR(20),
 *   memory_speed TEXT,  -- JSON array of supported speeds
 *   max_memory INT,
 *   pcie_slots TEXT,
 *   sata_ports INT,
 *   m2_slots INT,
 *   network VARCHAR(100),
 *   power_connector VARCHAR(100),
 *   power INT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_model (model),
 *   INDEX idx_socket (socket),
 *   INDEX idx_manufacturer (manufacturer)
 * );
 */

/**
 * 配置方案表 (config_plans)
 * 
 * CREATE TABLE config_plans (
 *   id VARCHAR(50) PRIMARY KEY,
 *   user_id BIGINT,
 *   name VARCHAR(255) NOT NULL,
 *   description TEXT,
 *   config_data JSON NOT NULL,  -- 完整的配置 JSON
 *   total_power INT,
 *   recommended_psu INT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_user_id (user_id),
 *   INDEX idx_created_at (created_at)
 * );
 */
