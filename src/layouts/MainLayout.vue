<script setup>
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '../stores/tabs'
import { useUserStore } from '../stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const userStore = useUserStore()

watch(
  () => route.path,
  (path) => {
    tabsStore.setCurrentPath(path)
  },
  { immediate: true }
)

const activeTab = computed(() => tabsStore.currentPath)

function goTab(path) {
  router.push(path)
}

function closeTab(path) {
  const nextPath = tabsStore.closeTab(path)
  if (nextPath) {
    router.push(nextPath)
  }
}

const menuItems = [
  {
    title: '床位管理',
    children: [
      { path: '/bed-layout', title: '床位示意图' },
      { path: '/bed-manage', title: '床位管理' },
    ],
  },
  {
    title: '客户管理',
    children: [
      { path: '/customer-list', title: '客户信息' },
      { path: '/admission', title: '入住登记' },
      { path: '/outing', title: '外出登记' },
      { path: '/discharge', title: '退住登记' },
    ],
  },
  {
    title: '护理管理',
    children: [
      { path: '/care-level', title: '护理级别' },
      { path: '/care-items', title: '护理项目' },
      { path: '/client-care', title: '客户护理设置' },
      { path: '/care-record', title: '护理记录' },
    ],
  },
  {
    title: '健康管家',
    children: [
      { path: '/service-target', title: '设置服务对象' },
      { path: '/service-focus', title: '服务关注' },
    ],
  },
  {
    title: '系统管理',
    children: [
      { path: '/user-manage', title: '用户管理' },
      { path: '/basic-data', title: '基础数据维护' },
    ],
  },
]

const userMenuItems = [
  { label: '个人中心', command: 'profile' },
  { label: '修改密码', command: 'password' },
  { label: '退出登录', command: 'logout' },
]

function handleUserCommand(cmd) {
  switch (cmd) {
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
      }).catch(() => {})
      break
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中...')
      break
  }
}
</script>

<template>
  <el-container class="main-layout">
    <el-header class="main-header" height="80px">
      <div class="header-left">
        <span class="system-title">东软颐养中心</span>
      </div>
      <div class="header-center">
        <div class="logo-placeholders">
          <span v-for="i in 5" :key="i" class="logo-placeholder" />
        </div>
        <div class="tabs-wrap">
          <div
            v-for="tab in tabsStore.openTabs"
            :key="tab.path"
            class="tab-item"
            :class="{ active: activeTab === tab.path }"
            @click="goTab(tab.path)"
          >
            <span>{{ tab.name }}</span>
            <span class="tab-close" @click.stop="closeTab(tab.path)">×</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click" @command="handleUserCommand">
          <span class="user-dropdown">
            {{ userStore.username }}
            <span class="arrow-down">▼</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in userMenuItems"
                :key="item.command"
                :command="item.command"
              >
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="body-wrap">
      <el-aside width="200px" class="main-aside">
        <el-menu
          :default-active="activeTab"
          class="aside-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          router
        >
          <el-sub-menu
            v-for="group in menuItems"
            :key="group.title"
            :index="group.title"
          >
            <template #title>{{ group.title }}</template>
            <el-menu-item
              v-for="item in group.children"
              :key="item.path"
              :index="item.path"
            >
              {{ item.title }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>


<style scoped>
.main-layout {
  height: 100vh;
  flex-direction: column;
}
.main-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 16px;
}
.header-left {
  flex-shrink: 0;
}
.system-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin: 0 24px;
}
.logo-placeholders {
  display: flex;
  gap: 8px;
}
.logo-placeholder {
  width: 32px;
  height: 24px;
  background: #dcdfe6;
  border-radius: 4px;
}
.tabs-wrap {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  background: #f4f4f5;
}
.tab-item:hover {
  background: #e9e9eb;
}
.tab-item.active {
  background: #ecf5ff;
  color: #409eff;
}
.tab-close {
  font-size: 16px;
  opacity: 0.7;
  line-height: 1;
  margin-left: 2px;
}
.tab-close:hover {
  opacity: 1;
  color: #f56c6c;
}
.arrow-down {
  font-size: 12px;
  margin-left: 4px;
}
.header-right {
  flex-shrink: 0;
}
.user-dropdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
}
.body-wrap {
  flex: 1;
  overflow: hidden;
}
.main-aside {
  background: #304156;
  overflow-y: auto;
}
.aside-menu {
  border-right: none;
}
.main-content {
  background: #f0f2f5;
  padding: 16px;
  overflow: auto;
}
</style>
