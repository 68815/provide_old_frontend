import { get, post, postJson } from './request'

export const nurseLevelApi = {
  getNurseLevelList: (params) => {
    return get('/nurselevel/listNurseLevel', {
      id: params?.id,
      levelName: params?.levelName,
      levelStatus: params?.levelStatus,
      isDeleted: params?.isDeleted || 0,
    })
  },

  addNurseLevel: (data) => {
    return post('/nurselevel/addNurseLevel', {
      levelName: data.name,
      levelStatus: data.status || 1,
      isDeleted: 0,
    })
  },

  updateNurseLevel: (data) => {
    return post('/nurselevel/updateNurseLevel', {
      id: data.id,
      levelName: data.name,
      levelStatus: data.status,
      isDeleted: data.isDeleted || 0,
    })
  },

  removeNurseLevel: (id) => {
    return get('/nurselevel/removeNurseLevel', { id })
  },

  getNurseItemsByLevel: (levelId) => {
    return get('/nurselevel/listNurseItemByLevel', { levelId })
  },

  addItemToLevel: (levelId, itemId) => {
    return post('/nurselevel/addItemToLevel', { levelId, itemId })
  },

  removeNurseLevelItem: (levelId, itemId) => {
    return get('/nurselevel/removeNurseLevelItem', { levelId, itemId })
  },
}

export const nurseItemApi = {
  getNurseItemList: (params) => {
    return get('/nursecontent/findNurseItemPage', {
      pageSize: params?.page || 1,
      itemName: params?.itemName,
      status: params?.status,
    })
  },

  addNurseItem: (data) => {
    return post('/nursecontent/addNurseItem', {
      nursingName: data.name,
      message: data.description,
      serialNumber: data.serialNumber,
      servicePrice: data.price,
      executionCycle: data.executionCycle,
      executionTimes: data.executionTimes,
      status: data.status || 1,
      isDeleted: 0,
    })
  },

  updateNurseItem: (data) => {
    return post('/nursecontent/updateNurseItem', {
      id: data.id,
      nursingName: data.name,
      message: data.description,
      serialNumber: data.serialNumber,
      servicePrice: data.price,
      executionCycle: data.executionCycle,
      executionTimes: data.executionTimes,
      status: data.status,
      isDeleted: data.isDeleted || 0,
    })
  },

  delNurseItem: (id) => {
    return get('/nursecontent/delNurseItem', { id })
  },
}

export const nurseRecordApi = {
  getNurseRecordList: (params) => {
    return get('/nurserecord/listNurseRecordsVo', {
      pageSize: params?.page || 1,
      customerId: params?.customerId,
    })
  },

  addNurseRecord: (data) => {
    return post('/nurserecord/addNurseRecord', {
      customerId: data.customerId,
      itemId: data.itemId,
      nursingContent: data.content,
      nursingCount: data.count || 1,
      nursingTime: data.time,
      userId: data.userId,
      isDeleted: 0,
    })
  },

  removeNurseRecord: (id) => {
    return get('/nurserecord/removeCustomerRecord', { id })
  },
}

export const customerNurseItemApi = {
  getCustomerItemList: (params) => {
    return get('/customernurseitem/listCustomerItem', {
      pageSize: params?.page || 1,
      customerId: params?.customerId,
    })
  },

  addItemToCustomer: (items) => {
    return postJson('/customernurseitem/addItemToCustomer', items)
  },

  enewNurseItem: (data) => {
    return post('/customernurseitem/enewNurseItem', {
      id: data.id,
      custormerId: data.customerId,
      itemId: data.itemId,
      levelId: data.levelId,
      buyTime: data.buyTime,
      maturityTime: data.maturityTime,
      nurseNumber: data.nurseNumber,
      isDeleted: 0,
    })
  },

  removeCustomerItem: (id) => {
    return get('/customernurseitem/removeCustomerItem', { id })
  },

  removeCustomerLevelAndItem: (customerId, levelId) => {
    return get('/customernurseitem/removeCustomerLevelAndItem', { customerId, levelId })
  },

  isIncludesItemCustomer: (customerId, itemId) => {
    return get('/customernurseitem/isIncludesItemCustomer', { customerId, itemId })
  },
}
