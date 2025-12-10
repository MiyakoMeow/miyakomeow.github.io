<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import BlogLayout from "../layout/BlogLayout.vue";
import GroupedTablesSection from "./BMSTableMirror/GroupedTablesSection.vue";
import "../styles/main.pcss";
import QuickActions from "../components/QuickActions.vue";
import "./BMSTableMirror.pcss";

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
  dir_name?: string;
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

async function copyTables(): Promise<void> {
  await copySelected(tablesJsonPath);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
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
const selectedMap = ref<Record<string, boolean>>({});

const selectedCount = computed(() => Object.values(selectedMap.value).filter(Boolean).length);
const totalCount = computed(() => tables.value.length);

const selectedMirrorArray = computed<string[]>(() =>
  Object.entries(selectedMap.value)
    .filter(([, v]) => !!v)
    .map(([url]) => url)
);

const urlToOrigin = computed<Map<string, string>>(() => {
  const m = new Map<string, string>();
  tables.value.forEach((t) => {
    if (t.url) {
      m.set(t.url, t.url_ori || "");
    }
  });
  return m;
});

const selectedOriginArray = computed<string[]>(() =>
  selectedMirrorArray.value.map((u) => urlToOrigin.value.get(u) || "").filter((v) => v.length > 0)
);

const tooltipMirror = computed(() => JSON.stringify(selectedMirrorArray.value, null, 2));
const tooltipOrigin = computed(() => JSON.stringify(selectedOriginArray.value, null, 2));

async function copySelected(data: string): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(data);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = data;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      await navigator.clipboard.writeText(textarea.value);
      document.body.removeChild(textarea);
    }
  } catch {}
}

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

    const dir = String(item.dir_name || "").replace(/^\/+|\/+$/g, "");
    if (dir) {
      item.url = `/bms/table-mirror/${dir}/`;
    }

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
        <button class="copy-action" type="button" @click="copyTables()">点击复制</button>
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
        <GroupedTablesSection
          :groups="groupedByTags"
          @update:selectedMap="selectedMap = { ...$event }"
        />
      </div>
    </section>
  </BlogLayout>
  <div v-if="selectedCount > 0" class="selection-float">
    <div class="selection-content">
      <div class="selection-summary">已选中 {{ selectedCount }} / {{ totalCount }}</div>
      <div class="selection-actions">
        <button
          class="copy-button mirror-copy"
          type="button"
          :title="tooltipMirror"
          @click="copySelected(JSON.stringify(selectedMirrorArray, null, 2))"
        >
          复制镜像链接
        </button>
        <button
          class="copy-button origin-copy"
          type="button"
          :title="tooltipOrigin"
          @click="copySelected(JSON.stringify(selectedOriginArray, null, 2))"
        >
          复制原链接
        </button>
      </div>
    </div>
  </div>
  <QuickActions />
</template>
