// src/stores/auth.js
/**
 * Auth Store（Pinia）
 *
 * 安全存储策略：
 *   - accessToken 仅存于内存（变量），不写 localStorage
 *   - 页面刷新后内存清空，通过 silentRefresh() 利用 HttpOnly Cookie 中的 refreshToken 静默换取新的 accessToken
 *   - refreshToken 由后端以 HttpOnly Cookie 形式下发，JS 无法读写，彻底防 XSS 窃取
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
    // ============================================================
    // State
    // ============================================================
    const _accessToken = ref(null)
    const _user = ref(null)   // 存储用户信息（内存，页面刷新后从响应中重建）

    // ============================================================
    // Getters
    // ============================================================
    const accessToken = computed(() => _accessToken.value)
    const isLoggedIn = computed(() => !!_accessToken.value)
    const user = computed(() => _user.value)

    // ============================================================
    // Actions
    // ============================================================

    /**
   * 设置 accessToken 和用户信息
   */
    function setToken(token, userInfo = null) {
        _accessToken.value = token
        if (userInfo) _user.value = userInfo
    }

    /**
     * 清除 accessToken和用户信息（登出时调用）
     */
    function clearToken() {
        _accessToken.value = null
        _user.value = null
    }

    /**
     * 静默刷新 —— 页面刷新后内存中无 accessToken，
     * 利用浏览器自动携带的 HttpOnly Cookie 中的 refreshToken 换取新的 accessToken。
     *
     * @returns {boolean} 是否刷新成功
     */
    async function silentRefresh() {
        try {
            const res = await axios.post(
                `${API_BASE}/auth/refresh`,
                {},                          // body 为空，refreshToken 通过 Cookie 自动携带
                { withCredentials: true }    // 必须携带 Cookie
            )
            const newToken = res.data?.accessToken || res.data?.data?.accessToken
            if (newToken) {
                setToken(newToken)
                return true
            }
            return false
        } catch {
            clearToken()
            return false
        }
    }

    return {
        accessToken,
        isLoggedIn,
        user,
        setToken,
        clearToken,
        silentRefresh
    }
})
