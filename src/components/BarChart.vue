<!-- <template>
  <Bar id="my-chart-id" :options="chartOptions" :data="chartData" ref="chartRef" />
</template> -->

<script setup>
import { Bar } from 'vue-chartjs'
import {  ref, onMounted, watch } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// 接收父组件传来的 chartData 和 chartOptions
const props = defineProps({
  chartData: {
    type: Object,
    default: null
  },
  chartOptions: {
    type: Object,
    default: null
  }
});

// 创建一个 ref 用于 Chart.js 实例
const chartRef = ref(null);
let chartInstance = null;
// 在组件挂载时渲染图表
onMounted(() => {
  renderChart();
});

// 监听 chartdata 和 options 的变化，更新图表
watch([() => props.chartdata, () => props.options], () => {
  renderChart();
});

// 渲染图表的函数
const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy(); // 销毁旧图表实例
  }

  chartInstance = new ChartJS(chartRef.value, {
    type: 'line',
    data: props.chartData,
    options: props.chartOptions
  });
};

</script>