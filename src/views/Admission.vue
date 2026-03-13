<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { customerApi, careLevelApi } from '../api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const careLevels = ref([])

const form = reactive({
  name: '',
  gender: '男',
  age: '',
  idCard: '',
  phone: '',
  bedNo: '',
  careLevel: '',
  checkInDate: '',
  emergencyContact: '',
  emergencyPhone: '',
  healthCondition: '',
  allergies: '',
  remarks: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  bedNo: [{ required: true, message: '请选择床位', trigger: 'change' }],
  careLevel: [{ required: true, message: '请选择护理级别', trigger: 'change' }],
  checkInDate: [{ required: true, message: '请选择入住日期', trigger: 'change' }],
  emergencyContact: [{ required: true, message: '请输入紧急联系人', trigger: 'blur' }],
  emergencyPhone: [{ required: true, message: '请输入紧急联系电话', trigger: 'blur' }],
}

const formRef = ref(null)

const bedOptions = ref([])
for (let floor = 1; floor <= 3; floor++) {
  for (let room = 1; room <= 10; room++) {
    const roomNum = `${floor}0${room.toString().padStart(2, '0')}`
    bedOptions.value.push({ label: `${roomNum}-1`, value: `${roomNum}-1` })
    bedOptions.value.push({ label: `${roomNum}-2`, value: `${roomNum}-2` })
  }
}

const fetchCareLevels = async () => {
  const res = await careLevelApi.getCareLevelList()
  careLevels.value = res.data.list
}

fetchCareLevels()

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  try {
    await customerApi.addCustomer(form)
    ElMessage.success('入住登记成功')
    router.push('/customer-list')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <div class="admission-page">
    <div class="page-header">
      <h2>入住登记</h2>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      style="max-width: 800px"
    >
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
      </el-row>

      <el-divider content-position="left">入住信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="床位号" prop="bedNo">
            <el-select v-model="form.bedNo" placeholder="请选择床位" filterable style="width: 100%">
              <el-option v-for="bed in bedOptions" :key="bed.value" :label="bed.label" :value="bed.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="护理级别" prop="careLevel">
            <el-select v-model="form.careLevel" placeholder="请选择护理级别" style="width: 100%">
              <el-option v-for="level in careLevels" :key="level.id" :label="level.name" :value="level.name" />
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
      </el-row>

      <el-divider content-position="left">紧急联系人</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="紧急联系人" prop="emergencyContact">
            <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="emergencyPhone">
            <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">健康信息</el-divider>
      <el-form-item label="健康状况">
        <el-input v-model="form.healthCondition" type="textarea" :rows="2" placeholder="请输入健康状况" />
      </el-form-item>
      <el-form-item label="过敏史">
        <el-input v-model="form.allergies" placeholder="请输入过敏史" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.admission-page {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}
</style>
