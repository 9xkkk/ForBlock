<script setup>
import { ref } from 'vue'
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
    ElDialog,
    ElMessageBox,
    ElInput,
    ElDatePicker,
    ElRadioGroup,
    ElRadio
} from 'element-plus';

import axios from 'axios'
const dialogVisible = ref(false)
const value1 = ref('')
const radio = ref(0)
const tableData = ref([])
const fileId = ref('')
const fileName = ref('')
const dataNum = ref('')
const history = ref('')
const fileOwner = ref('')
const time = ref('')
const size = ref('')
const hash = ref('')
const description= ref('')
const arr=ref([])
const handleClose = (done) => {
    dialogVisible.value = false
}
const handleSubmit2 = (row) => {
    //申请共享
    axios.post("browse/apply", {      
    "id": row.id, 
    "name": row.name, 
    "fileOwner": row.fileOwner, 
    "description": row.description,
     "size": row.size, 
     "time": row.time, 
     "status": row.status
    }).then(res => {
        console.log(res);      
        getBrowseList() 
        ElMessage({
    message: '申请成功',
    type: 'success',
  })
    })
    
}
const showBox = (row) => {
    console.log(row)
    fileOwner.value=row.fileOwner,
    fileId.value=row.id,
    fileName.value=row.name,
    time.value=row.time,
    size.value=row.size,
    hash.value=row.hash,
    description.value=row.description,
    radio.value=row.status
    if(row.status==1){
            history.value="是"
        }else{
            history.value="否"
        }
    dialogVisible.value = true
}

const getBrowseList = () => {
    //后端get数据
    axios.get("browse").then(res => {
        console.log(res);
        tableData.value = res.data
    })
}   

const handleSubmit = () => {
    axios.post("browse/apply", {
       
    "id": fileId.value, 
    "name": fileName.value, 
    "fileOwner": fileOwner.value, 
    "description": description.value,
     "size": size.value, 
     "time": time.value, 
     "status": radio.value
    }).then(res => {
        console.log(res);
        ElMessage({
    message: '申请成功',
    type: 'success',
  })
    })
    dialogVisible.value = false
}
getBrowseList()
</script>




<template>
    <div class="browse">
        <el-card class="box-card">
            <div>
                <el-table :data="tableData" style="width: 100%" >
                    <el-table-column prop="fileOwner" label="组织名称" />
                    <el-table-column prop="name" label="文件名" />
                    <el-table-column prop="id" label="ID" />
                    <el-table-column prop="size" label="大小" width="200" />
                    <el-table-column prop="description" label="描述" width="200" />
                    <el-table-column label="操作">
                        <template v-slot="scope">
                            <div style="display: flex; justify-content: flex-start;">
                            <el-button style="margin-left: 0px" type="primary" @click="showBox(scope.row)">查看</el-button>
                            <el-button  style="margin-left: 30px" type="success" @click="handleSubmit2(scope.row)" v-if="scope.row.status==1">申请共享</el-button>
                        </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>


        <!--对话框-->
        <el-dialog v-model="dialogVisible" title="查看" width="30%" :before-close="handleClose">
            <div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件拥有方：</div>
                    <div style="width: 82%;">
                        <el-input v-model="fileOwner" disabled></el-input>
                    </div>
                </div>
                
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件名：</div>
                    <div style="width: 82%;">
                        <el-input v-model="fileName" disabled ></el-input>
                    </div>
                </div>
                
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">上传时间：</div>
                    <div style="width: 82%;">
                        <el-input v-model="time" disabled ></el-input>
                        
                    </div>
                </div>

                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件ID：</div>
                    <div style="width: 82%;">
                        <el-input v-model="fileId" disabled></el-input>
                    </div>
                </div>

                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件大小：</div>
                    <div style="width: 82%;">
                        <el-input v-model="size" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">是否可转发：</div>
                    <div style="width: 82%;">
                        <el-input v-model="history" disabled></el-input>    
                    </div> 
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">区块链哈希：</div>
                    <div style="width: 82%;">
                        <el-input v-model="hash" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件描述：</div>
                    <div style="width: 82%;">
                        <el-input v-model="description" disabled></el-input>
                    </div>
                </div>
             
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="handleSubmit()" v-if="radio==0">
                        申请
                    </el-button>
                    

                </span>
            </template>
        </el-dialog>
    </div>
</template>



<style lang="scss" scoped>
.browse {
    height: 100%;
    width: 100%;
}

.dialog-footer button:first-child {
    margin-right: 10px;
}
</style>
