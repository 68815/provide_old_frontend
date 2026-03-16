<script setup>
import { ref, onMounted } from 'vue'
import { customerApi, nurseLevelApi, bedApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const customerList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const manType = ref('')
const careLevels = ref([])
const bedOptions = ref([])

const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const form = ref({
  id: null,
  name: '',
  gender: '男',
  age: '',
  idCard: '',
  phone: '',
  bedId: '',
  levelId: '',
  checkInDate: '',
  familyMember: '',
  birthday: '',
  bloodType: '',
  height: '',
  weight: '',
  healthCondition: '',
  allergies: '',
  buildingNo: '',
  roomNo: '',
  expirationDate: '',
  userId: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  bedId: [{ required: true, message: '请选择床位', trigger: 'change' }],
  checkInDate: [{ required: true, message: '请选择入住日期', trigger: 'change' }],
  familyMember: [{ required: true, message: '请输入家属姓名', trigger: 'blur' }],
  roomNo: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  buildingNo: [{ required: true, message: '请输入所属楼房', trigger: 'blur' }],
  expirationDate: [{ required: true, message: '请选择合同到期时间', trigger: 'change' }],
}

const manTypeOptions = [
  { label: '全部', value: 0 },
  { label: '自理老人', value: '1' },
  { label: '护理老人', value: '2' },
  { label : '无管家', value: '3' },
]

const fetchData = async () => {
  loading.value = true
  try {
    let userId = undefined
    if (manType.value === 3) {
      userId = -1
    }
    
    const res = await customerApi.getCustomerList({
      page: currentPage.value,
      keyword: keyword.value,
      userId: userId,
      manType: manType.value,
    })
    if (res.flag && res.data) {
      customerList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const getGenderText = (sex) => {
  return sex === 0 ? '男' : '女'
}

const fetchOptions = async () => {
  try {
    const levelRes = await nurseLevelApi.getNurseLevelList({})
    if (levelRes.flag && levelRes.data) {
      careLevels.value = levelRes.data
    }
    const bedRes = await bedApi.getBedList({ bedStatus: 1 })
    if (bedRes.flag && bedRes.data) {
      bedOptions.value = bedRes.data
    }
  } catch (e) {
    console.error('获取选项失败', e)
  }
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = {
    id: row.id,
    name: row.customerName || '',
    gender: row.customerSex === 0 ? '男' : '女',
    age: row.customerAge || '',
    idCard: row.idcard || '',
    phone: row.contactTel || '',
    bedId: row.bedId || '',
    levelId: row.levelId || '',
    checkInDate: row.checkinDate || '',
    familyMember: row.familyMember || '',
    birthday: row.birthday || '',
    bloodType: row.bloodType || '',
    height: row.height || '',
    weight: row.weight || '',
    healthCondition: row.psychosomaticState || '',
    allergies: row.attention || '',
    buildingNo: row.buildingNo || '',
    roomNo: row.roomNo || '',
    expirationDate: row.expirationDate || '',
    userId: row.userId || '',
  }
  fetchOptions()
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该客户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await customerApi.removeCustomer(row.id, row.bedId)
    if (res.flag) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    const res = await customerApi.editCustomer({
      id: form.value.id,
      name: form.value.name,
      gender: form.value.gender,
      age: form.value.age,
      idCard: form.value.idCard,
      phone: form.value.phone,
      bedId: form.value.bedId,
      levelId: form.value.levelId,
      checkInDate: form.value.checkInDate,
      familyMember: form.value.familyMember,
      birthday: form.value.birthday,
      bloodType: form.value.bloodType,
      height: form.value.height,
      weight: form.value.weight,
      healthCondition: form.value.healthCondition,
      allergies: form.value.allergies,
      buildingNo: form.value.buildingNo,
      roomNo: form.value.roomNo,
      expirationDate: form.value.expirationDate,
      userId: form.value.userId,
    })
    if (res.flag) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '修改失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '修改失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="customer-list-page">
    <div class="filter-bar">
      <div class="filter-left">
        <el-input
          v-model="keyword"
          placeholder="搜索姓名"
          style="width: 200px"
          clearable
          @keyup.enter="fetchData"
        />
        <el-button type="primary" style="margin-left: 8px" @click="fetchData">搜索</el-button>
      </div>
      <el-button type="primary" @click="$router.push('/admission')">入住登记</el-button>
    </div>

    <div style="margin-bottom: 16px">
      <el-radio-group v-model="manType" @change="fetchData">
        <el-radio-button 
          v-for="item in manTypeOptions" 
          :key="item.value" 
          :value="item.value"
        >
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="customerList" v-loading="loading" stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column prop="customerName" label="姓名" width="100" />
      <el-table-column prop="bloodType" label="血型" width="80" />
      <el-table-column prop="contactTel" label="联系电话" width="130" />
      <el-table-column prop="customerAge" label="年龄" width="70" />
      <el-table-column prop="customerSex" label="性别" width="60">
              <template #default="{ row }">
          {{ getGenderText(row.customerSex) }}
        </template>
      </el-table-column>
      <el-table-column prop="familyMember" label="家属" width="100" >
        <template #default="{ row }">
          {{ row.familyMember || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="idcard" label="身份证号" width="100" />
      <el-table-column prop="buildingNo" label="所属楼房" width="120" />
      <el-table-column prop="roomNo" label="房间号" width="120" />
      <el-table-column prop="bedNo" label="床位号" width="120" />
      <el-table-column prop="birthday" label="出生日期" width="120" />
      <el-table-column prop="levelId" label="护理级别" width="100" />
      <el-table-column prop="userId" label="管家" width="100" />
      
      <el-table-column prop="checkinDate" label="入住日期" width="120" />
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          <el-button type="primary" link size="small" @click="handleEdit(row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, prev, pager, next, sizes"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
        @size-change="(size) => { pageSize = size; fetchData() }"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '客户详情'" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" :min="0" :max="150" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker v-model="form.birthday" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="血型" prop="bloodType">
              <el-input v-model="form.bloodType" placeholder="请输入血型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="家属" prop="familyMember">
              <el-input v-model="form.familyMember" placeholder="请输入家属姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">入住信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="床位号" prop="bedId">
              <el-select v-model="form.bedId" placeholder="请选择床位" filterable style="width: 100%">
                <el-option v-for="bed in bedOptions" :key="bed.id" :label="bed.bedNo" :value="bed.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="护理级别">
              <el-select v-model="form.levelId" placeholder="请选择护理级别" style="width: 100%">
                <el-option v-for="level in careLevels" :key="level.id" :label="level.levelName" :value="level.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入住日期" prop="checkInDate">
              <el-date-picker v-model="form.checkInDate" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同到期" prop="expirationDate">
              <el-date-picker v-model="form.expirationDate" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属楼房" prop="buildingNo">
              <el-input v-model="form.buildingNo" placeholder="请输入所属楼房" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间号" prop="roomNo">
              <el-input v-model="form.roomNo" placeholder="请输入房间号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">健康信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身高">
              <el-input v-model="form.height" placeholder="请输入身高" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重">
              <el-input v-model="form.weight" placeholder="请输入体重" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="健康状况">
          <el-input v-model="form.healthCondition" type="textarea" :rows="2" placeholder="请输入健康状况" />
        </el-form-item>
        <el-form-item label="注意事项">
          <el-input v-model="form.allergies" placeholder="请输入注意事项" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.customer-list-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.filter-left {
  display: flex;
  align-items: center;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.empty-text {
  color: #c0c4cc;
}
</style>
