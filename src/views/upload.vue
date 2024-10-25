<script setup>
import { ref, reactive } from 'vue'
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

const form = reactive({
    //表单格式
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: '',
    num: '',
    size: '',
    description: ''



})
const onSubmit = () => {
    console.log('submit!')
}
const fileList = []

const handleAvatarSuccess = (response, uploadFile) => {
    console.log(response, uploadFile)
    form.name = uploadFile.name
    form.size = uploadFile.size
    // imageUrl.value = URL.createObjectURL(uploadFile.raw)
}
const handleRemove = (file, uploadFiles) => {
    console.log(file, uploadFiles)
    form.name = ''
    form.size = ''
    form.num = ''
    form.resource = ''
}


const uploadData = ref("")

const beforeUpload = (file) => {

    console.log(222);
    console.log(file);
    uploadData.value = file



}
const submitUpload = () => {
    console.log(uploadData.value)


    axios.post("upload/confirm", {
        "f1": uploadData.value,
        "name": form.name || uploadData.value.name,
        "description": form.description,
        "size": form.size || uploadData.value.size,
        "status": form.resource
    }, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
        ElMessage({
            message: '上传成功',
            type: 'success',
        })
    }).catch(err => {
        ElMessage({
            message: '上传失败' + err,
            type: 'warning',
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
                        style="display: flex;" :on-success="handleAvatarSuccess" :on-remove="handleRemove"
                        :before-upload="beforeUpload">
                        <el-button type="primary">选择文件</el-button>

                    </el-upload>
                    <el-button style="margin-left: 40px;" type="success" @click="submitUpload">确认上传</el-button>
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
