<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  tableType: {
    type: String,
    default: 'sp' // 'sp' or 'dp'
  }
})

const isLoading = ref(true)
const tableData = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    // 这里可以添加加载BMS表格数据的逻辑
    // 例如：const response = await fetch(`/bms/self-table-${props.tableType}/header.json`)
    // tableData.value = await response.json()

    // 模拟加载延迟
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  } catch (err) {
    error.value = err.message
    isLoading.value = false
  }
})
</script>

<template>
  <div class="bms-table-container">
    <h1>{{ title }}</h1>
    <div class="bms-table-content">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>正在加载BMS表格数据...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>加载失败: {{ error }}</p>
        <p>请检查网络连接或稍后重试。</p>
      </div>

      <div v-else class="table-info">
        <p>BMS表格加载完成！</p>
        <p>表格类型: {{ tableType.toUpperCase() }}</p>
        <p>这是一个BMS表格展示页面，可以在这里展示谱面数据。</p>

        <div class="table-stats">
          <div class="stat-item">
            <span class="stat-label">难度等级:</span>
            <span class="stat-value">-3 到 ???</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">谱面数量:</span>
            <span class="stat-value">待加载</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bms-table-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bms-table-container h1 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.bms-table-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.6;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ff6b6b;
}

.error p {
  margin-bottom: 0.5rem;
}

.table-info {
  padding: 1rem;
}

.table-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  color: #64b5f6;
  font-weight: 500;
}

@media (max-width: 768px) {
  .bms-table-container {
    padding: 1.5rem;
  }

  .bms-table-container h1 {
    font-size: 2rem;
  }

  .table-stats {
    grid-template-columns: 1fr;
  }
}
</style>
