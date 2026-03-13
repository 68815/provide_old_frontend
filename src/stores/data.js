import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerApi, nurseLevelApi, nurseItemApi, userApi, bedApi } from '../api'

export const useDataStore = defineStore('data', () => {
  const customers = ref([])
  const careLevels = ref([])
  const careItems = ref([])
  const users = ref([])
  const beds = ref([])

  const loading = ref({
    customers: false,
    careLevels: false,
    careItems: false,
    users: false,
    beds: false
  })

  const lastFetchTime = ref({
    customers: 0,
    careLevels: 0,
    careItems: 0,
    users: 0,
    beds: 0
  })

  const CACHE_DURATION = 5 * 60 * 1000

  function isCacheValid(key) {
    return Date.now() - lastFetchTime.value[key] < CACHE_DURATION
  }

  async function fetchCustomers(force = false) {
    if (!force && customers.value.length > 0 && isCacheValid('customers')) {
      return customers.value
    }
    loading.value.customers = true
    try {
      const res = await customerApi.getCustomerList({ page: 1 })
      if (res.flag && res.data) {
        customers.value = res.data.records || res.data
        lastFetchTime.value.customers = Date.now()
      }
      return customers.value
    } finally {
      loading.value.customers = false
    }
  }

  async function fetchCareLevels(force = false) {
    if (!force && careLevels.value.length > 0 && isCacheValid('careLevels')) {
      return careLevels.value
    }
    loading.value.careLevels = true
    try {
      const res = await nurseLevelApi.getNurseLevelList({})
      if (res.flag && res.data) {
        careLevels.value = res.data
        lastFetchTime.value.careLevels = Date.now()
      }
      return careLevels.value
    } finally {
      loading.value.careLevels = false
    }
  }

  async function fetchCareItems(force = false) {
    if (!force && careItems.value.length > 0 && isCacheValid('careItems')) {
      return careItems.value
    }
    loading.value.careItems = true
    try {
      const res = await nurseItemApi.getNurseItemList({})
      if (res.flag && res.data) {
        careItems.value = res.data.records || res.data
        lastFetchTime.value.careItems = Date.now()
      }
      return careItems.value
    } finally {
      loading.value.careItems = false
    }
  }

  async function fetchUsers(force = false) {
    if (!force && users.value.length > 0 && isCacheValid('users')) {
      return users.value
    }
    loading.value.users = true
    try {
      const res = await userApi.getUserList({})
      if (res.flag && res.data) {
        users.value = res.data.records || res.data
        lastFetchTime.value.users = Date.now()
      }
      return users.value
    } finally {
      loading.value.users = false
    }
  }

  async function fetchBeds(force = false) {
    if (!force && beds.value.length > 0 && isCacheValid('beds')) {
      return beds.value
    }
    loading.value.beds = true
    try {
      const res = await bedApi.getBedList({})
      if (res.flag && res.data) {
        beds.value = res.data
        lastFetchTime.value.beds = Date.now()
      }
      return beds.value
    } finally {
      loading.value.beds = false
    }
  }

  function getCustomerById(id) {
    return customers.value.find(c => c.id === id)
  }

  function getCareLevelById(id) {
    return careLevels.value.find(l => l.id === id)
  }

  function getCareItemById(id) {
    return careItems.value.find(i => i.id === id)
  }

  function clearCache(key = null) {
    if (key) {
      lastFetchTime.value[key] = 0
    } else {
      Object.keys(lastFetchTime.value).forEach(k => {
        lastFetchTime.value[k] = 0
      })
    }
  }

  return {
    customers,
    careLevels,
    careItems,
    users,
    beds,
    loading,
    fetchCustomers,
    fetchCareLevels,
    fetchCareItems,
    fetchUsers,
    fetchBeds,
    getCustomerById,
    getCareLevelById,
    getCareItemById,
    clearCache
  }
})
