import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  customerApi, 
  careLevelApi, 
  careItemApi, 
  healthButlerApi,
  bedApi 
} from '../api'

export const useDataStore = defineStore('data', () => {
  const customers = ref([])
  const careLevels = ref([])
  const careItems = ref([])
  const butlers = ref([])
  const beds = ref([])

  const loading = ref({
    customers: false,
    careLevels: false,
    careItems: false,
    butlers: false,
    beds: false
  })

  const lastFetchTime = ref({
    customers: 0,
    careLevels: 0,
    careItems: 0,
    butlers: 0,
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
      const res = await customerApi.getCustomerList({ pageSize: 100 })
      customers.value = res.data.list
      lastFetchTime.value.customers = Date.now()
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
      const res = await careLevelApi.getCareLevelList()
      careLevels.value = res.data.list
      lastFetchTime.value.careLevels = Date.now()
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
      const res = await careItemApi.getCareItemList()
      careItems.value = res.data.list
      lastFetchTime.value.careItems = Date.now()
      return careItems.value
    } finally {
      loading.value.careItems = false
    }
  }

  async function fetchButlers(force = false) {
    if (!force && butlers.value.length > 0 && isCacheValid('butlers')) {
      return butlers.value
    }
    loading.value.butlers = true
    try {
      const res = await healthButlerApi.getButlerList()
      butlers.value = res.data.list
      lastFetchTime.value.butlers = Date.now()
      return butlers.value
    } finally {
      loading.value.butlers = false
    }
  }

  async function fetchBeds(force = false) {
    if (!force && beds.value.length > 0 && isCacheValid('beds')) {
      return beds.value
    }
    loading.value.beds = true
    try {
      const res = await bedApi.getBedList()
      beds.value = res.data.list
      lastFetchTime.value.beds = Date.now()
      return beds.value
    } finally {
      loading.value.beds = false
    }
  }

  function getCustomerById(id) {
    return customers.value.find(c => c.id === id)
  }

  function getButlerById(id) {
    return butlers.value.find(b => b.id === id)
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
    butlers,
    beds,
    loading,
    fetchCustomers,
    fetchCareLevels,
    fetchCareItems,
    fetchButlers,
    fetchBeds,
    getCustomerById,
    getButlerById,
    getCareLevelById,
    getCareItemById,
    clearCache
  }
})
