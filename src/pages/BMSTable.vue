<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import StarryBackground from "../components/StarryBackground.vue";

// 从URL路径获取表格类型
function getTableTypeFromPath() {
    const path = window.location.pathname;
    if (path.includes("self-table-dp")) {
        return "dp";
    }
    return "sp"; // 默认为sp
}

// 根据表格类型获取标题
function getTitleFromTableType(tableType) {
    return tableType === "dp"
        ? "MiyakoMeow谱面合集（DP）"
        : "MiyakoMeow谱面合集（SP）";
}

const tableType = ref(getTableTypeFromPath());
const title = computed(() => getTitleFromTableType(tableType.value));

// 加载状态管理
const loadingState = reactive({
    isLoading: true,
    progress: 0,
    currentStep: "正在初始化...",
    totalSteps: 4,
});

const tableData = ref(null);
const headerData = ref(null);
const error = ref(null);

// 模拟进度更新
function updateProgress(step, progress) {
    loadingState.currentStep = step;
    loadingState.progress = progress;
}

// 懒加载JSON数据
async function lazyLoadTableData() {
    try {
        updateProgress("正在加载表头信息...", 25);

        // 加载header.json
        const headerResponse = await fetch(
            `/bms/self-table-${tableType.value}/header.json`,
        );
        if (!headerResponse.ok) {
            throw new Error(`无法加载表头信息: ${headerResponse.status}`);
        }
        headerData.value = await headerResponse.json();

        updateProgress("表头信息加载完成", 50);

        // 从header.json中获取data_url
        const dataUrl = headerData.value.data_url;
        if (!dataUrl) {
            throw new Error("表头信息中未找到data_url");
        }

        updateProgress("正在加载谱面数据...", 75);

        // 加载data.json
        const dataResponse = await fetch(
            `/bms/self-table-${tableType.value}/${dataUrl}`,
        );
        if (!dataResponse.ok) {
            throw new Error(`无法加载谱面数据: ${dataResponse.status}`);
        }
        tableData.value = await dataResponse.json();

        updateProgress("数据加载完成", 100);

        // 延迟显示完成状态
        setTimeout(() => {
            loadingState.isLoading = false;
        }, 500);
    } catch (err) {
        error.value = err.message;
        loadingState.isLoading = false;
        console.error("加载BMS表格数据失败:", err);
    }
}

// 计算表格统计数据
const tableStats = computed(() => {
    if (!tableData.value || !Array.isArray(tableData.value)) {
        return {
            totalCharts: 0,
            difficulties: [],
            averageLevel: 0,
        };
    }

    const charts = tableData.value;
    const difficulties = new Set();
    let totalLevel = 0;
    let validLevelCount = 0;

    charts.forEach((chart) => {
        if (chart.level) {
            difficulties.add(chart.level);
            // 尝试解析等级为数字
            const levelNum = parseFloat(chart.level);
            if (!isNaN(levelNum)) {
                totalLevel += levelNum;
                validLevelCount++;
            }
        }
    });

    return {
        totalCharts: charts.length,
        difficulties: Array.from(difficulties).sort((a, b) => {
            // 特殊处理 "???" 等级
            if (a === "???") return 1;
            if (b === "???") return -1;
            return parseFloat(a) - parseFloat(b);
        }),
        averageLevel:
            validLevelCount > 0
                ? (totalLevel / validLevelCount).toFixed(2)
                : "N/A",
    };
});

// 格式化等级显示
function formatLevel(level) {
    if (level === "???") return "???";
    const num = parseFloat(level);
    return isNaN(num) ? level : num.toFixed(1);
}

// 获取难度颜色
function getDifficultyColor(level) {
    if (level === "???") return "#ff6b6b";

    const num = parseFloat(level);
    if (isNaN(num)) return "#64b5f6";

    if (num <= 0) return "#4caf50"; // 绿色 - 简单
    if (num <= 5) return "#ff9800"; // 橙色 - 中等
    if (num <= 10) return "#f44336"; // 红色 - 困难
    return "#9c27b0"; // 紫色 - 超难
}

// 获取谱面显示信息
function getChartDisplayInfo(chart) {
    return {
        title: chart.title || "未知标题",
        // 如果没有artist字段，尝试从title中提取
        artist:
            chart.artist || extractArtistFromTitle(chart.title) || "未知艺术家",
        // 如果没有difficulty字段，使用level作为难度显示
        difficulty: chart.difficulty || formatLevel(chart.level) || "未知",
        level: chart.level || "N/A",
        // 如果没有bpm字段，显示N/A
        bpm: chart.bpm || "N/A",
        subtitle: chart.subtitle || null,
        // 其他可能存在的字段
        sha256: chart.sha256,
        md5: chart.md5,
    };
}

