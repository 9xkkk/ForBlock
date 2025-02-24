<script setup>
import {    toRaw,ref, reactive } from 'vue'
import {
    ElAside,
    ElContainer,
    ElHeader,
    ElMain,
    ElMenu,
    ElSubMenu,
    ElMenuItemGroup,
    ElMenuItem,
    ElRow,
    ElCard,
    ElMessage,
    ElButton,
    ElTable,
    ElTableColumn,
    ElForm,
    ElFormItem,
    ElInput,
    ElRadioGroup,
    ElRadio,
    ElUpload
} from 'element-plus';
import axios from 'axios'

// const form = ref({
//     name: '',
//     delivery: false,
//     type: [],
//     resource: '',
//     desc: '',
//     num: '',
//     size: '',
//     description: ''
// })

const form = ref("")

const handleChange = (file, fileLists) => { 
    console.log("handlechange file", file)
    form.value = file
    form.value.name = file.name  // 使用 .value 访问和修改
    form.value.size = (file.size / 1000) + ' KB'  // 使用 .value 访问和修改
    // console.log("上传文件名:", form.value.name)
    // console.log("文件大小:", form.value.size)
    console.log("完整的form:", form.value)
}

const onSubmit = () => {
    // console.log('submit!')
}
const fileList = ref([])

// //未用
// const handleAvatarSuccess = (response, uploadFile) => {
//     console.log("handleAvatarSuccess", response, uploadFile)
//     form.name = uploadFile.name
//     form.size = uploadFile.size
//     // imageUrl.value = URL.createObjectURL(uploadFile.raw)
// }

const handleRemove = (file, fileList) => {
    console.log("handleRemove前" ,fileList)
    form.value.raw = null
    form.value.name = ''
    form.value.size = ''
    fileList.value = []
    console.log("handleRemove后" ,fileList)
}


//未用
// const uploadData = ref("")

// const beforeUpload = (file) => {

//     console.log("文件：", file);
//     uploadData.value = file
// }

const submitUpload = () => {
        // 优先检查 fileList 而非 form.value.raw
    if (fileList.value.length === 0) {
        ElMessage.warning('请先选择要上传的文件！')
        return
    }

    // 二次校验文件对象是否存在
    if (!form.value.raw) {
        ElMessage.error('文件数据异常，请重新选择')
        return
    }
    // console.log("upload数据", uploadData.value)
    console.log("form文件:", form.value.raw)
    // console.log("清空前 fileList:", fileList.value);
    axios.post("upload/confirm", 
    {
        "f1": form.value.raw,
        "name": form.value.name ,
        "description": form.value.description,
        "size": form.value.size,
        "status": form.value.resource
    }, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
        ElMessage({
            message: '文件上传成功',
            type: 'success',
        })
        fileList.value=[]
    }).catch(err => {
        if (!form.value.raw) {
            ElMessage({ message: '请先选择要上传的文件！', type: 'warning' })
        }
        const errorMessage = err.response?.status === 400 
            ? '请求参数错误，请检查文件格式或大小' 
            : `上传失败（错误码：${err.response?.status || '未知'}）`
        
        ElMessage({
            message: errorMessage,
            type: 'error', // 建议错误类型用error更直观
        })
    })
}
</script>

<template>
    <div class="upload">
        <el-card class="box-card">
            <el-form :model="form" label-width="120px" style="width: 700px; ">
                <el-form-item label="文件名">
                    <el-input v-model="form.name" />
                </el-form-item>

                <el-form-item label="数据大小">

                    <el-input v-model="form.size" />
                </el-form-item>
                <el-form-item label="文件描述">
                    <div class="input">
                        <el-input type="textarea" v-model="form.description" />
                    </div>
                </el-form-item>

                <el-form-item label="可共享">
                    <el-radio-group v-model="form.resource">
                        <el-radio label="是" :value="1" />
                        <el-radio label="否" :value="0" />
                    </el-radio-group>
                </el-form-item>
                <el-form-item style="display: flex;align-items: center;height: 60px;width: 500px;">


                    <el-upload ref="upload" v-model:file-list="fileList" class="upload-demo" action="" :limit="1"
                        style="display: flex;"                         
                        :show-file-list="true" :auto-upload="false" :on-change="handleChange" :on-remove="handleRemove">
                        <el-button type="primary">选择文件</el-button>
                        <el-button style="margin-left: 40px;" type="success" @click.stop="submitUpload">确认上传</el-button>
                    </el-upload>
                    
                    
                </el-form-item>
            </el-form>
        </el-card>

    </div>
</template>


<style lang="scss" scoped>
.box-card {
    margin-top: 20px;
    margin-left: 20px;
    margin-right: 20px;
    padding: 20px;
    border-radius: 5px;
}

.upload {
    height: 100%;
    width: 100%;
}

.input {
    height: 500%;
    width: 500%;
}
</style>
