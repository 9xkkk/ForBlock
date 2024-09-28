<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios, { Axios } from 'axios';
import {
    ElMessageBox,
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
    ElInput,
    ElPopover
} from 'element-plus';
import emitter from '../plugins/bus.js'

const tableData = ref([])
const tableData2 = ref([])
const tableData3 = ref([])


const fileVisible= ref(false)
const node=ref('')





const checkFile = reactive({
    description: "",
    fileOwner: "",
    time: "",
    id: "",
    fileName: "",
    hash:"",
    size: "",
    status:"",
    fingerprint: "",
    applyOwner:""
})

const fileDetails = ref({
    description: "",
    fileOwner: "",
    time: "",
    id: "",
    fileName: "",
    hash:"",
    size: "",
    status:"",
    fingerprint: "",
    applyOwner:""
})


const table1 = reactive({
    applyOwner: "",
    fileOwner: "",
    time: "",
    id: "",
    fileName: "",
    hash:"",
})

const table2 = reactive({
    date: "",
    name: "",
})

const table3 = reactive({
    date: "",
    name: "",
    id: "",
    des: "",
    hash: "",
})

const showTable2 = (item) => {
    console.log(item);
    checkFile.fileOwner=item.fileOwner
    checkFile.fileName=item.fileName
    checkFile.applyOwner=item.applyOwner
    checkFile.id=item.id
    
if (item.status==1) {
    checkFile.status='是'
} else {
    checkFile.status='否' 
}

    checkFile.time=item.time
    checkFile.txHash=item.txHash
    fileVisible.value = true

}






//增加了根据id向后端查询文件信息的函数
const getFileById = (row) => {
    
    console.log(row);
    axios.get(`/myfile/onefile/${row.id}`).then(res => {
        console.log(res);
        checkFile.fileOwner= res.data.fileOwner
        checkFile.fileName = res.data.name
        checkFile.id = res.data.id
        checkFile.hash=res.data.hash
        checkFile.time=res.data.time
        checkFile.description=res.data.description
        checkFile.size=res.data.size
       
        checkFile.hash=res.data.hash
        
        if(row.status==5){
            checkFile.status="是"
        }else{
            checkFile.status="否"
        }
       
       
    })
    fileVisible.value = true
}

const getData = () => {
    axios.get("/myfile").then(res => {
       
        node.value=res.data.NodeInformation
        tableData.value = res.data.myapply
        tableData2.value = res.data.applylist
        tableData3.value = res.data.filelist
        emitter.emit('fn',node);
        console.log(tableData2);
        const dataArray = Object.values(tableData2);
console.log(dataArray)
    })
   
    
}




const handleDeleteApply = (row) => {
    ElMessageBox.confirm(
    '确认删除吗',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
         //删除
        axios.delete(`/myfile/deleteapply/${row.id}/${row.applyOwner}`).then(res => {
        console.log(res);
        getData()
    })

      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}


const handleDeleteFile = (row) => {
    ElMessageBox.confirm(
    '确认删除吗',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
         //删除
         axios.delete(`/myfile/deletefile/${row.id}`).then(res => {
        console.log(res);
        getData()
    })

      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })

   
}

const updateapply = (row) => {
    //更新申请状态--拒绝
    console.log(row);
    axios.put(`/myfile/update/${row.id}/${row.applyOwner}`, { status: 3 }).then(res => {
        console.log(res);
        
    })
    getData();
    location.reload()

        
}
    

const updateapply2 = (row) => {
    //更新申请状态--授权亦可用
    console.log(row);
    axios.put(`/myfile/update/${row.id}/${row.applyOwner}`, { status:4}).then(res => {
        console.log(res);
        
    })
    getData();
    location.reload()
 
    
}
       

const updateapply3 = (row) => {
    //更新申请状态--可用可转发
    console.log(row);
    axios.put(`/myfile/update/${row.id}/${row.applyOwner}`, { status: 5}).then(res => {
        
        console.log(res);
        
    })
    getData();
    location.reload()
    

   
}
const download=(row)=>{
    console.log(row);

    const filename = row.fileName
    const fileowner = row.fileOwner
   
    axios({
        url: `myfile/download/${filename}/${fileowner}`, 
        method: 'GET',
        responseType: 'blob', 
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers['content-type'], 
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename; 
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('下载文件失败:', error);
        });

}



//添加
const add=(row)=>{
   axios.get( `myfile/download/${row.fileName}/${row.fileOwner}`, {
   responseType: 'blob' 
 }).then(response => {
   const file = new File([response.data], row.fileName, { type: response.data.type });
   console.log(file);


   axios.post("upload/confirm", {
            "f1":file,
             "name":fileDetails.name ,
             "description":fileDetails.description,
             "size":fileDetails.size 
             
        }, {
     headers: { 'Content-Type': 'multipart/form-data' }
   }).then(res => {
     console.log(111);
     ElMessage({
        type: 'success',
        message: '已添加',
      })
   }).catch(err => {
     console.log(222);
   });
       
 })
 
}
const fd=(row)=>{

    axios.get(`/myfile/onefile/${row.id}`).then(res => {
        console.log(res.data);
        fileDetails.value=res.data
       
        if(row.status==5){
            fileDetails.value.status="是"
        }else{
            fileDetails.value.status="否"
        }
        console.log(fileDetails);
        add(row);
        
    })
   


}