// 从标题中尝试提取艺术家信息（如果有 - 分隔）
function extractArtistFromTitle(title) {
    if (!title) return null;
    const parts = title.split(" - ");
    return parts.length > 1 ? parts[0].trim() : null;
}

onMounted(() => {
    // 延迟开始加载，让用户看到初始状态
    setTimeout(() => {
        lazyLoadTableData();
    }, 300);
});
</script>

<template>
    <div>
        <StarryBackground />
        <main class="container">
            <div class="bms-table-container">
                <h1>{{ title }}</h1>
                <div class="bms-table-content">
                    <!-- 加载状态 -->
                    <div v-if="loadingState.isLoading" class="loading-section">
                        <div class="progress-container">
                            <div class="progress-header">
                                <h3>正在加载BMS表格数据</h3>
                                <div class="progress-percentage">
                                    {{ loadingState.progress }}%
                                </div>
                            </div>

                            <div class="progress-bar">
                                <div
                                    class="progress-fill"
                                    :style="{
                                        width: loadingState.progress + '%',
                                    }"
                                ></div>
                            </div>

                            <div class="progress-steps">
                                <div class="step-info">
                                    <span class="step-label">当前步骤:</span>
                                    <span class="step-text">{{
                                        loadingState.currentStep
                                    }}</span>
                                </div>
                                <div class="step-info">
                                    <span class="step-label">总步骤数:</span>
                                    <span class="step-text">{{
                                        loadingState.totalSteps
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 错误状态 -->
                    <div v-else-if="error" class="error-section">
                        <div class="error-icon">⚠️</div>
                        <h3>加载失败</h3>
                        <p class="error-message">{{ error }}</p>
                        <p>请检查网络连接或稍后重试。</p>
                        <button class="retry-button" @click="lazyLoadTableData">
                            重新加载
                        </button>
                    </div>

                    <!-- 数据展示 -->
                    <div v-else class="data-section">
                        <!-- 表格信息 -->
                        <div class="table-header">
                            <div class="header-info">
                                <h2>表格信息</h2>
                                <div class="header-details">
                                    <p v-if="headerData">
                                        <strong>表格名称:</strong>
                                        {{ headerData.name || "未命名" }}
                                    </p>
                                    <p v-if="headerData">
                                        <strong>表格符号:</strong>
                                        {{ headerData.symbol || "无" }}
                                    </p>
                                </div>
                            </div>

                            <div class="stats-summary">
                                <h3>统计摘要</h3>
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-value">
                                            {{ tableStats.totalCharts }}
                                        </div>
                                        <div class="stat-label">总谱面数</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">
                                            {{ tableStats.difficulties.length }}
                                        </div>
                                        <div class="stat-label">难度等级数</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">
                                            {{ tableStats.averageLevel }}
                                        </div>
                                        <div class="stat-label">平均难度</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 难度分布 -->
                        <div
                            class="difficulty-section"
                            v-if="tableStats.difficulties.length > 0"
                        >
                            <h3>难度分布</h3>
                            <div class="difficulty-tags">
                                <span
                                    v-for="level in tableStats.difficulties"
                                    :key="level"
                                    class="difficulty-tag"
                                    :style="{
                                        backgroundColor:
                                            getDifficultyColor(level),
                                    }"
                                >
                                    {{ formatLevel(level) }}
                                </span>
                            </div>
                        </div>

                        <!-- 谱面表格 -->
                        <div
                            class="charts-table-section"
                            v-if="tableData && tableData.length > 0"
                        >
                            <h3>谱面列表 ({{ tableData.length }} 首)</h3>
                            <div class="table-wrapper">
                                <table class="charts-table">
                                    <thead>
                                        <tr>
                                            <th>标题</th>
                                            <th>艺术家</th>
                                            <th>难度</th>
                                            <th>等级</th>
                                            <th>BPM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="(chart, index) in tableData"
                                            :key="index"
                                        >
                                            <td class="chart-title">
                                                <strong>{{
                                                    getChartDisplayInfo(chart)
                                                        .title
                                                }}</strong>
                                                <div
                                                    v-if="
                                                        getChartDisplayInfo(
                                                            chart,
                                                        ).subtitle
                                                    "
                                                    class="chart-subtitle"
                                                >
                                                    {{
                                                        getChartDisplayInfo(
                                                            chart,
                                                        ).subtitle
                                                    }}
                                                </div>
                                            </td>
                                            <td>
                                                {{
                                                    getChartDisplayInfo(chart)
                                                        .artist
                                                }}
                                            </td>
                                            <td>
                                                <span
                                                    class="difficulty-badge"
                                                    :style="{
                                                        backgroundColor:
                                                            getDifficultyColor(
                                                                chart.level,
                                                            ),
                                                    }"
                                                >
                                                    {{
                                                        getChartDisplayInfo(
                                                            chart,
                                                        ).difficulty
                                                    }}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    class="level-badge"
                                                    :style="{
                                                        backgroundColor:
                                                            getDifficultyColor(
                                                                chart.level,
                                                            ),
                                                    }"
                                                >
                                                    {{
                                                        formatLevel(chart.level)
                                                    }}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="bpm-value">
                                                    {{
                                                        getChartDisplayInfo(
                                                            chart,
                                                        ).bpm
                                                    }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 空状态 -->
                        <div v-else class="empty-state">
                            <div class="empty-icon">📊</div>
                            <h3>暂无谱面数据</h3>
                            <p>表格中没有找到谱面数据。</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style>
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
}

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

