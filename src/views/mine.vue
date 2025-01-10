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
    ElPopover,
    SCOPE
} from 'element-plus';
import emitter from '../plugins/bus.js';

const tableData = ref([]) //我的申请
const tableData2 = ref([]) //申请信息
const tableData3 = ref([]) //我的文件

const fileVisible = ref(false)
const node = ref('')

const isPermissionLoading = ref(false); // 加载动画状态 - 权限标识生成
const isPrivacyLoading = ref(false); // 加载动画状态 - 隐私变换
let yes1 = ref(false);
let yes2 = ref(true);
let yes3 = ref(true);
let loading = ref(false); // 加载动画状态 
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
const selectAuthority = ref(false); // 隐私变换完成状态
let currentStatus = ref(null);  // 用来存储传递的 status
const inputBudget = ref('');

// // 缓存权限标识的辅助函数
// const cacheAuthorityId = (rowId, authorityId) => {
//     const cachedAuthorities = JSON.parse(localStorage.getItem("authorityIds")) || {};
//     cachedAuthorities[rowId] = authorityId;
//     localStorage.setItem("authorityIds", JSON.stringify(cachedAuthorities));
// };



const dialogFormVisible = ref(false)
const form = reactive({
    newFileName: '',
})
const formLabelWidth = '140px'

const currentRow = ref(null);

