<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import BlogLayout from "../layout/BlogLayout.vue";
import GroupedTablesSection from "./BMSTableMirror/GroupedTablesSection.vue";
import "../styles/main.pcss";
import QuickActions from "../components/QuickActions.vue";

interface LinkItem {
  href: string;
  title: string;
  desc: string;
}

interface MirrorTableItem {
  name: string;
  symbol?: string;
  url: string;
  url_ori?: string;
  comment?: string;
  tag1?: string;
  tag2?: string;
  tag_order?: string | number;
}

interface Tag2Group {
  tag2: string;
  items: MirrorTableItem[];
}

interface Tag1Group {
  tag1: string;
  order: number;
  subgroups: Tag2Group[];
}

const loading = ref(true);
const error = ref<string | null>(null);

const copied = ref(false);
const tablesJsonPath = new URL("/bms/table-mirror/tables.json", window.location.origin).toString();

async function copyTablesJsonUrl(): Promise<void> {
  try {
    const url = tablesJsonPath;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      await navigator.clipboard.writeText(textarea.value);
      document.body.removeChild(textarea);
    }
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    copied.value = false;
  }
}

const links: LinkItem[] = [
  { href: "/bms", title: "返回 BMS", desc: "返回 BMS 页面" },
  {
    href: "https://github.com/MiyakoMeow/bms-table-mirror",
    title: "镜像仓库",
    desc: "查看镜像项目",
  },
];

const tables = ref<MirrorTableItem[]>([]);

const groupedByTags = computed<Tag1Group[]>(() => {
  const groupsMap = new Map<string, { order: number; tag2Map: Map<string, MirrorTableItem[]> }>();

  tables.value.forEach((item) => {
    const tag1 = item.tag1 || "未分类";
    const tag2 = item.tag2 || "其它";
    const orderRaw = item.tag_order;
    const order = typeof orderRaw === "number" ? orderRaw : parseInt(String(orderRaw || "999"), 10);

    if (!groupsMap.has(tag1)) {
      groupsMap.set(tag1, { order, tag2Map: new Map<string, MirrorTableItem[]>() });
    } else {
      const existing = groupsMap.get(tag1)!;
      existing.order = Math.min(existing.order, isNaN(order) ? 999 : order);
    }

    const tag2Map = groupsMap.get(tag1)!.tag2Map;
    if (!tag2Map.has(tag2)) {
      tag2Map.set(tag2, []);
    }

    // 修改item.url
    // 对应`scripts/update-table-mirror.nu`生成的json文件定义的url。
    item.url = item.url.substring("https://miyakomeow.github.io".length);

    tag2Map.get(tag2)!.push(item);
  });

  const tag1Groups: Tag1Group[] = Array.from(groupsMap.entries()).map(
    ([tag1, { order, tag2Map }]) => {
      const subgroups: Tag2Group[] = Array.from(tag2Map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([tag2, items]) => ({
          tag2,
          items: items.sort((x, y) => (x.name || "").localeCompare(y.name || "")),
        }));
      return { tag1, order: isNaN(order) ? 999 : order, subgroups };
    }
  );

  tag1Groups.sort((a, b) => a.order - b.order || a.tag1.localeCompare(b.tag1));
  return tag1Groups;
});

async function loadTablesJson(): Promise<void> {
  try {
    const url = new URL("/bms/table-mirror/tables.json", window.location.origin).toString();
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      throw new Error(`无法加载tables.json: ${res.status}`);
    }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) {
      throw new Error("tables.json 格式错误：不是数组");
    }
    tables.value = data as MirrorTableItem[];
    error.value = null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "未知错误";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  setTimeout(() => {
    loadTablesJson();
  }, 250);
});
</script>

<template>
  <BlogLayout>
    <section class="glass-container bms-index-container">
      <h1 class="content-title">BMS 难度表镜像</h1>

      <div class="page-subtitle usage-subtitle">
        对于BeMusicSeeker用户，可以使用tables.json链接（
        <button class="copy-action" type="button" @click="copyTablesJsonUrl">点击复制</button>
        ），导入难度表清单至BeMusicSeeker。
        <a
          class="copy-action"
          href="https://darksabun.club/table/tablelist.html"
          target="_blank"
          rel="noopener noreferrer"
          >使用教程</a
        >
        <span v-if="copied" class="copy-feedback">已复制</span>
      </div>

      <div class="links-grid">
        <a v-for="link in links" :key="link.href" class="link-card" :href="link.href">
          <div class="link-title">{{ link.title }}</div>
          <div class="link-desc">{{ link.desc }}</div>
        </a>
      </div>

      <div v-if="loading" class="loading-section">正在加载镜像列表...</div>
      <div v-else-if="error" class="error-section">加载失败：{{ error }}</div>
      <div v-else>
        <GroupedTablesSection :groups="groupedByTags" />
      </div>
    </section>
  </BlogLayout>
  <QuickActions />
</template>

<style lang="postcss" scoped>
@reference "tailwindcss";
.links-grid {
  @apply grid grid-cols-[repeat(2,minmax(240px,1fr))] gap-4 mt-4;
  @media (max-width: 768px) {
    @apply grid-cols-1;
  }
}

.link-card {
  @apply block p-[1.25rem] rounded-[14px] bg-black/20 border border-white/10 text-white no-underline;
  transition:
    transform 0.15s ease,
    background 0.3s ease;
  &:hover {
    @apply bg-[rgba(255,255,255,0.06)];
    transform: translateY(-2px);
  }
}

.link-title {
  @apply text-[1.2rem] font-bold mb-[0.5rem] text-[#64b5f6];
}

.link-desc {
  @apply text-[0.95rem] text-white/80;
}

.loading-section {
  @apply mt-6 text-white/80;
}

.error-section {
  @apply mt-6 text-red-300;
}

.page-subtitle {
  @apply text-white/70 text-[1.1rem] italic;
}

.usage-subtitle {
  @apply mt-2;
}

.origin-subtitle {
  @apply mt-2;
}

.copy-action {
  @apply text-[#64b5f6] underline cursor-pointer bg-transparent border-0 p-0 m-0 font-medium;
}

.copy-action {
  &:hover {
    @apply text-[#42a5f5];
  }
}

.copy-feedback {
  @apply ml-2 text-[#4caf50];
}
</style>
