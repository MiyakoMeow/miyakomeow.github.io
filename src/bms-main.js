import { createApp } from 'vue'
import './styles/main.css'
import StarryBackground from './components/StarryBackground.vue'
import BMSTable from './components/BMSTable.vue'

// 从URL路径获取表格类型
function getTableTypeFromPath() {
  const path = window.location.pathname
  if (path.includes('self-table-dp')) {
    return 'dp'
  }
  return 'sp' // 默认为sp
}

// 根据表格类型获取标题
function getTitleFromTableType(tableType) {
  return tableType === 'dp'
    ? 'MiyakoMeow谱面合集（DP）'
    : 'MiyakoMeow谱面合集（SP）'
}

const tableType = getTableTypeFromPath()
const title = getTitleFromTableType(tableType)

const app = createApp({
  components: {
    StarryBackground,
    BMSTable
  },
  setup() {
    return {
      title,
      tableType
    }
  },
  template: `
    <div>
      <StarryBackground />
      <main class="container">
        <BMSTable :title="title" :table-type="tableType" />
      </main>
    </div>
  `
})

// 添加全局样式
const style = document.createElement('style')
style.textContent = `
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }
  }
`
document.head.appendChild(style)

app.mount('#app')