const checkFile = reactive({
    fileOwner: "",
    time: "",
    id: "",
    fileName: "",
    txHash: "",
    fingerPrint: "",
    privacyBudget: "",

    // applyOwner: ""
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
    console.log('查看', item);
    checkFile.fileOwner = item.fileOwner
    checkFile.fileName = item.fileName
    checkFile.applyOwner = item.applyOwner
    checkFile.id = item.id
    checkFile.fingerPrint = item.fingerPrint
    checkFile.privacyBudget = item.privacyBudget
    checkFile.time = item.time
    checkFile.txHash = item.txHash
    // if (item.status == 1) {
    //     checkFile.status = '是'
    // } else {
    //     checkFile.status = '否'
    // }
    fileVisible.value = true

}

//增加了根据id向后端查询文件信息的函数
const getFileById = (row) => {

    // console.log(row);
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

        // 从 localStorage 中加载权限标识
        const cachedAuthorities = JSON.parse(localStorage.getItem("authorityIds")) || {};
        tableData2.value.forEach(row => {
            if (cachedAuthorities[row.id]) {
                row.authorityId = cachedAuthorities[row.id];
            }
        });

        // // 合并 authorityCache 中的 authorityId
        // tableData2.value = res.data.applylist.map(item => {
        //     if (authorityCache[item.id]) {
        //         return { ...item, authorityId: authorityCache[item.id] };
        //     }
        //     return item;
        // });


        console.log('申请信息', res.data.applylist);
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

// 统一的状态更新函数
const updateStatus = (row, status, successMessage, isHandled) => {
    yes1.value = true;
    yes2.value = false; 
    // loading.value = true;
    console.log('STATUS:', status);
    // formData.set('status', status)
    axios.put(`/myfile/update/${row.id}/${row.applyOwner}/${row.fileOwner}/${status}`)
        .then(res => {
            console.log(`状态更新为 ${status} 成功`, res);
            // 更新前端表格数据的状态
            const rowIndex = tableData2.value.findIndex(item => item.id === row.id);
            if (rowIndex !== -1) {
                tableData2.value[rowIndex].status = status;  // 更新状态
                if (isHandled) {
                    tableData2.value[rowIndex].isHandled = true;  // 只有拒绝时，设置为已处理
                }
            }
            ElMessage.success(successMessage);
            // 模拟加载结束，2秒后关闭加载状态
            // setTimeout(() => {
            //     loading.value = false;  // 隐藏加载框

            // }, 2000);
        })
        .catch(err => {
            console.error(`操作失败`, err);
            const rowIndex = tableData2.value.findIndex(item => item.id === row.id);
            if (rowIndex !== -1) {
                tableData2.value[rowIndex].status = status;  // 更新状态
                if (isHandled) {
                    tableData2.value[rowIndex].isHandled = true;  // 只有拒绝时，设置为已处理
                }
            }
            // 模拟加载结束，2秒后关闭加载状态
            // setTimeout(() => {
            //     loading.value = false;  // 隐藏加载框

            // }, 2000);
            // ElMessage.error('操作失败，请重试');
        });
};

// 拒绝操作
const updateapply = (row) => {
    const status = 3;  // 拒绝状态
    console.log('更新申请状态--拒绝', row);
    updateStatus(row, status, '申请拒绝成功', true);  // 只有拒绝时，设置为已处理
};

// 授权操作
const updateapply2 = (row) => {
    const status = 4;  // 授权亦可用状态
    // currentStatus.value = status;  // 将状态存储到 currentStatus 中
    // yes1.value = true;
    // yes2.value = false;
    updateStatus(row, status, '仅授权可用操作成功', false);
};

// 可用可转发操作
const updateapply3 = (row) => {
    const status = 5;  // 可用可转发状态
    // currentStatus.value = status;  // 将状态存储到 currentStatus 中
    // yes1.value = true;
    // yes2.value = false;
    updateStatus(row, status, '可用可转发操作成功', false);
};

// 权限标识生成处理逻辑（使用统一的 status 更新方法）
const handlePermissionGenerated = (row) => {

    isPermissionLoading.value = true; // 开始加载动画

    // updateStatus(row, status, '操作成功');
    // 停止加载动画
    isPermissionLoading.value = false;

    yes2.value = true; //本标识禁用
    yes3.value = false; //下一个可用
    getData(); // 获取最新数据
    // location.reload();
};

// 隐私变换处理逻辑
const handlePrivacyTransformed = (row, inputBudget) => {
    isPrivacyLoading.value = true; // 开始加载动画
    axios.put(`/myfile/privacy/${row.id}/${row.applyOwner}/${row.fileOwner}/${inputBudget}`)
        .then(res => {
            console.log(`隐私预算为 ${inputBudget} `, res);
            // 更新前端表格数据的状态
            const rowIndex = tableData2.value.findIndex(item => item.id === row.id);
            if (rowIndex !== -1) {
                tableData2.value[rowIndex].isHandled = true; // 设置为已处理
            }
            // 停止加载动画
            isPrivacyLoading.value = false;

            ElMessage.success('操作成功');
            getData();
            // location.reload();
        })
        .catch(err => {
            getData(); // 即使失败，也拉取最新的数据
            isPrivacyLoading.value = false;
            const rowIndex = tableData2.value.findIndex(item => item.id === row.id);
            if (rowIndex !== -1) {
                tableData2.value[rowIndex].isHandled = true; // 设置为已处理
            }
            console.error('操作失败', err);
            // ElMessage.error('操作失败，请重试');
        });
};

//文件下载
const download = (row) => {
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

//下载原文件
const downloadOrigin = (row) => {
    const filename = row.fileName
    //const fileowner = row.fileOwner
    axios({
        url: `myfile/downloadlocal/${filename}`,
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
//下载变换文件
const downloadTransformed = (row) => {
    const filename = row.fileName
    console.log('下载变换文件', row);
    const fileowner = row.fileOwner
    const applyOwner = row.applyOwner
    axios({
        url: `myfile/download/transformed/${filename}/${fileowner}/${applyOwner}`,

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
        
    })
    add(row);
}

//添加
const add = (row) => {
    axios.get(`myfile/download/${row.fileName}/${row.fileOwner}`, {
        responseType: 'blob'
    }).then(response => {
        const file = new File([response.data], fileDetails.value.fileName, { type: response.data.type });
        console.log('文件名称：', fileDetails.value.name);

        axios.post("myfile/addfile", {
            "f1": file,
            "name": fileDetails.value.name, // 确保使用 fileDetails.value
            "description": fileDetails.value.description,
            "size": fileDetails.value.size,
            "file_id": fileDetails.value.id, // 使用 fileDetails.value.id
            "status": 1
        }, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            console.log('点击添加，这是文件名称', fileDetails.value.name);
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
                    <div style="width: 18%;">权限标识:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.fingerPrint" disabled></el-input>
                    </div>
                </div>
                <!-- <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">是否可转发:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.status" disabled></el-input>
                    </div>
                </div> -->
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">区块链哈希:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.txHash" type="textarea" resize="none"
                            :autosize="{ minRows: 2, maxRows: 2 }" disabled></el-input>
                    </div>
                </div>
                <div style="display: flex;width: 90%;align-items: center;margin-bottom: 16px;">
                    <div style="width: 18%;">隐私预算:</div>
                    <div style="width: 82%;">
                        <el-input v-model="checkFile.privacyBudget" disabled></el-input>
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
                                <!-- <div>状态: {{ scope.row.status }}</div>
                                <div>已处理: {{ scope.row.isHandled }}</div> -->
                                <el-button style="margin-left: 20px"
                                    v-if="scope.row.isHandled && (scope.row.status == 4 || scope.row.status == 5) " type="success"
                                    @click="download(scope.row)">下载</el-button>

                                <!-- <el-button style="margin-left: 20px" v-if="scope.row.status == 5" type="warning"
                                    @click=" fd(scope.row); currentRow = scope.row;">添加</el-button> -->



                                <el-button style="margin-left: 20px" type="primary"
                                    @click="getFileById(scope.row)">查看</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>

        <!-- <el-dialog v-model="dialogFormVisible" title="修改文件名称" width="500">
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
        </el-dialog> -->

        <el-card class="box-card" style="margin-top: 20px">
            <template #header>
                <div class="card-header">
                    <h3 style="text-align: center;">申请信息</h3>
                    <!--                    <el-button class="button" text>Operation button</el-button>-->
                </div>
            </template>
            <div>
                <el-table :data="tableData2" style="width: 100%" v-loading="loading" element-loading-text="Loading..."
                    :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50"
                   >
                    <el-table-column prop="applyOwner" label="申请节点" width="100" />
                    <el-table-column prop="fileName" label="文件名称" width="180" />
                    <el-table-column prop="fingerPrint" label="权限标识" width="180" />
                    <el-table-column prop="privacyBudget" label="隐私预算" width="100" />

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
                                    <el-button v-if="scope.row.status != 3 && scope.row.isHandled == true" style="margin-left: 100px"
                                        type="success" @click="downloadOrigin(scope.row)">下载原文件</el-button>
                                    <el-button v-if="scope.row.status != 3 && scope.row.isHandled == true" style="margin-left: 100px"
                                        type="success" @click="downloadTransformed(scope.row)">下载变换后文件</el-button>
                                    <!-- 已操作文本 -->
                                    <el-text style="margin-left: 100px" type="success" disabled="true"
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

                                        <el-button style="margin-right: 10px" type="warning" :disabled="yes1"
                                            @click="updateapply2(scope.row)">
                                            仅授权可用
                                        </el-button>
                                        <el-button type="success" :disabled="yes1" @click="updateapply3(scope.row)">
                                            可用可转发
                                        </el-button>

                                    </div>

                                    <!-- 向右的箭头 -->
                                    <el-icon style="margin: 0 10px; font-size: 20px; color: #888;">
                                        <Right />
                                    </el-icon>

                                    <!-- 第二个深灰色框 -->
                                    <!-- <div
                                        style="display: flex; align-items: center; border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: #f5f5f5;"> -->
                                    <el-button :loading="isPermissionLoading" :disabled="yes2"
                                        style="margin-right: 10px" type="primary"
                                        @click="handlePermissionGenerated(scope.row)">
                                        权限标识生成
                                    </el-button>
                                    <!-- 箭头 -->
                                    <!-- 向右的箭头 -->
                                    <el-icon style="margin: 0 10px; font-size: 20px; color: #888;">
                                        <Right />
                                    </el-icon>

                                    <!-- <span>隐私预算：</span> -->
                                    <el-input v-model="inputBudget" style="width: 120px" placeholder="输入隐私预算" />
                                    <!-- </div> -->

                                    <!-- 向右的箭头 -->
                                    <el-icon style="margin: 0 10px; font-size: 20px; color: #888;">
                                        <Right />
                                    </el-icon>

                                    <el-button :loading="isPrivacyLoading" :disabled="yes3" type="danger"
                                        @click="handlePrivacyTransformed(scope.row, inputBudget)">
                                        隐私变换和标识嵌入
                                    </el-button>
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
.example-showcase .el-loading-mask {
  z-index: 9;
}
</style>
