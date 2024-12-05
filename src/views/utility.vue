<template>
  <div>
    <!-- Header -->
    <el-card>
      <div class="right-align">
      <el-button ref="btnRef" type="danger" @click="open = true" plain round>帮助</el-button>
      </div>
    <el-row justify="center" style="align-items: center;" :gutter="20">
      
      
   
      <el-col :span="8">
        <el-card class="header-card" shadow="hover">
          <div style="text-align: center; padding: 10px;">
            <h1 style="font-size: 20px;">模型训练 &nbsp & &nbsp 效用分析</h1>
          </div>
        </el-card>
      </el-col>
      <!-- <el-col :span="1" style="text-align: left;"> -->
        
        <!-- <el-tour v-model="open">
          <el-tour-step title="Center"
            description="你可以对你获取的文件进行效用分析。使用方式：上传你想分析效用的csv文件，点击“模型训练”按钮，等待效用分析结果出来后，再进行模型选择和下载。" />
        </el-tour> -->
      <!-- </el-col> -->
    </el-row>


    <!-- Buttons -->
    <el-row justify="space-evenly" style="margin-top: 20px;">
      <el-space>
        <el-col :span="6" :offset="16">
          <el-upload v-model:file-list="fileList" class="upload-demo" action="" :limit="1"
            style="display: flex;width: 500px;" :on-success="handleAvatarSuccess" :on-remove="handleRemove"
            :before-upload="beforeUpload" :on-preview="handlePreview">
            <el-button ref="ref1" type="primary">上传文件</el-button>
          </el-upload>
        </el-col>
        <el-col :span="6" :offset="3">
          <div style="width: 500px;display: flex;">
            <el-button ref="ref2" type="success" @click="modelTrain()">模型训练</el-button>
          </div>
        </el-col>
      </el-space>
    </el-row>
  </el-card>




    <!-- Chart and Download -->
    <el-row style="margin-top: 20px;" :gutter="10">
      <!-- Chart Card -->
      <el-col :span="18">
        <el-card class="chart-card" shadow="hover">
          <el-tabs v-model="activeTab" class="" @tab-click="handleTabClick">
            <el-tab-pane label="模型对比" name="modelCmp">
              <Bar v-if="loaded" :data="chartData" :options="chartOptions" />
            </el-tab-pane>
            <el-tab-pane label="详细数据" name="detaillyData">
              <Bar v-if="loaded" :data="detailData" :options="chartOptions" />
              <!-- <el-table :data="tableData" style="width: 100%">
              <el-table-column prop="classifier" label="分类器" width="180"></el-table-column>
              <el-table-column prop="accuracy" label="准确率" width="180"></el-table-column>
              <el-table-column prop="error" label="误差"></el-table-column>
              </el-table> -->
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :span="6">
        <!-- Download Card -->
        <el-card class="download-card" shadow="hover">
          <el-form :inline="true" :model="formInline" class="demo-form-inline" >
            <el-form-item width="100px" label="请选择模型：">
              <el-select v-model="formInline.modelSelect" placeholder="Model List" clearable >
                <el-option label="Random Forest" value="Random_Forest_model" />
                <el-option label="Logistic Regression" value="Logistic_Regression_model" />
                <el-option label="Linear Regression" value="Linear_SVM_model" />
                <el-option label="RBF SVM" value="RBF_SVM_model" />
                <el-option label="K-Nearest Neighbors" value="K-Nearest_Neighbors_model" />
                <el-option label="Decision Tree" value="Decision_Tree_model" />
                <!-- <el-option label="Neural Network" value="Neural_Network_model" /> -->
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button ref="ref3" style="margin-left: 20px" type="warning" @click="downloadModel">下载</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-tour v-model="open">
      <el-tour-step :target="ref1?.$el" title="第一步" description="上传你想分析效用的csv文件" />
      <el-tour-step :target="ref2?.$el" title="第二步" description="点击后即开始模型训练，请耐心等待效用分析结果出来后，再进行模型选择和下载。" />
      <el-tour-step :target="ref3?.$el" title="你可以在这里进行模型下载" description="请耐心等待效用分析结果出来后，再进行模型选择和下载。" />
    </el-tour>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import {
  ElCard,
  ElRow,
  ElCol,
  ElButton,
  ElMessage,
  ElMessageBox,
  ElLoading,
  ElTour,
  ElTourStep
} from 'element-plus';
import axios from 'axios'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
// import { de } from 'element-plus/es/locales.mjs'


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
const formInline = reactive({
  modelSelect: ''
})
const loaded = ref(false); // 控制图表加载动画
const activeTab = ref('modelCmp'); //初始值为模型对比
const chartRef = ref(null);
// chartData 和 chartOptions 定义
const chartData = reactive({
  labels: ['Random Forest', 'Logistic Regression', 'Linear Regression', 'RBF SVM', 'K-Nearest Neighbors', 'Decision Tree'],
  datasets: [
    {
      label: '原始准确率',
      backgroundColor: '#5470c6',
      data: [], // 初始为空，稍后用后端数据更新
      borderRadius: 10, // 添加圆角
    },
    {
      label: '扰动准确率',
      backgroundColor: '#fac858',
      data: [], // 初始为空，稍后用后端数据更新
      borderRadius: 10, // 添加圆角
    }
  ]
});

