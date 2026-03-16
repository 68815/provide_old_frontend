import { get, postJson } from './request'

export const userApi = {
  login: (username, password) => {
    return get('/user/login', { username, password })
  },

  getUserList: (params) => {
    return get('/user/findUserPage', {
      pageSize: params?.page || 1,
      nickname: params?.nickname,
      roleId: params?.roleId,
    })
  },

  addUser: (data) => {
    return postJson('/user/addUser', {
      username: data.username,
      password: data.password,
      nickname: data.nickname,
      phoneNumber: data.phone,
      email: data.email,
      sex: data.sex,
      roleId: data.roleId,
      isDeleted: 0,
    })
  },

  updateUser: (data) => {
    return postJson('/user/updateUser', {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      phoneNumber: data.phone,
      email: data.email,
      sex: data.sex,
      roleId: data.roleId,
      isDeleted: data.isDeleted || 0,
    })
  },

  removeUser: (id) => {
    return get('/user/removeUser', { id })
  },

  logout: () => {
    return get('/user/logout')
  },
}
