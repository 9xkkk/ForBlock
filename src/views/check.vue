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
    ElUpload,
    ElMessageBox,
    ElInput,
    ElRadioGroup,
    ElRadio,
    ElDescriptions,
    ElDescriptionsItem,
    ElDialog,
    ElLoading

} from 'element-plus';
import axios from 'axios'

const fileList = []
const radio = ref('')
const sender = ref('')
const receiver = ref('')
const time = ref('')
const variety = ref('')
const status = ref('')
const dialogVisible = ref(false) // 控制对话框显示隐藏
const showline = ref(false) // 控制线条显示隐藏

const tableData2 = ref([])
const type = ref('')
const hash = ref("")
const finger = ref("")

const filedata = ref({})

const link = ref('')
const link2 = ref('')
const checkdata = ref([])

const isLegal = ref(false)
const sourceNode = ref('') //链上追溯选的节点
const fingerNode = ref('') //上传的文件提取出来的指纹
let node = ref([])


let brr = ref([])

const handleAvatarSuccess = (response, uploadFile) => {
    console.log(response, uploadFile)


}
const handleRemove = (file, uploadFiles) => {
    console.log(file, uploadFiles)

}
const handleClose = (done) => {
    dialogVisible.value = false
}

//上传文件
const beforeUpload = (file) => {
    console.log('111');
    axios.post("/verify/upload2", {
        "FileVerify": file
    }, {
        //表单类型
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
        console.log(res);
        type.value = res.data.type
        console.log(type);

        ElMessage({
            message: '上传成功',
            type: 'success',
        })
    }).catch(err => {
        ElMessage({
            message: '上传失败',
            type: 'warning',
        })
    })

}
//提取指纹
const fingerprints = () => {

    //组件loading
    const loading = ElLoading.service({
        lock: true,
        text: '正在提取中',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    // 延迟关闭loading
    setTimeout(() => {
        loading.close()
    }, 3000)

    axios.get(`/verify/fingerprint/${type.value}`).then(res => {
        console.log(res);    // 如果请求成功，打印响应对象以查看服务器返回的数据
        hash.value = res.data.filetxHash  // 从响应数据中提取 'filetxHash' 属性，并更新响应式变量 `hash` 的值
        finger.value = res.data.fingerprint  // 从响应数据中提取 'fingerprint' 属性，并更新响应式变量 `finger` 的值

    })
}



//链上追溯
const trace = () => {

    axios.get(`/verify/traceback/${hash.value}/${radio.value}`).then(res => {
        console.log('获取的数据：', res)

        filedata.value = JSON.stringify(res.data.applydatalist) // 将服务器返回的 filedata 数据转换为 JSON 字符串并更新响应式变量 filedata
        // 追溯数据
        checkdata.value = res.data.checkdata
        //选择的节点
        sourceNode.value = res.data.sourceNode
        //上传的文件提取出来的指纹
        fingerNode.value = res.data.fingerprintNode
        //是否合法
        isLegal.value = res.data.isLegal

        //对checkdata按时间排序
        brr = checkdata.value

        brr.sort((a, b) => {
            const TimeA = new Date(a[2]);
            const TimeB = new Date(b[2]);
            return TimeB - TimeA;
        })
        console.log('追溯数据排序后：', brr)

        // 共享类型
        for (let i = 0; i < brr.length; i++) {
            if (brr[i][3] == 5) {
                brr[i][3] = '可用可转发'
            } else {
                brr[i][3] = '可用不可转发'
            }
        }

        // 定义两个数组用于存储发送者和接收者的节点
        let result = [];
        let tmp = [];
        let senders = brr.map(item => item[0]);
        let receivers = brr.map(item => item[1]);
        // 找到追溯链条的起始节点（发送者），即不在接收者列表中的发送者
        let start = senders.find(sender => !receivers.includes(sender));//起始节点
        result.push(start) // 将起始节点添加到结果中

        // 递归查找接收者
        const findReceiver = (sender) => {
            for (let i = 0; i < brr.length; i++) {
                if (brr[i][0] === sender) {
                    const receiver = brr[i][1];
                    if (!result.includes(receiver)) {//节点不重复出现
                        // console.log(i)
                        tmp.push({ name: receiver, status: brr[i][3] })
                        result.push(receiver);
                        findReceiver(receiver);
                    }
                    // result.push(arr[i][1]);
                    //findReceiver(arr[i][1]);
                }
            }
        };
        findReceiver(start) // 从起始节点开始递归追踪接收者
        console.log('追溯链条：')
        console.log(result) //包含所有节点
        console.log(tmp) //所有节点去掉头节点，及状态
        console.log(start) //头节点
        showline.value = true

        // 绘制节点连线图
        const cy = 100; // 节点的垂直位置 (y 坐标)
        const newNodeCy = 250; // 新节点的垂直位置 (y 坐标)
        const circleRadius = 30; // 节点的半径

        // 计算每个节点的x坐标，确保水平排列
        const getNodeX = (index) => 550 + index * 150;

        // 用于连线的x坐标计算
        const getIndex = (node) => result.indexOf(node);

        // 定义 SVG 中显示的节点和连线 
        let svgContent = result.map((node, index) => {
            // 计算节点的坐标
            const x = getNodeX(index);
            const y = cy;

            // 根据节点值选择颜色
            let fillColor = 'lightblue'; // 默认颜色
            if (node === sourceNode.value && node === fingerNode.value) {
                fillColor = 'yellow';
            }
            else if (node === sourceNode.value) {
                fillColor = 'orange';
            } else if (node === fingerNode.value) {
                fillColor = 'lightgreen';
            }

            // 返回节点的 SVG 圆形和文字
            return `
            <circle cx="${x}" cy="${y}" r="${circleRadius}" fill="${fillColor}"  />
            <text x="${x}" y="${y}" dy="5" text-anchor="middle" font-size="16">${node}</text>`;
        }).join('');

        // 添加 sourceNode 节点，如果它的值在 result 中不存在
        if (sourceNode.value && !result.includes(sourceNode.value) && sourceNode.value !== 'F') {
            const newNodeX = 700; // 新节点的x坐标

            // 绘制节点
            svgContent += `
                <circle cx="${newNodeX}" cy="${newNodeCy}" r="${circleRadius}" fill="orange"  />
                <text x="${newNodeX}" y="${newNodeCy}" dy="5" text-anchor="middle" font-size="16">${sourceNode.value}</text>`;
        }

        // 查找某个节点的状态
        const getNodeStatus = (node) => {
            const tmpNode = tmp.find(item => item.name === node);
            return tmpNode ? tmpNode.status : null;
        };

        // 绘制节点之间的连线
        let arrowLines = brr.map((row, index) => {
            // 第一个节点前面没有连线，跳过
            if (index === 0) return '';
            console.log('目前所有节点：', row)
            // 找到对应的两个节点的索引
            const x1 = getNodeX(getIndex(row[0]));
            const x2 = getNodeX(getIndex(row[1]));

            // 根据目标节点的状态设置线条颜色
            const status = getNodeStatus(row[1]);

            let lineColor = "black"; // 默认黑色

            if (status === '可用可转发') {
                lineColor = "green"; // 可用可转发 -> 绿色
            } else if (status === '可用不可转发') {
                lineColor = "orange"; // 可用不可转发 -> 黄色
            }

            // 调整节点之间的连线，避免箭头挡住圆形
            const offsetX = circleRadius; // 假设圆的半径为 30，缩短 30 个单位
            const adjustedX1 = x1 + offsetX; // 起点稍微往右移
            const adjustedX2 = x2 - offsetX - 10; // 终点稍微往左移

            // 返回调整后的箭头线
            return `
            <line x1="${adjustedX1}" y1="${cy}" x2="${adjustedX2}" y2="${cy}" stroke="${lineColor}" stroke-width="2" marker-end="url(#arrow-${x1}-${x2}-${lineColor})" />
            <defs>
                <marker id="arrow-${x1}-${x2}-${lineColor}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L10,5 L0,10 Z" fill="${lineColor}" />
                </marker>
            </defs>`;
        }).join('');

        // 添加 sourceNode 和 fingerNode 之间的连线（如果两个节点不重合）
        let sourceX, sourceY;
        const fingerX = getNodeX(getIndex(fingerNode.value)); // fingerNode 的 x 坐标
        const fingerY = 100; // fingerNode 的 y 坐标固定为 100

        // 如果 sourceNode 在 result 里，通过 getNodeX 获取 x 坐标，否则设定为 350
        if (result.includes(sourceNode.value)) {
            sourceX = getNodeX(getIndex(sourceNode.value)); // sourceNode 在 result 里的 x 坐标
            sourceY = cy; // 在 result 里的 y 坐标为 100
        } else {
            sourceX = 700; // 不在 result 里的 sourceNode 坐标
            sourceY = newNodeCy;
        }

        // 添加矩形框
        const boxWidth = 500; // 设置矩形框的宽度
        const boxHeight = 250; // 设置矩形框的高度
        // 计算框的位置（假设从最左上角开始框住节点）
        const boxX = 450; 
        const boxY = 50; 

        // 在 SVG 中添加虚线框和 "联盟链内" 文字
        svgContent += `
        <!-- 矩形虚线框 -->
        <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" 
            stroke="black" stroke-width="2" fill="none" stroke-dasharray="5,5" />

        <!-- "联盟链内" 标识 -->
        <text x="${boxX + boxWidth - 10}" y="${boxY + boxHeight - 10}" 
            text-anchor="end" font-size="16" fill="black">
            联盟链内
        </text>`;

        // 添加链外节点
        const outerCircleRadius = 20; // 圆形半径
        const triangleOffsetX = boxX + boxWidth + 100; // 三角形的x位置偏移
        const triangleOffsetY = boxY + boxHeight / 2; // 三角形的y位置偏移
        const triangleHeight = 60; // 等边三角形的边长

        // 计算三个点的位置
        const circle1X = triangleOffsetX;
        const circle1Y = triangleOffsetY - triangleHeight / 2;

        const circle2X = triangleOffsetX - (triangleHeight / 2);
        const circle2Y = triangleOffsetY + (triangleHeight / 2);

        const circle3X = triangleOffsetX + (triangleHeight / 2);
        const circle3Y = triangleOffsetY + (triangleHeight / 2);

        // 在 SVG 中添加三个链外节点圆形和 "链外节点" 标识
        svgContent += `
        <!-- 链外节点圆形和 * 标识 -->
        <circle cx="${circle1X}" cy="${circle1Y}" r="${outerCircleRadius}" fill="black" />
        <text x="${circle1X}" y="${circle1Y + 5}" text-anchor="middle" font-size="16" fill="white">*</text>

        <circle cx="${circle2X}" cy="${circle2Y}" r="${outerCircleRadius}" fill="black" />
        <text x="${circle2X}" y="${circle2Y + 5}" text-anchor="middle" font-size="16" fill="white">*</text>

        <circle cx="${circle3X}" cy="${circle3Y}" r="${outerCircleRadius}" fill="black" />
        <text x="${circle3X}" y="${circle3Y + 5}" text-anchor="middle" font-size="16" fill="white">*</text>`;

        // 添加finger到source的箭头线
        if (!isLegal.value && sourceNode.value !== fingerNode.value) {
            const arrowColor = "red"; // 根据 isLegal.value 设置颜色
            let fingerAdjustedX, fingerAdjustedY, sourceAdjustedX, sourceAdjustedY;
            // 调整连接线的起点和终点
            if (sourceNode.value === 'F') {
                fingerAdjustedX = fingerX + 30;
                fingerAdjustedY = fingerY;
                sourceAdjustedX = boxX + boxWidth + 40; //链外节点
                sourceAdjustedY = boxY + boxHeight / 2;
            } else {
                fingerAdjustedX = fingerX;
                fingerAdjustedY = fingerY + 30;
                sourceAdjustedX = sourceX;
                sourceAdjustedY = sourceY - 40;
            }
            console.log("fingerAdjustedX:", fingerAdjustedX);
            console.log("sourceAdjustedX:", sourceAdjustedX);

            // 添加指向线
            arrowLines += `
            <line x1="${fingerAdjustedX}" y1="${fingerAdjustedY}" x2="${sourceAdjustedX}" y2="${sourceAdjustedY}" stroke="${arrowColor}" stroke-width="2" marker-end="url(#arrow-${fingerX}-${sourceX}-${arrowColor})"/>
            <defs>
                <marker id="arrow-${fingerX}-${sourceX}-${arrowColor}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L10,5 L0,10 Z" fill="${arrowColor}" />
                </marker>
            </defs>`;
        }

        // 添加图例
        const legendX = 50;  //图例最左边坐标
        const legendY = 80; // 图例最上边坐标
        const legendSpacing = 30; // 图例项之间的垂直间距
        const circleLegendRadius = 10; // 图例中的圆形半径
        // 添加图例框
        const legendBoxWidth = 200; // 图例框的宽度
        const legendBoxHeight = legendSpacing * 8 + 30; // 图例框的高度，包含标题和内容
        const legendBoxX = legendX - 30; // 框的x位置，略微向左偏移
        const legendBoxY = legendY - 40; // 框的y位置，略微向上偏移

        // // 绘制图例背景框
        // svgContent += `
        // <rect x="${legendBoxX}" y="${legendBoxY}" width="${legendBoxWidth}" height="${legendBoxHeight}" fill = "white" stroke="gray" stroke-width="2" rx="10" ry="10" />`;

        // // 添加图例标题
        // svgContent += `
        // <!-- 图例标题 -->
        // <text x="${legendX - 10}" y="${legendY - 20}" font-size="16" fill="black" text-anchor="start">图例</text>`;

        // 普通链内节点 - 淡蓝色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY}" r="${circleLegendRadius}" fill="lightblue" />
        <text x="${legendX + 30}" y="${legendY + 5}" font-size="14" fill="black" text-anchor="start">普通链内节点</text>`;

        // 文件水印节点 - 淡绿色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY + legendSpacing}" r="${circleLegendRadius}" fill="lightgreen" />
        <text x="${legendX + 30}" y="${legendY + legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">文件水印节点</text>`;

        // 追溯节点 - 橙色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY + 2 * legendSpacing}" r="${circleLegendRadius}" fill="orange" />
        <text x="${legendX + 30}" y="${legendY + 2 * legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">追溯节点</text>`;

        // 水印及追溯节点 - 黄色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY + 3 * legendSpacing}" r="${circleLegendRadius}" fill="yellow" />
        <text x="${legendX + 30}" y="${legendY + 3 * legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">水印及追溯节点</text>`;

        // 链外节点 - 黑色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY + 4 * legendSpacing}" r="${circleLegendRadius}" fill="black" />
        <text x="${legendX + 30}" y="${legendY + 4 * legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">链外节点</text>`;

        // 可用可转发线 - 绿色
        const availableLineY = legendY + 5 * legendSpacing;
        svgContent += `
        <line x1="${legendX}" y1="${availableLineY}" x2="${legendX + 20}" y2="${availableLineY}" stroke="green" stroke-width="2" />
        <text x="${legendX + 60}" y="${availableLineY + 5}" font-size="14" fill="black" text-anchor="start">可用可转发</text>
        <line x1="${legendX + 20}" y1="${availableLineY}" x2="${legendX + 40}" y2="${availableLineY}" stroke="green" stroke-width="2" marker-end="url(#arrow-green)" />`;

        // 可用不可转发线 - 黄色
        const unavailableLineY = legendY + 6 * legendSpacing;
        svgContent += `
        <line x1="${legendX}" y1="${unavailableLineY}" x2="${legendX + 20}" y2="${unavailableLineY}" stroke="orange" stroke-width="2" />
        <text x="${legendX + 60}" y="${unavailableLineY + 5}" font-size="14" fill="black" text-anchor="start">可用不可转发</text>
        <line x1="${legendX + 20}" y1="${unavailableLineY}" x2="${legendX + 40}" y2="${unavailableLineY}" stroke="orange" stroke-width="2" marker-end="url(#arrow-orange)" />`;

        // 非法线 - 红色
        const illegalLineY = legendY + 7 * legendSpacing;
        svgContent += `
        <line x1="${legendX}" y1="${illegalLineY}" x2="${legendX + 20}" y2="${illegalLineY}" stroke="red" stroke-width="2" />
        <text x="${legendX + 60}" y="${illegalLineY + 5}" font-size="14" fill="black" text-anchor="start">非法</text>
        <line x1="${legendX + 20}" y1="${illegalLineY}" x2="${legendX + 40}" y2="${illegalLineY}" stroke="red" stroke-width="2" marker-end="url(#arrow-red)" />`;

        // 添加箭头定义
        svgContent += `
        <defs>
            <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6 Z" fill="green" />
            </marker>
            <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6 Z" fill="orange" />
            </marker>
            <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6 Z" fill="red" />
            </marker>
        </defs>`;

        // 将生成的 SVG 内容插入到页面中
        document.getElementById('svg-container').innerHTML = `
        <svg width="1400" height="400">
            
        ${svgContent}
        ${arrowLines}
        </svg>`;
    });
}
</script>


<template>
    <div class="check">

        <el-dialog v-model="dialogVisible" title="文件详细信息" width="40%" :before-close="handleClose">
            <div>
                <el-input type="textarea" v-model="filedata" disabled />
            </div>
        </el-dialog>


        <el-card>
            <div class="header">
                <div style="display: flex;justify-content: center;">
                    <el-upload v-model:file-list="fileList" class="upload-demo" action="" :limit="1"
                        style="display: flex;width: 500px;" :on-success="handleAvatarSuccess" :on-remove="handleRemove"
                        :before-upload="beforeUpload" :on-preview="handlePreview">
                        <el-button type="primary">上传文件</el-button>
                    </el-upload>
                </div>
                <div style="display: flex;justify-content: center;margin: 16px 0;">
                    <div style="width: 500px;display: flex;">
                        <el-button type="success" @click="fingerprints()">提取指纹</el-button>
                        <el-input style="width: 300px;margin-left: 20px" v-model="finger"></el-input>
                    </div>
                </div>
                <div style="display: flex;justify-content: center;margin: 16px 0;">
                    <div style="width: 500px;display: flex;">
                        <el-button type="warning" @click="trace()" :disabled="!radio">链上追溯</el-button>
                        <el-radio-group class="ml-4" style="margin-left: 20px;" v-model="radio">
                            <el-radio label="A">A</el-radio>
                            <el-radio label="B">B</el-radio>
                            <el-radio label="C">C</el-radio>
                            <el-radio label="D">D</el-radio>
                            <el-radio label="E">E</el-radio>
                            <el-radio label="F">公开</el-radio>
                        </el-radio-group>
                    </div>
                </div>

            </div>
        </el-card>


        <div v-show="showline == true" style="height: 350px;">

            <!-- 这里的节点连线图将插入到这个 div 中 -->
            <div id="svg-container" class="svg-center"></div>
        </div>


        <div class="con" style="display: flex;justify-content: center;align-items: center;" v-for="(item, index) in brr"
            :key="item[2]">

            <el-card style="width: 100%;padding: 0 25%;">
                <el-descriptions :column="2" size="large" class="mt-4" style="display: flex;justify-content: center;">
                    <el-descriptions-item width="200px" label="发送方">{{ item[0] }}</el-descriptions-item>

                    <el-descriptions-item width="200px" label="时间">{{ item[2] }}</el-descriptions-item>

                    <el-descriptions-item width="200px" label="接收方">{{ item[1] }}</el-descriptions-item>

                    <el-descriptions-item width="200px" label="共享类型">
                        {{ item[3] }}
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>

        </div>
        <div class="button">
            <el-button type="success" @click="dialogVisible = true" plain>文件详细信息</el-button>
        </div>
    </div>
</template>



<style lang="scss">
.check {
    height: 100%;
    width: 100%;

    .header {
        /*display: flex;*/
        justify-content: center;
    }

    .el-upload-list {
        width: 300px !important;
    }

    .con {
        width: 100%;
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
    }

    .el-descriptions__label {
        font-size: 20px !important;
        font-weight: bold;
    }

    .button {
        text-align: center;
        margin-top: 20px;

    }

    .large-text {
        font-size: 30px;
    }

    .custom-dot {
        width: 22px;
        height: 22px;
        background-image: url(../images/图片4.png);
        background-size: cover;
        //     width: 22px;
        // height: 22px;
        // background-color: black;
        // border-radius: 50%;
        // display: inline-block;
    }

    //     .custom-arrow1, .custom-arrow2.custom-arrow3 {
    //     display: inline-block;
    //     width: 180px;
    //     height: 20px;
    // }

    .custom-arrow1 {
        width: 185px;
        height: 22px;
        background-image: url(../images/green.jpg);
        background-size: cover;
        display: inline-block;
        background-position: right;
        //     border-left: 2px solid green;
        // border-top: 2px solid green;
        // transform: rotate(45deg);
    }

    .custom-arrow2 {
        width: 185px;
        height: 22px;
        background-image: url(../images/yellow.jpg);
        background-size: cover;
        display: inline-block;
        background-position: right;
        //     border-left: 2px solid yellow;
        // border-top: 2px solid yellow;
        // transform: rotate(45deg);
    }

    .custom-arrow3 {
        width: 185px;
        height: 22px;
        background-image: url(../images/red.jpg);
        background-size: cover;
        display: inline-block;
        background-position: right;
        //     border-left: 2px solid red;
        // border-top: 2px solid red;
        // transform: rotate(45deg);
    }

    .custom-space {
        width: 185px;
        height: 30px;
        background-image: url(../images/space.jpg);
        background-size: cover;
        display: inline-block;
        background-position: right;
        // margin: 0 10px;
    }

    .node-tag {
        font-size: 20px;
        color: red;
        margin-top: 5px;
        display: block;
    }

    .svg-center {
        display: flex;
        justify-content: center;
        /* 水平居中 */
    }


}
</style>
