export const mockRequest = (data, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data,
        message: 'success'
      })
    }, delay)
  })
}

export const bedApi = {
  getBedList: (params) => {
    const beds = []
    for (let floor = 1; floor <= 3; floor++) {
      for (let room = 1; room <= 10; room++) {
        const roomNum = `${floor}0${room.toString().padStart(2, '0')}`
        beds.push({
          id: `${floor}-${room}-1`,
          room: roomNum,
          bedNo: `${roomNum}-1`,
          floor: `${floor}层`,
          status: ['空闲', '占用', '外出'][Math.floor(Math.random() * 3)],
          customer: Math.random() > 0.5 ? {
            id: Math.floor(Math.random() * 1000),
            name: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
            age: 70 + Math.floor(Math.random() * 20),
            gender: ['男', '女'][Math.floor(Math.random() * 2)],
            careLevel: ['一级', '二级', '三级'][Math.floor(Math.random() * 3)],
            checkInDate: '2024-01-15'
          } : null
        })
        beds.push({
          id: `${floor}-${room}-2`,
          room: roomNum,
          bedNo: `${roomNum}-2`,
          floor: `${floor}层`,
          status: ['空闲', '占用', '外出'][Math.floor(Math.random() * 3)],
          customer: Math.random() > 0.5 ? {
            id: Math.floor(Math.random() * 1000),
            name: ['张三', '李四', '王五', '赵六'][Math.floor(Math.random() * 4)],
            age: 70 + Math.floor(Math.random() * 20),
            gender: ['男', '女'][Math.floor(Math.random() * 2)],
            careLevel: ['一级', '二级', '三级'][Math.floor(Math.random() * 3)],
            checkInDate: '2024-02-20'
          } : null
        })
      }
    }
    let filtered = beds
    if (params?.floor) {
      filtered = filtered.filter(b => b.floor === params.floor)
    }
    if (params?.status) {
      filtered = filtered.filter(b => b.status === params.status)
    }
    if (params?.keyword) {
      filtered = filtered.filter(b => 
        b.bedNo.includes(params.keyword) || 
        b.customer?.name.includes(params.keyword)
      )
    }
    return mockRequest({
      list: filtered,
      total: filtered.length
    })
  },
  
  getBedDetail: (bedId) => {
    return mockRequest({
      id: bedId,
      bedNo: '101-01-1',
      room: '101',
      floor: '1层',
      status: '占用',
      customer: {
        id: 1,
        name: '张三',
        age: 75,
        gender: '男',
        idCard: '210102195001011234',
        phone: '13800138000',
        emergencyContact: '张四',
        emergencyPhone: '13900139000',
        careLevel: '二级',
        checkInDate: '2024-01-15',
        healthCondition: '良好',
        allergies: '无',
        remarks: '需要定期服药'
      }
    })
  },
  
  updateBed: (data) => {
    return mockRequest({ success: true })
  },
  
  swapBed: (data) => {
    return mockRequest({ success: true })
  }
}

export const customerApi = {
  getCustomerList: (params) => {
    const customers = []
    for (let i = 1; i <= 50; i++) {
      customers.push({
        id: i,
        name: ['张三', '李四', '王五', '赵六', '钱七', '孙八'][i % 6],
        age: 65 + Math.floor(Math.random() * 25),
        gender: ['男', '女'][i % 2],
        idCard: `21010219${50000000 + i * 10000}`,
        phone: `138${String(i).padStart(8, '0')}`,
        bedNo: `${Math.ceil(i / 2)}01-${Math.ceil(i / 2)}0${(i % 2) + 1}`,
        careLevel: ['一级', '二级', '三级'][i % 3],
        status: ['在住', '外出', '退住'][i % 3],
        checkInDate: `2024-0${(i % 9) + 1}-15`,
        emergencyContact: `紧急联系人${i}`,
        emergencyPhone: `139${String(i).padStart(8, '0')}`
      })
    }
    let filtered = customers
    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status)
    }
    if (params?.keyword) {
      filtered = filtered.filter(c => 
        c.name.includes(params.keyword) || 
        c.bedNo.includes(params.keyword)
      )
    }
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const start = (page - 1) * pageSize
    return mockRequest({
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize
    })
  },
  
  addCustomer: (data) => {
    return mockRequest({ success: true, id: Date.now() })
  },
  
  updateCustomer: (data) => {
    return mockRequest({ success: true })
  },
  
  getCustomerDetail: (id) => {
    return mockRequest({
      id,
      name: '张三',
      age: 75,
      gender: '男',
      idCard: '210102195001011234',
      phone: '13800138000',
      bedNo: '101-01',
      careLevel: '二级',
      status: '在住',
      checkInDate: '2024-01-15',
      emergencyContact: '张四',
      emergencyPhone: '13900139000',
      healthCondition: '良好',
      allergies: '无',
      remarks: '需要定期服药'
    })
  }
}

