<template>
  <div>
    <!-- Header -->
    <el-row justify="center">
      <el-col :span="12">
        <el-card class="header-card">
          <div style="text-align: center; padding: 10px;">
            <h1>模型训练 &nbsp & &nbsp 效用分析</h1>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Buttons -->
    <el-row type="flex" justify="center" style="padding: 20px;">
      <el-col :span="12">
        <el-upload v-model:file-list="fileList" class="upload-demo" action="" :limit="1"
          style="display: flex;width: 500px;" :on-success="handleAvatarSuccess" :on-remove="handleRemove"
          :before-upload="beforeUpload" :on-preview="handlePreview">
          <el-button type="primary">上传文件</el-button>
        </el-upload>
      </el-col>
      <el-col :span="12">
        <div style="width: 500px;display: flex;">
          <el-button type="success" @click="modelTrain()">模型训练</el-button>

        </div>
        <!-- <el-button type="success">模型训练</el-button> -->
      </el-col>
    </el-row>


    <!-- Chart and Download -->
    <el-row style="margin-top: 20px;">
      <!-- Chart Card -->
      <el-col :span="24">
        <el-card class="chart-card">
          <el-tabs v-model="modelCmp" class="" @tab-click="handleTabClick">
            <el-tab-pane label="模型对比" name="modelCmp">
              <Bar v-if="loaded" :data="chartData" :options="chartOptions" />
            </el-tab-pane>
            <el-tab-pane label="详细数据" name="detaillyData">
              <BarChart :chartOptions="newChartOptions" style="height: 400px;" />
              I am details chart
              <!-- <el-table :data="tableData" style="width: 100%">
              <el-table-column prop="classifier" label="分类器" width="180"></el-table-column>
              <el-table-column prop="accuracy" label="准确率" width="180"></el-table-column>
              <el-table-column prop="error" label="误差"></el-table-column>
              </el-table> -->
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

    </el-row>
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
  ElLoading
} from 'element-plus';
import axios from 'axios'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const loaded = ref(false); // 控制图表加载动画
  const activeTab = ref('model'); //初始值为模型对比
  const chartRef = ref(null);
  // chartData 和 chartOptions 定义
  const chartData = reactive({
    labels: ['Random Forest', 'Logistic Regression', 'Linear Regression', 'RBF SVM', 'K-Nearest Neighbors', 'Decision Tree', 'Neural Network'],
    datasets: [
      {
        label: '原始准确率',
        backgroundColor: '#5470c6',
        data: [], // 初始为空，稍后用后端数据更新
      },
      {
        label: '扰动准确率',
        backgroundColor: '#fac858',
        data: [], // 初始为空，稍后用后端数据更新
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


    axios.get(`/utility/train_analysis`).then(res => {
      console.log(res);    // 如果请求成功，打印响应对象以查看服务器返回的数据
      //服务器返回的数据格式：
      // {
      //   "Accuracy": [[0.1,0.2,...],[0.01,0.02,...]], 
      //   "Node": "self"
      // }
      // 获取图表数据
      const accuracyData1 = res.data.Accuracy[0]; // 第一组准确率
      const accuracyData2 = res.data.Accuracy[1]; // 第二组准确率
      updateChart(accuracyData1, accuracyData2);
      // 延迟关闭loading
      setTimeout(() => {
        loading.close()
      }, 3000)
    }).catch((err) => {
      console.error('Error fetching model data:', err);

    })
  }

// 更新图表数据
const updateChart = (accuracyData1, accuracyData2) => {
    chartData.datasets[0].data = accuracyData1; // 设置第一组准确率
    chartData.datasets[1].data = accuracyData2; // 设置第二组准确率
    console.log('更新后的 chartData:', chartData.datasets);
    loaded.value = true
    
  };

</script>

<style scoped>
.header-card {
  background-color: #F2F6FC;
  margin-bottom: 10px;
  border-radius: 16px;
}

.button-card,
.chart-card {
  width: 70%;

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
</style>