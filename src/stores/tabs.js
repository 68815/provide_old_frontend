import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  const tabMap = {
    '/bed-layout': '床位示意图',
    '/bed-manage': '床位管理',
    '/customer-list': '客户信息',
    '/admission': '入住登记',
    '/care-record': '护理记录',
    '/outing': '外出登记',
    '/discharge': '退住登记',
    '/care-level': '护理级别',
    '/care-items': '护理项目',
    '/client-care': '客户护理设置',
    '/service-target': '设置服务对象',
    '/service-focus': '服务关注',
    '/user-manage': '用户管理',
    '/basic-data': '基础数据维护',
  }

  const openTabs = ref([
    { path: '/bed-layout', name: '床位示意图' },
    { path: '/bed-manage', name: '床位管理' },
    { path: '/admission', name: '入住登记' },
    { path: '/care-record', name: '护理记录' },
    { path: '/outing', name: '外出登记' },
  ])

  const currentPath = ref('/bed-layout')

  const currentTab = computed(() => {
    return openTabs.value.find(tab => tab.path === currentPath.value) || null
  })

  function addTab(path) {
    const name = tabMap[path]
    if (name && !openTabs.value.some(tab => tab.path === path)) {
      openTabs.value.push({ path, name })
    }
    currentPath.value = path
  }

  function closeTab(path) {
    const idx = openTabs.value.findIndex(tab => tab.path === path)
    if (idx === -1) return
    
    openTabs.value.splice(idx, 1)
    
    if (currentPath.value === path && openTabs.value.length) {
      const next = openTabs.value[Math.min(idx, openTabs.value.length - 1)]
      currentPath.value = next.path
      return next.path
    }
    return null
  }

  function closeOtherTabs(path) {
    openTabs.value = openTabs.value.filter(tab => tab.path === path)
    currentPath.value = path
  }

  function closeAllTabs() {
    openTabs.value = []
    currentPath.value = ''
  }

  function closeRightTabs(path) {
    const idx = openTabs.value.findIndex(tab => tab.path === path)
    if (idx !== -1) {
      openTabs.value = openTabs.value.slice(0, idx + 1)
    }
  }

  function setCurrentPath(path) {
    currentPath.value = path
    addTab(path)
  }

  function getTabName(path) {
    return tabMap[path] || ''
  }

  return {
    tabMap,
    openTabs,
    currentPath,
    currentTab,
    addTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    closeRightTabs,
    setCurrentPath,
    getTabName
  }
})