export const outingApi = {
  getOutingList: (params) => {
    const outings = []
    for (let i = 1; i <= 20; i++) {
      outings.push({
        id: i,
        customerName: ['张三', '李四', '王五', '赵六'][i % 4],
        bedNo: `${Math.ceil(i / 2)}01-${Math.ceil(i / 2)}0${(i % 2) + 1}`,
        outingType: ['请假外出', '就医外出'][i % 2],
        startTime: '2024-03-15 09:00',
        endTime: '2024-03-15 17:00',
        reason: '家属探望',
        status: ['待审批', '已批准', '已外出', '已返回', '已拒绝'][i % 5],
        applyTime: '2024-03-14 10:30',
        approver: i > 2 ? '管理员' : null,
        approveTime: i > 2 ? '2024-03-14 14:00' : null
      })
    }
    return mockRequest({
      list: outings,
      total: outings.length
    })
  },
  
  addOuting: (data) => {
    return mockRequest({ success: true, id: Date.now() })
  },
  
  approveOuting: (id, approved) => {
    return mockRequest({ success: true })
  }
}

export const dischargeApi = {
  getDischargeList: (params) => {
    const discharges = []
    for (let i = 1; i <= 15; i++) {
      discharges.push({
        id: i,
        customerName: ['张三', '李四', '王五', '赵六'][i % 4],
        bedNo: `${Math.ceil(i / 2)}01-${Math.ceil(i / 2)}0${(i % 2) + 1}`,
        dischargeType: ['正常退住', '转院', '去世'][i % 3],
        reason: ['家属接回', '转院治疗', '自然死亡'][i % 3],
        applyTime: '2024-03-14 10:30',
        status: ['待审批', '已批准', '已完成'][i % 3],
        approver: i > 2 ? '管理员' : null,
        approveTime: i > 2 ? '2024-03-14 14:00' : null,
        actualTime: i > 5 ? '2024-03-15 10:00' : null
      })
    }
    return mockRequest({
      list: discharges,
      total: discharges.length
    })
  },
  
  addDischarge: (data) => {
    return mockRequest({ success: true, id: Date.now() })
  },
  
  approveDischarge: (id, approved) => {
    return mockRequest({ success: true })
  }
}

export const careLevelApi = {
  getCareLevelList: (params) => {
    const levels = [
      { id: 1, name: '一级护理', description: '完全不能自理，需要24小时专人护理', price: 5000, items: ['喂饭', '翻身', '擦浴', '如厕护理', '服药管理'] },
      { id: 2, name: '二级护理', description: '部分不能自理，需要定时护理', price: 3500, items: ['协助进食', '协助洗漱', '服药提醒', '日常活动协助'] },
      { id: 3, name: '三级护理', description: '基本能自理，需要简单协助', price: 2000, items: ['健康监测', '服药提醒', '日常活动指导'] },
    ]
    return mockRequest({
      list: levels,
      total: levels.length
    })
  },
  
  addCareLevel: (data) => {
    return mockRequest({ success: true, id: Date.now() })
  },
  
  updateCareLevel: (data) => {
    return mockRequest({ success: true })
  },
  
  deleteCareLevel: (id) => {
    return mockRequest({ success: true })
  }
}

export const careItemApi = {
  getCareItemList: (params) => {
    const items = [
      { id: 1, name: '喂饭', description: '协助进食', category: '日常护理', price: 50, unit: '次' },
      { id: 2, name: '翻身', description: '定时翻身防止压疮', category: '日常护理', price: 30, unit: '次' },
      { id: 3, name: '擦浴', description: '全身擦浴清洁', category: '个人卫生', price: 80, unit: '次' },
      { id: 4, name: '如厕护理', description: '协助如厕', category: '日常护理', price: 40, unit: '次' },
      { id: 5, name: '服药管理', description: '按时服药提醒和管理', category: '医疗护理', price: 20, unit: '次' },
      { id: 6, name: '健康监测', description: '血压、血糖等监测', category: '医疗护理', price: 30, unit: '次' },
      { id: 7, name: '康复训练', description: '肢体康复训练', category: '康复护理', price: 100, unit: '次' },
      { id: 8, name: '心理疏导', description: '心理健康疏导', category: '心理护理', price: 80, unit: '次' },
    ]
    return mockRequest({
      list: items,
      total: items.length
    })
  },
  
  addCareItem: (data) => {
    return mockRequest({ success: true, id: Date.now() })
  },
  
  updateCareItem: (data) => {
    return mockRequest({ success: true })
  },
  
  deleteCareItem: (id) => {
    return mockRequest({ success: true })
  }
}

