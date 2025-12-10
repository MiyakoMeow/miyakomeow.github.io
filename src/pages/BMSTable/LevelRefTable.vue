<template>
  <div v-if="shouldShow && levelRefData.length > 0" class="rank-reference-section">
    <h3>难度对照表</h3>
    <div class="rank-reference-tables">
      <!-- 左边：负数部分 -->
      <div class="rank-reference-left">
        <table>
          <thead>
            <tr>
              <th>难度等级</th>
              <th>对应难度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in negativeLevels" :key="item.level">
              <td>{{ item.level }}</td>
              <td>{{ item.ref }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 右边：0及以上部分 -->
      <div class="rank-reference-right">
        <table>
          <thead>
            <tr>
              <th>难度等级</th>
              <th>对应难度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in nonNegativeLevels" :key="item.level">
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

// 计算负数等级
const negativeLevels = computed(() => {
  return levelRefData.value.filter((item) => {
    const level = item.level;
    // 检查是否为负数（以"-"开头且不是"0"）
    return level.startsWith("-") && level !== "0";
  });
});

// 计算非负数等级
const nonNegativeLevels = computed(() => {
  return levelRefData.value.filter((item) => {
    const level = item.level;
    // 检查是否为非负数（不以"-"开头或者是"0"）
    return !level.startsWith("-") || level === "0";
  });
});

// 构建 level-ref.json 的 URL
const buildLevelRefUrl = (headerUrl: string): string => {
  try {
    // 如果 headerUrl 是绝对路径，直接使用
    if (
      headerUrl.startsWith("http://") ||
      headerUrl.startsWith("https://") ||
      headerUrl.startsWith("/")
    ) {
      const url = new URL(headerUrl, window.location.href);
      const pathParts = url.pathname.split("/");
      // 移除文件名（header.json）
      pathParts.pop();
      // 添加 level-ref.json
      pathParts.push("level-ref.json");
      url.pathname = pathParts.join("/");
      return url.toString();
    }

    // 如果是相对路径，基于当前页面构建
    const baseUrl = new URL(window.location.href);
    const pathParts = baseUrl.pathname.split("/");
    // 移除当前页面的路径部分
    pathParts.pop();
    // 添加 headerUrl 的目录部分
    const headerParts = headerUrl.split("/");
    headerParts.pop(); // 移除 header.json
    pathParts.push(...headerParts);
    // 添加 level-ref.json
    pathParts.push("level-ref.json");
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
