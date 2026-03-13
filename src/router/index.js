import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import BedLayout from '../views/BedLayout.vue'
import BedManage from '../views/BedManage.vue'
import CustomerList from '../views/CustomerList.vue'
import Admission from '../views/Admission.vue'
import Outing from '../views/Outing.vue'
import Discharge from '../views/Discharge.vue'
import CareLevel from '../views/CareLevel.vue'
import CareItems from '../views/CareItems.vue'
import CareRecord from '../views/CareRecord.vue'
import ClientCare from '../views/ClientCare.vue'
import ServiceTarget from '../views/ServiceTarget.vue'
import ServiceFocus from '../views/ServiceFocus.vue'
import UserManage from '../views/UserManage.vue'
import Placeholder from '../views/Placeholder.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/bed-layout',
      children: [
        {
          path: 'bed-layout',
          name: 'bed-layout',
          component: BedLayout,
          meta: { title: '床位示意图' },
        },
        {
          path: 'bed-manage',
          name: 'bed-manage',
          component: BedManage,
          meta: { title: '床位管理' },
        },
        {
          path: 'customer-list',
          name: 'customer-list',
          component: CustomerList,
          meta: { title: '客户信息' },
        },
        {
          path: 'admission',
          name: 'admission',
          component: Admission,
          meta: { title: '入住登记' },
        },
        {
          path: 'outing',
          name: 'outing',
          component: Outing,
          meta: { title: '外出登记' },
        },
        {
          path: 'discharge',
          name: 'discharge',
          component: Discharge,
          meta: { title: '退住登记' },
        },
        {
          path: 'care-record',
          name: 'care-record',
          component: CareRecord,
          meta: { title: '护理记录' },
        },
        {
          path: 'care-level',
          name: 'care-level',
          component: CareLevel,
          meta: { title: '护理级别' },
        },
        {
          path: 'care-items',
          name: 'care-items',
          component: CareItems,
          meta: { title: '护理项目' },
        },
        {
          path: 'client-care',
          name: 'client-care',
          component: ClientCare,
          meta: { title: '客户护理设置' },
        },
        {
          path: 'service-target',
          name: 'service-target',
          component: ServiceTarget,
          meta: { title: '设置服务对象' },
        },
        {
          path: 'service-focus',
          name: 'service-focus',
          component: ServiceFocus,
          meta: { title: '服务关注' },
        },
        {
          path: 'user-manage',
          name: 'user-manage',
          component: UserManage,
          meta: { title: '用户管理' },
        },
        {
          path: 'basic-data',
          name: 'basic-data',
          component: Placeholder,
          meta: { title: '基础数据维护' },
        },
      ],
    },
  ],
})

export default router
