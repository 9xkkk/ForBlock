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

const tableData = ref([]) //我的申请
const tableData2 = ref([]) //申请信息
const tableData3 = ref([]) //我的文件

const fileVisible = ref(false)
const node = ref('')

const isPermissionLoading = ref(false); // 加载动画状态 - 权限标识生成
const isPrivacyLoading = ref(false); // 加载动画状态 - 隐私变换
const permissionGenerated = ref(false); // 权限标识生成完成状态
const privacyTransformed = ref(false); // 隐私变换完成状态

// 权限标识生成处理逻辑
const handlePermissionGenerated = () => {
    isPermissionLoading.value = true; // 开始加载动画
    setTimeout(() => {
        isPermissionLoading.value = false; // 停止加载动画
        permissionGenerated.value = true; // 更新完成状态
        ElMessage.success('权限标识生成成功'); // 弹出消息
    }, 2000); // 模拟2秒的生成时间
};

// 隐私变换处理逻辑
const handlePrivacyTransformed = () => {
    isPrivacyLoading.value = true; // 开始加载动画
    setTimeout(() => {
        isPrivacyLoading.value = false; // 停止加载动画
        privacyTransformed.value = true; // 更新完成状态
        ElMessage.success('隐私变换成功'); // 弹出消息
    }, 2000); // 模拟2秒的生成时间
};

const dialogFormVisible = ref(false)
const form = reactive({
    newFileName: '',
})
const formLabelWidth = '140px'

const currentRow = ref(null);

const checkFile = reactive({
    description: "",
    fileOwner: "",
    time: "",
    id: "",
    fileName: "",
    hash: "",
    size: "",
    status: "",
    fingerprint: "",
    applyOwner: ""
})

const fileDetails = ref({
    description: "",
    fileOwner: "",
    time: "",
    id: "",
    fileName: "",
    hash: "",
    size: "",
    status: "",
    fingerprint: "",
    applyOwner: ""
})