/* 加载状态样式 */
.loading-section {
    padding: 2rem;
}

.progress-container {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.progress-header h3 {
    color: white;
    margin: 0;
    font-size: 1.5rem;
}

.progress-percentage {
    background: rgba(100, 181, 246, 0.2);
    color: #64b5f6;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.2rem;
}

.progress-bar {
    height: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4caf50, #64b5f6);
    border-radius: 6px;
    transition: width 0.3s ease;
}

.progress-steps {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.step-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.step-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
}

.step-text {
    color: white;
    font-weight: 500;
}

/* 错误状态样式 */
.error-section {
    text-align: center;
    padding: 3rem;
}

.error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.error-section h3 {
    color: #ff6b6b;
    margin-bottom: 1rem;
}

.error-message {
    background: rgba(255, 107, 107, 0.1);
    padding: 1rem;
    border-radius: 10px;
    margin: 1.5rem 0;
    border-left: 4px solid #ff6b6b;
}

.retry-button {
    background: #64b5f6;
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: background 0.3s ease;
}

.retry-button:hover {
    background: #42a5f5;
}

/* 数据展示样式 */
.data-section {
    padding: 1rem 0;
}

.table-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
}

.header-info h2 {
    color: white;
    margin-top: 0;
    margin-bottom: 1rem;
}

.header-details p {
    margin: 0.5rem 0;
    color: rgba(255, 255, 255, 0.8);
}

.header-details strong {
    color: #64b5f6;
}

.stats-summary h3 {
    color: white;
    margin-top: 0;
    margin-bottom: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #64b5f6;
    margin-bottom: 0.5rem;
}

.stat-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
}

/* 难度分布样式 */
.difficulty-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
}

.difficulty-section h3 {
    color: white;
    margin-top: 0;
    margin-bottom: 1rem;
}

.difficulty-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.difficulty-tag {
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 谱面表格样式 */
.charts-table-section {
    margin-top: 2rem;
}

.charts-table-section h3 {
    color: white;
    margin-bottom: 1rem;
}

.table-wrapper {
    overflow-x: auto;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.charts-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.charts-table th {
    background: rgba(100, 181, 246, 0.2);
    color: white;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.charts-table td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
}

.charts-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.05);
}

.chart-title {
    min-width: 250px;
}

.chart-subtitle {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.25rem;
}

.difficulty-badge,
.level-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    min-width: 60px;
    text-align: center;
}

.bpm-value {
    font-family: monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 600;
}

/* 空状态样式 */
.empty-state {
    text-align: center;
    padding: 3rem;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-state h3 {
    color: white;
    margin-bottom: 1rem;
}

.empty-state p {
    color: rgba(255, 255, 255, 0.7);
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .table-header {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }

    .bms-table-container {
        padding: 1.5rem;
    }

    .bms-table-container h1 {
        font-size: 2rem;
    }

    .progress-steps {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
    }

    .stat-value {
        font-size: 1.5rem;
    }

    .charts-table th,
    .charts-table td {
        padding: 0.75rem;
    }
}

@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .progress-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .progress-percentage {
        align-self: flex-start;
    }
}
</style>