export const careRecordApi = {
  getCareRecordList: (params) => {
    const records = []
    for (let i = 1; i <= 30; i++) {
      records.push({
        id: i,
        customerName: ['张三', '李四', '王五', '赵六'][i % 4],
        bedNo: `${Math.ceil(i / 2)}01-${Math.ceil(i / 2)}0${(i % 2) + 1}`,
        careItem: ['喂饭', '翻身', '擦浴', '服药管理'][i % 4],
        careTime: `2024-03-${(i % 28) + 1} ${8 + (i % 10)}:00`,
        caregiver: ['护工甲', '护工乙', '护工丙'][i % 3],
        content: `完成${['喂饭', '翻身', '擦浴', '服药管理'][i % 4]}护理`,
        remarks: i % 3 === 0 ? '状态良好' : ''
      })
    }
    return mockRequest({
      list: records,
      total: records.length
    })
  },
  
  addCareRecord: (data) => {
    return mockRequest({ success: true, id: Date.now() })
  }
}

export const healthButlerApi = {
  getButlerList: (params) => {
    const butlers = []
    for (let i = 1; i <= 10; i++) {
      butlers.push({
        id: i,
        name: `健康管家${i}`,
        phone: `138${String(i).padStart(8, '0')}`,
        serviceCount: 5 + Math.floor(Math.random() * 10),
        customers: [
          { id: 1, name: '张三', bedNo: '101-01' },
          { id: 2, name: '李四', bedNo: '101-02' },
        ]
      })
    }
    return mockRequest({
      list: butlers,
      total: butlers.length
    })
  },
  
  getCustomerServiceList: (params) => {
    const services = []
    for (let i = 1; i <= 20; i++) {
      services.push({
        id: i,
        customerName: ['张三', '李四', '王五', '赵六'][i % 4],
        bedNo: `${Math.ceil(i / 2)}01-${Math.ceil(i / 2)}0${(i % 2) + 1}`,
        butlerName: `健康管家${(i % 3) + 1}`,
        serviceName: ['日常护理', '健康监测', '康复训练'][i % 3],
        startDate: '2024-01-15',
        endDate: '2024-07-15',
        status: ['服务中', '已到期', '待续费'][i % 3],
        price: [3000, 2000, 5000][i % 3]
      })
    }
    return mockRequest({
      list: services,
      total: services.length
    })
  },
  
  assignButler: (data) => {
    return mockRequest({ success: true })
  },
  
  buyService: (data) => {
    return mockRequest({ success: true })
  },
  
  renewService: (data) => {
    return mockRequest({ success: true })
  }
}

export const userApi = {
  getUserList: (params) => {
    const users = [
      { id: 1, username: 'admin', name: '系统管理员', role: 'admin', phone: '13800000001', status: '正常', createTime: '2024-01-01' },
      { id: 2, username: 'butler1', name: '健康管家1', role: 'butler', phone: '13800000002', status: '正常', createTime: '2024-01-05' },
      { id: 3, username: 'butler2', name: '健康管家2', role: 'butler', phone: '13800000003', status: '正常', createTime: '2024-01-05' },
      { id: 4, username: 'nurse1', name: '护工1', role: 'nurse', phone: '13800000004', status: '正常', createTime: '2024-01-10' },
      { id: 5, username: 'nurse2', name: '护工2', role: 'nurse', phone: '13800000005', status: '正常', createTime: '2024-01-10' },
    ]
    return mockRequest({
      list: users,
      total: users.length
    })
  },
  
  addUser: (data) => {
    return mockRequest({ success: true, id: Date.now() })
  },
  
  updateUser: (data) => {
    return mockRequest({ success: true })
  },
  
  deleteUser: (id) => {
    return mockRequest({ success: true })
  }
}
