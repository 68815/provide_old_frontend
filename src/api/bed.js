import { get, post } from './request'

export const bedApi = {
  getBedList: (params) => {
    return get('/bed/findBed', {
      bedNo: params.bedNo,
      bedStatus: params.bedStatus,
      roomNo: params.roomNo,
      id: params.id,
      remarks: params.remarks,
    })
  },

  getBedDetailsList: (params) => {
    return get('/beddetails/listBedDetailsVoPage', {
      pageSize: params.page || 1,
      customerName: params.customerName,
      startDate: params.startDate,
      endDate: params.endDate,
      isDeleted: params.isDeleted || 0,
    })
  },

  updateBedDetails: (data) => {
    return post('/beddetails/updateBedDetails', {
      id: data.id,
      bedId: data.bedId,
      customerId: data.customerId,
      startDate: data.startDate,
      endDate: data.endDate,
      bedDetails: data.bedDetails,
      isDeleted: data.isDeleted,
    })
  },

  exchangeBed: (data) => {
    return post('/beddetails/exchangeBed', {
      id: data.id,
      customerId: data.customerId,
      oldBedId: data.oldBedId,
      newBedId: data.newBedId,
      newRoomNo: data.newRoomNo,
      buildingNo: data.buildingNo,
      endDate: data.endDate,
    })
  },

  delBedDetails: (id) => {
    return get('/beddetails/delBedDetails', { id })
  },
}

export const roomApi = {
  getRoomList: () => {
    return get('/room/listRoom')
  },

  getCwsyBedVo: (floor) => {
    return get('/room/findCwsyBedVo', { floor })
  },
}
