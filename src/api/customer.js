import { get, post } from './request'

export const customerApi = {
  getCustomerList: (params) => {
    return get('/customer/listKhxxPage', {
      pageSize: params.page || 1,
      customerName: params.keyword,
      userId: params.userId,
      manType: params.manType,
    })
  },

  addCustomer: (data) => {
    return post('/customer/rzdj', {
      customerName: data.name,
      customerSex: data.gender === '男' ? 0 : 1,
      customerAge: data.age,
      idcard: data.idCard,
      contactTel: data.phone,
      bedId: data.bedId,
      levelId: data.levelId,
      checkinDate: data.checkInDate,
      familyMember: data.emergencyContact,
      birthday: data.birthday,
      bloodType: data.bloodType,
      height: data.height,
      weight: data.weight,
      psychosomaticState: data.healthCondition,
      attention: data.allergies,
      buildingNo: data.buildingNo,
      roomNo: data.roomNo,
      userId: data.userId,
      expirationDate: data.expirationDate,
    })
  },

  editCustomer: (data) => {
    return post('/customer/editKhxx', {
      id: data.id,
      customerName: data.name,
      customerSex: data.gender === '男' ? 0 : 1,
      customerAge: data.age,
      idcard: data.idCard,
      contactTel: data.phone,
      bedId: data.bedId,
      levelId: data.levelId,
      familyMember: data.emergencyContact,
      birthday: data.birthday,
      bloodType: data.bloodType,
      height: data.height,
      weight: data.weight,
      psychosomaticState: data.healthCondition,
      attention: data.allergies,
      buildingNo: data.buildingNo,
      roomNo: data.roomNo,
      userId: data.userId,
      expirationDate: data.expirationDate,
    })
  },

  removeCustomer: (id, bedId) => {
    return get('/customer/remove', { id, bedId })
  },
}

export const outwardApi = {
  getOutwardList: (params) => {
    return post('/outward/queryOutwardVo', {
      pageSize: params.page || 1,
      userId: params.userId,
    })
  },

  addOutward: (data) => {
    return post('/outward/queryOutwardVo', {
      customer_id: data.customerId,
      outgoingreason: data.reason,
      outgoingtime: data.startTime,
      expectedreturntime: data.endTime,
      escorted: data.escorted,
      relation: data.relation,
    })
  },

  examineOutward: (id, auditstatus) => {
    return post('/outward/examineOutward', { id, auditstatus })
  },

  delOutward: (id, isDeleted = 1) => {
    return post('/outward/delOutward', { id, is_deleted: isDeleted })
  },
}

export const backdownApi = {
  getBackdownList: (params) => {
    return get('/backdown/listBackdown', {
      pageSize: params.page || 1,
      userId: params.userId,
    })
  },

  addBackdown: (data) => {
    return post('/backdown/addBackdown', {
      customer_id: data.customerId,
      retreattime: data.retreatTime,
      retreattype: data.retreatType,
      auditstatus: data.auditStatus || 0,
    })
  },

  examineBackdown: (id, auditstatus) => {
    return post('/backdown/examineBackdown', { id, auditstatus })
  },

  delBackdown: (id, isDeleted = 1) => {
    return post('/backdown/delBackdown', { id, is_deleted: isDeleted })
  },
}
