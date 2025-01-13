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
    console.log('上传文件');
    axios.post("/verify/upload2", {
        "FileVerify": file
    }, {
        //表单类型
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
        // console.log(res);
        type.value = res.data.type
        // console.log(type);

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

    axios.get(`/verify/fingerprint/${type.value}`).then(res => {

        hash.value = res.data.filetxHash  // 从响应数据中提取 'filetxHash' 属性，并更新响应式变量 `hash` 的值
        finger.value = res.data.fingerprint  // 从响应数据中提取 'fingerprint' 属性，并更新响应式变量 `finger` 的值
        loading.close()

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
            console.log('共享类型，若是5，可用可转发，否则可用不可转发：', brr[i][3])
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
                }
            }
        };
        findReceiver(start) // 从起始节点开始递归追踪接收者
        console.log('追溯链条：')
        console.log(result) //包含所有节点
        console.log(tmp) //所有节点去掉头节点，及状态
        console.log(start) //头节点
        showline.value = true
        console.log('brr数组第一位：', brr[0])

        const realBrr = Array.from(brr);
        console.log("Converted array:", realBrr);

        // 绘制节点连线图
        // 定义五边形中心和半径
        const centerX = 700; // 五边形的中心 x 坐标
        const centerY = 200; // 五边形的中心 y 坐标
        const radius = 100; // 半径

        const circleRadius = 30; // 节点的半径

        const predefinedPositions = [
            { x: centerX + radius * Math.cos(3 * Math.PI / 2), y: centerY + radius * Math.sin(3 * Math.PI / 2) }, // 第一个点（最尖的点，向下）
            { x: centerX + radius * Math.cos(3 * Math.PI / 2 + 2 * Math.PI / 5), y: centerY + radius * Math.sin(3 * Math.PI / 2 + 2 * Math.PI / 5) }, // 第二个点
            { x: centerX + radius * Math.cos(3 * Math.PI / 2 + 4 * Math.PI / 5), y: centerY + radius * Math.sin(3 * Math.PI / 2 + 4 * Math.PI / 5) }, // 第三个点
            { x: centerX + radius * Math.cos(3 * Math.PI / 2 + 6 * Math.PI / 5), y: centerY + radius * Math.sin(3 * Math.PI / 2 + 6 * Math.PI / 5) }, // 第四个点
            { x: centerX + radius * Math.cos(3 * Math.PI / 2 + 8 * Math.PI / 5), y: centerY + radius * Math.sin(3 * Math.PI / 2 + 8 * Math.PI / 5) }  // 第五个点

        ];

        // console.log('预设坐标：', predefinedPositions);
        // 用于连线的x坐标计算
        const getIndex = (node) => result.indexOf(node);

        // 定义 SVG 中显示的节点和连线 
        let svgContent = result.map((node, index) => {
            const { x, y } = predefinedPositions[index]; // 使用当前节点数计算每个节点的坐标
            // 根据节点值选择颜色
            let fillColor = 'lightblue'; // 默认颜色
            if (node === sourceNode.value && node === fingerNode.value) {
                fillColor = 'lightgreen';
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

        let newNodeX = 700; // 默认的 x 坐标
        let newNodeY = 350; // 默认的 y 坐标

        // 添加 sourceNode 节点，如果它的值在 result 中不存在
        if (sourceNode.value && !result.includes(sourceNode.value) && sourceNode.value !== 'F') {
            const newNodeIndex = result.length; // 新节点的索引是当前节点数

            const position = predefinedPositions[newNodeIndex];

            newNodeX = position.x; // 更新 newNodeX
            newNodeY = position.y; // 更新 newNodeY
            // 绘制节点
            svgContent += `
                <circle cx="${newNodeX}" cy="${newNodeY}" r="${circleRadius}" fill="orange"  />
                <text x="${newNodeX}" y="${newNodeY}" dy="5" text-anchor="middle" font-size="16">${sourceNode.value}</text>`;
        }

        // 查找某个节点的状态
        const getNodeStatus = (node) => {
            const tmpNode = tmp.find(item => item.name === node);
            return tmpNode ? tmpNode.status : null;
        };

        // 绘制节点之间的连线
        let arrowLines = realBrr.map((row, index) => {
            // 第一个节点前面没有连线，跳过
            // if (index === 0) return '';
            // console.log('目前所有节点：', row)
            // 找到对应的两个节点的索引
            const node1Index = getIndex(row[0]);
            const node2Index = getIndex(row[1]);

            // 获取节点的坐标
            const { x: x1, y: y1 } = predefinedPositions[node1Index]; // 节点1的坐标
            const { x: x2, y: y2 } = predefinedPositions[node2Index]; // 节点2的坐标

            // 根据目标节点的状态设置线条颜色
            const status = getNodeStatus(row[1]);
            console.log('目标节点状态', status)

            let lineColor = "black"; // 默认黑色

            if (status === '可用可转发') {
                lineColor = "green"; // 可用可转发 -> 绿色
            } else if (status === '可用不可转发') {
                lineColor = "orange"; // 可用不可转发 -> 黄色
            }

            // 调整节点之间的连线，避免箭头挡住圆形
            const dx = x2 - x1; // x方向的差
            const dy = y2 - y1; // y方向的差

            const lineLength = Math.sqrt(dx * dx + dy * dy); // 计算连线的长度
            if (lineLength === 0) {
                console.warn("Nodes are overlapping:", x1, y1, x2, y2);
                return ''; // 节点重叠时，不绘制线条
            }

            // 单位方向向量
            const unit_dx = dx / lineLength;
            const unit_dy = dy / lineLength;

            // 计算调整后的起点和终点,这样算完前后节点坐标就反了，所以就反过来
            const adjustedX1 = x1 + unit_dx * circleRadius; 
            const adjustedY1 = y1 + unit_dy * circleRadius; 
            const adjustedX2 = x2 - unit_dx * circleRadius; 
            const adjustedY2 = y2 - unit_dy * circleRadius; 
            console.log("dx,dy:", {dx, dy});
            console.log("unit_dx,unit_dy:", {unit_dx, unit_dy});
            console.log("边长：", { lineLength});
            console.log("原始坐标：", { x1, y1, x2, y2 });
            console.log("Adjusted coordinates:", { adjustedX1, adjustedY1, adjustedX2, adjustedY2 });


            // 返回调整后的箭头线
            return `
            <line x1="${adjustedX1}" y1="${adjustedY1}" x2="${adjustedX2}" y2="${adjustedY2}" 
                stroke="${lineColor}" stroke-width="2" 
                marker-end="url(#arrow-${x1}-${x2}-${lineColor})" />
        <defs>
            <marker id="arrow-${x1}-${x2}-${lineColor}" markerWidth="10" markerHeight="10" 
                    refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L10,5 L0,10 Z" fill="${lineColor}" />
            </marker>
        </defs>`;
        }).join('');

        // 添加 sourceNode 和 fingerNode 之间的连线（如果两个节点不重合）
        let sourceX, sourceY, fingerX, fingerY;
        const fingerIndex = getIndex(fingerNode.value);
        if (fingerIndex !== -1) {
            const fingerPos = predefinedPositions[fingerIndex];
            fingerX = fingerPos.x;
            fingerY = fingerPos.y;
        }

        // 检查 sourceNode 的位置
        if (result.includes(sourceNode.value)) {
            // 如果 sourceNode 在 result 中，直接获取其位置
            const sourceIndex = getIndex(sourceNode.value);
            const sourcePos = predefinedPositions[sourceIndex];
            sourceX = sourcePos.x;
            sourceY = sourcePos.y;
        } else {
            // 否则使用前面已计算的 newNodeX 和 newNodeY
            sourceX = newNodeX;
            sourceY = newNodeY;
        }

        // 添加矩形框
        const boxWidth = 450; // 设置矩形框的宽度
        const boxHeight = 290; // 设置矩形框的高度
        // 计算框的位置（假设从最左上角开始框住节点）
        const boxX = 500;
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
            const fBegin = 0.15; // 15%
            const cEnd = 0.20; // 31%

            // 计算 dx 和 dy
            const dx = sourceX - fingerX; // 连接线的 x 方向差
            const dy = sourceY - fingerY; // 连接线的 y 方向差
            const lineLength = Math.sqrt(dx * dx + dy * dy); // 计算连线的长度
            fingerAdjustedX = fingerX + (dx / lineLength) * lineLength * fBegin; // 缩短 finger 的 x 坐标
            fingerAdjustedY = fingerY + (dy / lineLength) * lineLength * fBegin; // 缩短 finger 的 y 坐标

            // 调整连接线的起点和终点
            if (sourceNode.value === 'F') {
                fingerAdjustedX = fingerX + 30;
                fingerAdjustedY = fingerY;
                sourceAdjustedX = boxX + boxWidth + 40; //链外节点
                sourceAdjustedY = boxY + boxHeight / 2;
            } else {
                sourceAdjustedX = sourceX - (dx / lineLength) * lineLength * cEnd; // 缩短 source 的 x 坐标
                sourceAdjustedY = sourceY - (dy / lineLength) * lineLength * cEnd; // 缩短 source 的 y 坐标
            }
            // console.log("fingerAdjustedX:", fingerAdjustedX);
            // console.log("sourceAdjustedX:", sourceAdjustedX);

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
        // // 添加图例框
        // const legendBoxWidth = 200; // 图例框的宽度
        // const legendBoxHeight = legendSpacing * 8 + 30; // 图例框的高度，包含标题和内容
        // const legendBoxX = legendX - 30; // 框的x位置，略微向左偏移
        // const legendBoxY = legendY - 40; // 框的y位置，略微向上偏移

        // // 绘制图例背景框
        // svgContent += `
        // <rect x="${legendBoxX}" y="${legendBoxY}" width="${legendBoxWidth}" height="${legendBoxHeight}" fill = "white" stroke="gray" stroke-width="2" rx="10" ry="10" />`;

        // // 添加图例标题
        // svgContent += `
        // <!-- 图例标题 -->
        // <text x="${legendX - 10}" y="${legendY - 20}" font-size="16" fill="black" text-anchor="start">图例</text>`;

        // 普通链内节点 - 淡蓝色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY + legendSpacing}" r="${circleLegendRadius}" fill="lightblue" />
        <text x="${legendX + 30}" y="${legendY + legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">普通链内节点</text>`;

        // 文件水印节点 - 淡绿色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY + 2 * legendSpacing}" r="${circleLegendRadius}" fill="lightgreen" />
        <text x="${legendX + 30}" y="${legendY + 2 * legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">文件指纹节点</text>`;

        // 追溯节点 - 橙色球
        svgContent += `
        <circle cx="${legendX + 10}" cy="${legendY + 3 * legendSpacing}" r="${circleLegendRadius}" fill="orange" />
        <text x="${legendX + 30}" y="${legendY + 3 * legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">追溯节点</text>`;

        // // 水印及追溯节点 - 黄色球
        // svgContent += `
        // <circle cx="${legendX + 10}" cy="${legendY + 3 * legendSpacing}" r="${circleLegendRadius}" fill="yellow" />
        // <text x="${legendX + 30}" y="${legendY + 3 * legendSpacing + 5}" font-size="14" fill="black" text-anchor="start">指纹及追溯节点</text>`;

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

const ref1 = ref() //漫游式引导的三个按钮
const ref2 = ref()
const ref3 = ref()
const open = ref(false)
const btnRef = ref()
</script>


<template>
    <div class="check">

        <el-dialog v-model="dialogVisible" title="文件详细信息" width="40%" :before-close="handleClose">
            <div>
                <el-input type="textarea" v-model="filedata" disabled />
            </div>
        </el-dialog>


        <el-card>
            <div class="right-align">
            <el-button ref="btnRef" type="danger" @click="open = true" plain round>帮助</el-button>
        </div>
            <el-row justify="center" style="align-items: center;" :gutter="20">
                <!-- <el-col :span="20"> -->
                    <div class="header">
                        <div style="display: flex;justify-content: center;">
                            <el-upload v-model:file-list="fileList" class="upload-demo" action="" :limit="1"
                                style="display: flex;width: 500px;" :on-success="handleAvatarSuccess"
                                :on-remove="handleRemove" :before-upload="beforeUpload" :on-preview="handlePreview">
                                <el-button ref="ref1" type="primary">上传文件</el-button>
                            </el-upload>

                        </div>
                        <div style="display: flex;justify-content: center;margin: 16px 0;">
                            <div style="width: 500px;display: flex;">
                                <el-button ref="ref2" type="success" @click="fingerprints()">提取指纹</el-button>
                                <el-input style="width: 300px;margin-left: 20px" v-model="finger"></el-input>
                            </div>
                        </div>
                        <div style="display: flex;justify-content: center;margin: 16px 0;">
                            <div style="width: 800px;display: flex;">
                                <el-text class="mx-1 text-box" style="font-weight: bold;">文件来源选择</el-text>
                                <el-radio-group class="ml-4" style="margin-left: 20px;" v-model="radio">
                                    <el-radio label="A">车企A</el-radio>
                                    <el-radio label="B">车企B</el-radio>
                                    <el-radio label="C">设备制造商C</el-radio>
                                    <el-radio label="D">电网企业D</el-radio>
                                    <el-radio label="E">充电设备运营商E</el-radio>
                                    <el-radio label="F">公开</el-radio>
                                </el-radio-group>
                            </div>
                        </div>
                        <div style="display: flex;justify-content: center;margin: 16px 0;">
                            <el-button ref="ref3" type="warning" @click="trace()"
                                :disabled="!radio">权限核验与链上追溯</el-button>
                        </div>
                    </div>
                <!-- </el-col> -->
                <!-- <el-col :span="1" style="text-align: left;"> -->
                    
                <!-- </el-col> -->
            </el-row>


        </el-card>

        <el-tour v-model="open">
            <el-tour-step :target="ref1?.$el" title="第一步" description="上传你想要追溯的csv文件" />
            <el-tour-step :target="ref2?.$el" title="第二步" description="点击后即开始提取指纹，请耐心等待效用分析结果出来后，再进行链上追溯。" />
            <el-tour-step :target="ref3?.$el" title="第三步" description="选择你怀疑的泄漏节点后，点击按钮即可查看到该节点的上下游节点信息。" />
        </el-tour>

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

    .text-box {
  background-color: #f0f4ff; /* 背景颜色 */
  padding: 5px 10px; /* 内边距，控制背景框大小 */
  border-radius: 8px; /* 圆角 */
  display: inline-block; /* 保证背景框包裹文本内容 */
  border: 1px solid #d4e3ff; /* 可选：加一个边框 */
}

.right-align {
  display: flex;
  justify-content: flex-end;
}


}
</style>
