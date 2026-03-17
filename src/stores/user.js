import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.nickname || userInfo.value?.username || '未登录')
  const roleId = computed(() => userInfo.value?.roleId || 0)
  const isAdmin = computed(() => roleId.value === 1)
  const isButler = computed(() => roleId.value === 2)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function login(data) {
    setToken(data.token || 'mock-token')
    setUserInfo(data)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  function updateUserInfo(info) {
    userInfo.value = { ...userInfo.value, ...info }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    username,
    roleId,
    isAdmin,
    isButler,
    setToken,
    setUserInfo,
    login,
    logout,
    updateUserInfo
  }
})
