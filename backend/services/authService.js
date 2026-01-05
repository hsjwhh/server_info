/**
 * services/authService.js
 *
 * Service 层（业务逻辑层）：
 *   - 不处理 HTTP 请求（那是 controller 的职责）
 *   - 不处理路由（那是 router 的职责）
 *   - 不处理权限验证（那是 middleware 的职责）
 *
 * 本文件只负责：
 *   ✔ 用户验证（示例用 mock 数据，可替换为 MySQL）
 *   ✔ 生成 accessToken（短期有效）
 *   ✔ 生成 refreshToken（长期有效）
 *   ✔ 存储 refreshToken（内存示例，可替换为数据库）
 *   ✔ 刷新 accessToken
 *   ✔ 登出（删除 refreshToken）
 */

const jwt = require('jsonwebtoken')

/**
 * ================================
 * 1. 模拟用户数据库（示例）
 * ================================
 *
 * 你未来可以替换为：
 *   - MySQL 查询
 *   - bcrypt 密码哈希验证
 *   - 用户表（users）
 *
 * 这里先用 mock 数据让整个系统跑通
 */
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456', // 真实项目不要明文存储密码
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    role: 'user'
  }
]

/**
 * 根据用户名查找用户
 * @param {string} username
 * @returns {object|null}
 */
function findUserByUsername(username) {
  return mockUsers.find((u) => u.username === username)
}

/**
 * ================================
 * 2. Token 生成函数
 * ================================
 */

/**
 * 生成 Access Token（短期有效）
 * @param {object} payload - 写入 token 的用户信息
 * @returns {string} accessToken
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m' // 15 分钟有效期
  })
}

/**
 * 生成 Refresh Token（长期有效）
 * @param {object} payload
 * @returns {string} refreshToken
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // 7 天有效期
  })
}

/**
 * ================================
 * 3. refreshToken 存储（示例）
 * ================================
 *
 * 这里使用内存数组存储 refreshToken：
 *   - 简单易用
 *   - 适合开发阶段
 *
 * 生产环境建议改为：
 *   - MySQL 表（refresh_tokens）
 *   - Redis（更快）
 *   - 或者 JWT 黑名单机制
 */
let refreshTokensStore = []

/**
 * ================================
 * 4. 登录逻辑
 * ================================
 *
 * @param {string} username
 * @param {string} password
 * @returns {object} { user, accessToken, refreshToken }
 */
async function login(username, password) {
  // 1. 查找用户
  const user = findUserByUsername(username)

  if (!user) {
    const error = new Error('用户不存在')
    error.statusCode = 401
    throw error
  }

  // 2. 校验密码（示例为明文比对）
  if (user.password !== password) {
    const error = new Error('用户名或密码错误')
    error.statusCode = 401
    throw error
  }

  // 3. 构造写入 token 的 payload（不要包含密码）
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  }

  // 4. 生成 token
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // 5. 存储 refreshToken
  refreshTokensStore.push(refreshToken)

  // 6. 返回给 controller
  return {
    user: payload,
    accessToken,
    refreshToken
  }
}

/**
 * ================================
 * 5. 刷新 accessToken
 * ================================
 *
 * @param {string} refreshToken
 * @returns {object} { accessToken }
 */
async function refreshAccessToken(refreshToken) {
  // 1. 是否提供 refreshToken
  if (!refreshToken) {
    const error = new Error('缺少 refresh token')
    error.statusCode = 401
    throw error
  }

  // 2. refreshToken 是否存在于服务器记录中
  if (!refreshTokensStore.includes(refreshToken)) {
    const error = new Error('refresh token 无效或已登出')
    error.statusCode = 403
    throw error
  }

  // 3. 验证 refreshToken 是否有效
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      (err, decodedUser) => {
        if (err) {
          const error = new Error('refresh token 无效或已过期')
          error.statusCode = 403
          return reject(error)
        }

        // decodedUser = { id, username, role, iat, exp }
        const payload = {
          id: decodedUser.id,
          username: decodedUser.username,
          role: decodedUser.role
        }

        // 生成新的 accessToken
        const newAccessToken = generateAccessToken(payload)

        resolve({
          accessToken: newAccessToken
        })
      }
    )
  })
}

/**
 * ================================
 * 6. 登出逻辑
 * ================================
 *
 * @param {string} refreshToken
 * @returns {object}
 */
async function logout(refreshToken) {
  // 从存储中删除 refreshToken
  refreshTokensStore = refreshTokensStore.filter((t) => t !== refreshToken)

  return {
    success: true
  }
}

module.exports = {
  login,
  refreshAccessToken,
  logout
}