getData();
   
</script>

<template>
    <div class="mine">
        <el-dialog v-model="fileVisible" width="30%">
            <!--所有的查看详细信息都用这一个页面-->
            <div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件拥有方：</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.fileOwner" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件名称：</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.fileName" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">上传时间：</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.time" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件ID:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.id" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件大小:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.size" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">是否可转发:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.status" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">区块链哈希:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.hash" type="textarea" resize="none" :autosize="{ minRows: 2, maxRows: 2 }" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">文件描述:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.description" disabled></el-input>
                    </div>
                </div>
            </div>
        </el-dialog>

      
        <el-card class="box-card" style="margin-top: 20px">
            <template #header>
                <div class="card-header">
                    <h3 style="text-align: center;">我的文件</h3>
                    <!--                    <el-button class="button" text>Operation button</el-button>-->
                </div>
            </template>
            <div>
                <el-table :data="tableData3" style="width: 100%" border>
                    <el-table-column prop="id" label="ID" />
                    <el-table-column prop="name" label="文件名称" />
                    <el-table-column prop="description" label="文件描述" />
                    <el-table-column prop="time" label="时间" />
                    <el-table-column label="操作">
                        <template v-slot="scope">
                            <div style="display: flex;">
                                <el-button style="margin-left: 40px" type="primary"
                                    @click="getFileById(scope.row)">查看</el-button>
                                <el-button style="margin-left: 40px" type="danger" 
                                    @click="handleDeleteFile(scope.row)">删除</el-button>
                                 
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>
        <el-card class="box-card" style="margin-top: 20px">
            <template #header>
                <div class="card-header">
                    <h3 style="text-align: center;">我的申请</h3>
                    <!--                    <el-button class="button" text>Operation button</el-button>-->
                </div>
            </template>
            <div>
                <el-table :data="tableData" style="width: 100%" border>
                    <el-table-column prop="fileOwner" label="组织" width="180" />
                    <el-table-column prop="fileName" label="文件名称" width="180" />
                    <el-table-column prop="time" label="申请时间" width="180" />
                    <el-table-column prop="id" label="文件ID" width="180" />
                    <el-table-column label="状态" width="135">
                       <!--作用域插槽-->
                        <template #default="scope">   
                            {{
                                scope.row.status == 1 ? '没被申请' : scope.row.status == 2 ? '正在申请中' : scope.row.status == 3 ? '申请被拒绝' : scope.row.status == 4 ? '可用不可转发' :
                                    scope.row.status == 5 ? '可用可转发':""
                                    }}
                        </template>
                    </el-table-column>




                    <el-table-column label="">
                        <template v-slot="scope">
                            <div style="display: flex;">
                                <div v-html="scope.row.address"></div>
                                <el-button style="margin-left: 20px" v-if="scope.row.status == 4  || scope.row.status==5"
                                    type="success" @click="download(scope.row)" >下载</el-button>
                                <el-button style="margin-left: 20px" v-if="scope.row.status==5"
                                    type="warning" @click="fd(scope.row)" >添加</el-button>
                               
                               
                                <el-button style="margin-left: 20px" type="primary"
                                    @click="getFileById(scope.row)">查看</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>
        <el-card class="box-card" style="margin-top: 20px">
            <template #header>
                <div class="card-header">
                    <h3 style="text-align: center;">申请信息</h3>
                    <!--                    <el-button class="button" text>Operation button</el-button>-->
                </div>
            </template>
            <div>
                <el-table :data="tableData2" style="width: 100%" border>
                    <el-table-column prop="applyOwner" label="申请节点" width="180" />
                    <el-table-column prop="fileName" label="文件名称" width="180" />

                    <el-table-column label="">
                        <template v-slot="scope">
                            <div style="display: flex;">
                                <el-button style="margin-left: 40px" type="primary"
                                    @click="showTable2(scope.row)">查看</el-button>
                                <el-button style="margin-left: 40px" type="danger"
                                    @click="updateapply(scope.row)" v-if="scope.row.isHandled==false">拒绝</el-button>
                                <el-button style="margin-left: 40px" type="warning"
                                    @click="updateapply2(scope.row)" v-if="scope.row.isHandled==false">授权亦可用</el-button>
                                <el-button style="margin-left: 40px" type="primary"
                                    @click="updateapply3(scope.row)" v-if="scope.row.isHandled==false">可用可转发</el-button>
                                <el-button style="margin-left: 40px" type="danger" 
                                    @click="handleDeleteApply(scope.row)" >删除</el-button>
    
                                <el-text  style="margin-left: 300px" type="success" disabled="true" v-if="scope.row.isHandled==true">已操作</el-text>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>
       
    </div>
</template>



<style lang="scss" scoped>
.mine {
    height: 100%;
    width: 100%;
}
</style>