const table1 = reactive({
    applyOwner: "",
    fileOwner: "",
    time: "",
    id: "",
    fileName: "",
    hash: "",
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
    checkFile.fileOwner = item.fileOwner
    checkFile.fileName = item.fileName
    checkFile.applyOwner = item.applyOwner
    checkFile.id = item.id

    if (item.status == 1) {
        checkFile.status = '是'
    } else {
        checkFile.status = '否'
    }

    checkFile.time = item.time
    checkFile.txHash = item.txHash
    fileVisible.value = true

}

//增加了根据id向后端查询文件信息的函数
const getFileById = (row) => {

    console.log(row);
    axios.get(`/myfile/onefile/${row.id}/${row.fileOwner}`).then(res => {
        // console.log(res);
        checkFile.fileOwner = res.data.fileOwner
        checkFile.fileName = res.data.name
        checkFile.id = res.data.id
        checkFile.hash = res.data.hash
        checkFile.time = res.data.time
        checkFile.description = res.data.description
        checkFile.size = res.data.size

        checkFile.hash = res.data.hash

        if (row.status == 5) {
            checkFile.status = "是"
        } else {
            checkFile.status = "否"
        }
    })
    fileVisible.value = true
}

const getData = () => {
    axios.get("/myfile").then(res => {

        node.value = res.data.NodeInformation
        tableData.value = res.data.myapply
        tableData2.value = res.data.applylist
        tableData3.value = res.data.filelist
        console.log('我的文件', res.data.filelist);
        emitter.emit('fn', node);
        // console.log(tableData2);
        const dataArray = Object.values(tableData2);
        // console.log(dataArray)
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
            axios.delete(`/myfile/deleteapply/${row.id}/${row.applyOwner}/${row.fileOwner}`).then(res => {
                console.log('删除申请：', res);
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
            axios.delete(`/myfile/deletefile/${row.id}/${row.fileOwner}`).then(res => {
                console.log('删除文件：', res);
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
    console.log('更新申请状态--拒绝', row);
    axios.put(`/myfile/update/${row.id}/${row.applyOwner}/${row.fileOwner}`, { status: 3 }).then(res => {
        console.log(res);

    })
    getData();
    location.reload()
}


const updateapply2 = (row) => {
    //更新申请状态--授权亦可用
    console.log(row);
    axios.put(`/myfile/update/${row.id}/${row.applyOwner}/${row.fileOwner}`, { status: 4 }).then(res => {
        console.log('授权成功', res);
        row.isHandled = true;
            ElMessage.success('授权亦可用操作成功');
        })
        .catch(err => {
            console.error('操作失败', err);
            ElMessage.error('操作失败，请重试');
        });
        getData();
        location.reload()
}


const updateapply3 = (row) => {
    //更新申请状态--可用可转发
    console.log(row);
    axios.put(`/myfile/update/${row.id}/${row.applyOwner}/${row.fileOwner}`, { status: 5 }).then(res => {
        row.isHandled = true;
        console.log('可用可转发', res);

    })
    getData();
    location.reload()
}
//文件下载
const download = (row) => {
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


const fd = (row) => {

    axios.get(`/myfile/onefile/${row.id}/${row.fileOwner}`).then(res => {
        console.log('文件信息：', res.data);
        fileDetails.value = res.data

        if (row.status == 5) {
            fileDetails.value.status = "是"
        } else {
            fileDetails.value.status = "否"
        }
        console.log('文件详细信息：', fileDetails);
        // add(row);
    })
    // add(row);
}



//添加
const add = (row) => {
    axios.get(`myfile/download/${row.fileName}/${row.fileOwner}`, {
        responseType: 'blob'
    }).then(response => {
        const file = new File([response.data], fileDetails.value.fileName, { type: response.data.type });
        console.log('文件名称：', fileDetails.value.fileName);

        axios.post("myfile/addfile", {
            "f1": file,
            "name": fileDetails.value.fileName, // 确保使用 fileDetails.value
            "description": fileDetails.value.description,
            "size": fileDetails.value.size,
            "file_id": fileDetails.value.id // 使用 fileDetails.value.id
        }, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            console.log('点击添加，这是文件名称', fileDetails.value.fileName);
            ElMessage({
                type: 'success',
                message: '已添加',
            })
        }).catch(err => {
            console.log('请求失败:', err);
        });

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
                        <el-input v-model="checkFile.hash" type="textarea" resize="none"
                            :autosize="{ minRows: 2, maxRows: 2 }" disabled></el-input>
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
                <el-table :data="tableData3" style="width: 100%">
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
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column prop="fileOwner" label="组织" width="180" />
                    <el-table-column prop="fileName" label="文件名称" width="180" />
                    <el-table-column prop="time" label="申请时间" width="180" />
                    <el-table-column prop="id" label="文件ID" width="180" />
                    <el-table-column label="状态" width="135">
                        <!--作用域插槽-->
                        <template #default="scope">
                            {{
                                scope.row.status == 1 ? '没被申请' : scope.row.status == 2 ? '正在申请中' : scope.row.status == 3 ?
                                    '申请被拒绝' : scope.row.status == 4 ? '可用不可转发' :
                                        scope.row.status == 5 ? '可用可转发' : ""
                            }}
                        </template>
                    </el-table-column>

                    <el-table-column label="">
                        <template v-slot="scope">
                            <div style="display: flex;">
                                <div v-html="scope.row.address"></div>
                                <el-button style="margin-left: 20px"
                                    v-if="scope.row.status == 4 || scope.row.status == 5" type="success"
                                    @click="download(scope.row)">下载</el-button>

                                <el-button style="margin-left: 20px" v-if="scope.row.status == 5" type="warning"
                                    @click=" dialogFormVisible = true; fd(scope.row); currentRow = scope.row;">添加</el-button>



                                <el-button style="margin-left: 20px" type="primary"
                                    @click="getFileById(scope.row)">查看</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>

        <el-dialog v-model="dialogFormVisible" title="修改文件名称" width="500">
            <el-form :model="form">
                <el-form-item label="新的文件名称" :label-width="formLabelWidth">
                    <el-input v-model="fileDetails.fileName" autocomplete="off" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="add(currentRow); dialogFormVisible = false">
                        提交
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <el-card class="box-card" style="margin-top: 20px">
            <template #header>
                <div class="card-header">
                    <h3 style="text-align: center;">申请信息</h3>
                    <!--                    <el-button class="button" text>Operation button</el-button>-->
                </div>
            </template>
            <div>
                <el-table :data="tableData2" style="width: 100%">
                    <el-table-column prop="applyOwner" label="申请节点" width="180" />
                    <el-table-column prop="fileName" label="文件名称" width="180" />

                    <el-table-column label="">
                        <template v-slot="scope">
                            <div style="display: flex; flex-direction: column;">
                                <!-- 第一行按钮：查看、拒绝、删除 -->
                                <el-row>
                                    <el-button style="margin-left: 40px" type="primary"
                                        @click="showTable2(scope.row)">查看</el-button>

                                    <el-button style="margin-left: 100px" type="danger"
                                        @click="handleDeleteApply(scope.row)">删除</el-button>

                                    <el-button v-if="scope.row.isHandled == false" style="margin-left: 100px"
                                        type="warning" @click="updateapply(scope.row)">拒绝</el-button>
                                    <!-- 已操作文本 -->
                                    <el-text style="margin-left: 300px" type="success" disabled="true"
                                        v-if="scope.row.isHandled == true">
                                        已操作
                                    </el-text>
                                </el-row>

                                <!-- 第二行按钮：仅授权可用、可用可转发 -->
                                <el-row v-if="scope.row.isHandled == false"
                                    style="margin-top: 10px; align-items: center;">
                                    <!-- 第一个深灰色框 -->
                                    <div
                                        style="margin-left: 30px; display: flex; align-items: center; border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: #f5f5f5;">

                                        <el-button :loading="isPermissionLoading" :disabled="permissionGenerated"
                                            style="margin-right: 10px" type="primary"
                                            @click="handlePermissionGenerated">
                                            权限标识生成
                                        </el-button>
                                        <!-- 箭头 -->
                                        <el-icon style="margin-right: 10px;">
                                            <Right />
                                        </el-icon>
                                        <el-button :loading="isPrivacyLoading"
                                            :disabled="!permissionGenerated || privacyTransformed" type="primary"
                                            @click="handlePrivacyTransformed">
                                            隐私变换
                                        </el-button>

                                    </div>

                                    <!-- 向右的箭头 -->
                                    <el-icon style="margin: 0 20px; font-size: 20px; color: #888;">
                                        <Right />
                                    </el-icon>

                                    <!-- 第二个深灰色框 -->
                                    <div
                                        style="display: flex; align-items: center; border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: #f5f5f5;">
                                        <el-button style="margin-right: 10px" type="warning"
                                            :disabled="!privacyTransformed" @click="updateapply2(scope.row)">
                                            仅授权可用
                                        </el-button>
                                        <el-button type="success" :disabled="!privacyTransformed"
                                            @click="updateapply3(scope.row)">
                                            可用可转发
                                        </el-button>
                                    </div>


                                </el-row>


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
