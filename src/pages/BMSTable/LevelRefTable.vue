<template>
  <div v-if="shouldShow" class="rank-reference-section">
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
            <tr>
              <td>-5</td>
              <td>☆1-☆2</td>
            </tr>
            <tr>
              <td>-4</td>
              <td>☆3-☆4</td>
            </tr>
            <tr>
              <td>-3</td>
              <td>☆5-☆6</td>
            </tr>
            <tr>
              <td>-2</td>
              <td>☆7-☆8</td>
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
            <tr>
              <td>-1</td>
              <td>☆9-☆10</td>
            </tr>
            <tr>
              <td>0</td>
              <td>☆11-☆12（sl0）</td>
            </tr>
            <tr>
              <td>1-12</td>
              <td>sl1-12 + st0下</td>
            </tr>
            <tr>
              <td>13-24</td>
              <td>st0上 + st1-12</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  shouldShow?: boolean;
}

defineProps<Props>();
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
