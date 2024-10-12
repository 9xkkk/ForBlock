<template>
    <div>
      <!-- Header -->
      <el-card class="header-card">
        <div style="text-align: center; padding: 10px;">
          <h1>模型训练&效用分析</h1>
        </div>
      </el-card>
  
      <!-- Buttons -->
        <el-row type="flex" justify="center" style="padding: 20px;">
          <el-button type="primary">上传文件</el-button>
          <el-button type="success">模型训练</el-button>
        </el-row>
    
  
      <!-- Chart and Download -->
      <el-row :gutter="20" type="flex" style="margin-top: 20px;">
        <!-- Chart Card -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div slot="header" class="clearfix">
              <el-button-group>
                <el-button type="primary" @click="activeTab = 'chart'">模型对比</el-button>
                <el-button type="primary" @click="activeTab = 'table'">详细数据</el-button>
              </el-button-group>
            </div>
            <div v-if="activeTab === 'chart'" style="height: 400px;">
              <!-- 这里可以插入柱状图的代码，例如使用ECharts -->
              <h2>柱状图</h2>
            </div>
            <div v-if="activeTab === 'table'">
              <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="classifier" label="分类器" width="180"></el-table-column>
                <el-table-column prop="accuracy" label="准确率" width="180"></el-table-column>
                <el-table-column prop="error" label="误差"></el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
  
        <!-- Download Card -->
        <el-col :span="12">
        <el-card class="download-card">
          <div slot="header" class="clearfix">
            <span>模型下载</span>
          </div>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24" v-for="model in models" :key="model.name">
              <el-row type="flex" justify="space-between" style="margin-bottom: 10px;">
                <div>{{ model.name }}</div>
                <el-button type="primary" style="margin-left: auto;">下载</el-button>
              </el-row>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import {
    ElCard,
    ElRow,
    ElCol,
    ElButton,
    ElTable,
    ElTableColumn,
    ElButtonGroup
  } from 'element-plus';
  
  const activeTab = ref('chart');
  const tableData = ref([
    // 这里可以填充表格数据
  ]);
  const models = ref([
    { name: 'Original Data Model' },
    { name: 'Perturbed Data Model' },
    // 更多模型...
  ]);
  </script>
  
  <style scoped>
  .header-card {
    margin-bottom: 20px;
    text-align: center;
  }
  
  .button-card,
  .chart-card,
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