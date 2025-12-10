<template>
  <div v-if="shouldShow && levelRefData.length > 0" class="rank-reference-section">
    <h3>难度对照表</h3>
    <div class="rank-reference-tables">
      <!-- 左边表格 -->
      <div class="rank-reference-left">
        <table>
          <thead>
            <tr>
              <th>难度等级</th>
              <th>对应难度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in leftTableData" :key="item.level">
              <td>{{ item.level }}</td>
              <td>{{ item.ref }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 右边表格 -->
      <div class="rank-reference-right">
        <table>
          <thead>
            <tr>
              <th>难度等级</th>
              <th>对应难度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rightTableData" :key="item.level">
              <td>{{ item.level }}</td>
              <td>{{ item.ref }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

interface LevelRefItem {
  level: string;
  ref: string;
}

interface Props {
  headerUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  headerUrl: "",
});

const levelRefData = ref<LevelRefItem[]>([]);
const shouldShow = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

// 计算左边表格数据（前半部分）
const leftTableData = computed(() => {
  const data = levelRefData.value;
  const midIndex = Math.ceil(data.length / 2);
  return data.slice(0, midIndex);
});

// 计算右边表格数据（后半部分）
const rightTableData = computed(() => {
  const data = levelRefData.value;
  const midIndex = Math.ceil(data.length / 2);
  return data.slice(midIndex);
});

// 构建 level-ref.json 的 URL
const buildLevelRefUrl = (headerUrl: string): string => {
  try {
    // 使用 URL 构造函数处理相对/绝对路径
    const baseUrl = new URL(headerUrl, window.location.href);

    // 替换文件名从 header.json 到 level-ref.json
    const pathParts = baseUrl.pathname.split("/");
    pathParts[pathParts.length - 1] = "level-ref.json";
    baseUrl.pathname = pathParts.join("/");

    return baseUrl.toString();
  } catch (err) {
    console.error("构建 level-ref.json URL 失败:", err);
    return "";
  }
};

// 加载 level-ref.json 数据
const loadLevelRefData = async () => {
  if (!props.headerUrl) {
    shouldShow.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const levelRefUrl = buildLevelRefUrl(props.headerUrl);
    if (!levelRefUrl) {
      shouldShow.value = false;
      return;
    }

    const response = await fetch(levelRefUrl);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        levelRefData.value = data;
        shouldShow.value = true;
      } else {
        console.warn("level-ref.json 格式不正确，应为数组");
        shouldShow.value = false;
      }
    } else if (response.status === 404) {
      // 文件不存在，不显示该组件
      shouldShow.value = false;
    } else {
      throw new Error(`加载失败: ${response.status} ${response.statusText}`);
    }
  } catch (err) {
    console.error("加载难度对照表数据失败:", err);
    error.value = err instanceof Error ? err.message : "未知错误";
    shouldShow.value = false;
  } finally {
    loading.value = false;
  }
};

// 监听 headerUrl 变化
watch(
  () => props.headerUrl,
  (newUrl) => {
    if (newUrl) {
      loadLevelRefData();
    }
  },
  { immediate: true }
);

// 初始加载
onMounted(() => {
  if (props.headerUrl) {
    loadLevelRefData();
  }
});
</script>

<style lang="postcss" scoped>
@reference "tailwindcss";

.rank-reference-section {
  @apply mt-8 mb-8 p-6 bg-black/20 rounded-[15px] border border-white/10;

  @media (max-width: 768px) {
    @apply p-4 mt-6 mb-6;
  }
}

.rank-reference-section {
  h3 {
    @apply text-white mt-0 mb-6 text-[1.3rem] text-center;
  }
}

.rank-reference-tables {
  @apply flex gap-8 justify-center;

  @media (max-width: 768px) {
    @apply gap-4;
  }
}

.rank-reference-left,
.rank-reference-right {
  @apply flex-1 min-w-0;

  table {
    @apply w-full border-collapse bg-white/5 rounded-[10px] overflow-hidden;
  }

  th {
    @apply bg-[rgba(100,181,246,0.3)] text-white px-4 py-3 text-left font-semibold border-b-2 border-white/10;
  }

  td {
    @apply px-4 py-3 border-b border-white/5 text-white/90;
  }

  tbody tr {
    &:hover {
      @apply bg-white/5;
    }
    &:last-child td {
      @apply border-b-0;
    }
  }

  @media (max-width: 768px) {
    th,
    td {
      @apply px-3 py-2 text-[0.9rem];
    }
  }
}
</style>
