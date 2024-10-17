<template>
  <Bar id="my-chart-id" :options="chartOptions" :data="chartData" ref="chartRef" />
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {  ref } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// 接收父组件传来的 chartData 和 chartOptions
const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({}),
  }
});

// 创建一个 ref 用于 Chart.js 实例
const chart = ref(null);
defineExpose({ chart });  // 暴露 chart 引用

</script>