const detailData = reactive({
  labels: ['Random Forest', 'Logistic Regression', 'Linear Regression', 'RBF SVM', 'K-Nearest Neighbors', 'Decision Tree'],
  datasets: [
    {
      label: '扰动前W_Precision',
      backgroundColor: '#E67E22',
      data: [],
      borderRadius: 5, // 添加圆角
    },
    {
      label: '扰动后W_Precision',
      backgroundColor: '#F39C12',
      data: [],
      borderRadius: 5, // 添加圆角
    },
    {
      label: '扰动前W_Recall',
      backgroundColor: '#27AE60',
      data: [],
      borderRadius: 5, // 添加圆角
    },
    {
      label: '扰动后W_Recall',
      backgroundColor: '#2ECC71',
      data: [],
      borderRadius: 5, // 添加圆角
    },
    {
      label: '扰动前W_F1',
      backgroundColor: '#3498DB',
      data: [],
      borderRadius: 5, // 添加圆角
    },
    {
      label: '扰动后W_F1',
      backgroundColor: '#5DADE2',
      data: [],
      borderRadius: 5, // 添加圆角
    }
  ]
});


const chartOptions = ref({
  responsive: true,
  scales: {
    x: { stacked: false },
    y: { beginAtZero: true, max: 1 }, // 假设准确率在 0 到 1 之间
  },
  plugins: { legend: { display: true } }
});

const myChart = ref(null); // 图表引用
const type = ref('');
const fileList = ref([]);
const Node = ref('');
const ref1 = ref() //漫游式引导的三个按钮
const ref2 = ref()
const ref3 = ref()
const open = ref(false)
const btnRef = ref()
// 上传文件
const beforeUpload = (file) => {
  console.log('点击上传');
  axios.post("/utility/upload3", {
    "FileAnalysis": file
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
    console.error('Upload failed:', err);
    ElMessage({
      message: '上传失败',
      type: 'warning',
    })
  })
}

// 模型训练
const modelTrain = () => {
  console.log('点击训练');

  //组件loading
  const loading = ElLoading.service({
    lock: true,
    text: '模型训练中，请稍后...',
    background: 'rgba(0, 0, 0, 0.7)',
  })


  axios.get(`/utility/train_analysis?timestamp=${new Date().getTime()}`).then(res => {
    console.log(res);    // 如果请求成功，打印响应对象以查看服务器返回的数据
    const accuracyData1 = res.data.Accuracy[0]; // 第一组准确率
    const accuracyData2 = res.data.Accuracy[1]; // 第二组准确率
    Node.value = res.data.Node; // 节点类型
    const W_F1_1 = res.data.W_F1[0];
    const W_F1_2 = res.data.W_F1[1];
    const W_Precision_1 = res.data.W_Precision[0];
    const W_Precision_2 = res.data.W_Precision[1];
    const W_Recall_1 = res.data.W_Recall[0];
    const W_Recall_2 = res.data.W_Recall[1];
    updateChart(accuracyData1, accuracyData2, W_F1_1, W_F1_2, W_Precision_1, W_Precision_2, W_Recall_1, W_Recall_2);
    // 延迟关闭loading
    setTimeout(() => {
      loading.close()
    }, 3000)
  }).catch((err) => {
    console.error('Error fetching model data:', err);

  })
}

// 更新图表数据
const updateChart = (accuracyData1, accuracyData2, W_F1_1, W_F1_2, W_Precision_1, W_Precision_2, W_Recall_1, W_Recall_2) => {
  chartData.datasets[0].data = accuracyData1; // 设置第一组准确率
  chartData.datasets[1].data = accuracyData2; // 设置第二组准确率
  detailData.datasets[4].data = W_F1_1; // 设置第一组W_F1
  detailData.datasets[5].data = W_F1_2;
  detailData.datasets[0].data = W_Precision_1; // 设置第一组W_Precision
  detailData.datasets[1].data = W_Precision_2;
  detailData.datasets[2].data = W_Recall_1; // 设置第一组W_Recall
  detailData.datasets[3].data = W_Recall_2;
  console.log('更新后的 detailData:', detailData.datasets);
  console.log('更新后的 chartData:', chartData.datasets);
  loaded.value = true
};

const downloadModel = () => {
  console.log('选择的模型是:', formInline.modelSelect);
  //选择的模型：formInline.modelSelect
  if (!formInline.modelSelect) {
    ElMessage.error("请选择一个模型进行下载！")
    return
  }
  axios({
    method: 'get',
    url: `/utility/download/${formInline.modelSelect}/${Node.value}`,  // 使用选中的模型构造下载 URL
    responseType: 'blob'
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${formInline.modelSelect}.pkl`)  // 下载的是pkl文件
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }).catch((error) => {
    console.error("下载失败", error)
    ElMessage.error("上传文件训练完后才可进行模型下载！")
  })
}


</script>

<style scoped>
.header-card {
  background-color: #F2F6FC;
  margin-bottom: 10px;
  border-radius: 16px;
}

.button-card,
.chart-card {
  width: 100%;

}

.download-card {
  margin-bottom: 20px;
}

.chart-card,
.download-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.el-row {
  width: 100%;
}

.el-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.demo-form-inline .el-select {
  --el-select-width: 210px;
}

.right-align {
  display: flex;
  justify-content: flex-end;
}
</style>